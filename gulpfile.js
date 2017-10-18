const gulp = require('gulp');
const gulpSequence = require('gulp-sequence');
const webpack = require('webpack-stream');
const { spawnSync } = require('child_process');
const { readJSONSync } = require('fs-extra');
const { join, dirname, basename, relative } = require('path');
const { readdirSync, mkdirSync, existsSync, rmdirSync, statSync } = require('fs');

const extensions = [];
const extPath = join(__dirname, './extensions');
const distPath = join(__dirname, './out');
const initTask = (ext) => `${ext}-init`;
const clientTask = (ext) => `${ext}-client`;
const serverTask = (ext) => `${ext}-server`;
const installTask = (ext) => `${ext}-install`;

function mkdist() {
  if (!existsSync(distPath)) {
    mkdirSync(distPath);
  } else {
    spawnSync('rm', [ '-rf', distPath]);
    mkdirSync(distPath);
  }
}

function initExtensions () {
  readdirSync('./extensions')
    .forEach((ext) => {
      const local = join(extPath, ext);
      if (statSync(local).isDirectory())
        extensions.push(ext);
    })
}

initExtensions();

const commonConfig = {
  output: {
    libraryTarget: "umd",
  },
  module: {
    loaders: [
      { test: /\.js$/, loader: 'babel-loader' },
    ],
  },
  externals(context, request, callback) {
    let isExternals = false;
    const vendor = ['vscode-textmate', 'eslint', 'typescript', 'vscode', 'jsonc-parser'];
    if (vendor.indexOf(request) > -1 || request.indexOf('typescript') > -1 || request.indexOf('vscode') > -1 || request.indexOf('eslint') > -1) {
      isExternals = request;
    }
    callback(null, isExternals);
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  target: 'electron',
}

// init
extensions.forEach((ext) => {
  mkdist();
  gulp.task(initTask(ext), () => {
    const local = join(extPath, ext);
    const localTo = join(distPath, ext);
    const package = join(local, 'package.json');

    return gulp.src(['./extensions/**/*.json', './extensions/**/*.tmLanguage', '!**/node_modules/**'])
      .pipe(gulp.dest(distPath))
  })
})

// client compile
extensions.forEach((ext) => {
  gulp.task(clientTask(ext), [initTask(ext)], () => {
    const local = join(extPath, ext);
    const packageJson = readJSONSync(join(local, 'package.json'));

    if (!packageJson.main) {
      return gulp.src(local)
        gulp.dest(distPath)
    }

    // client entry
    let client = join(local, packageJson.main);
    const localDist = join(distPath, ext, packageJson.main);

    if (client.indexOf('.js') === -1)
      client += '.js';

    commonConfig.output.filename = basename(client);
    commonConfig.output.path = dirname(client);

    // FIX ME for eslint and ts
    if (ext === 'typescript') {
      return gulp.src(`${dirname(client)}/**`)
        .pipe(gulp.dest(dirname(client.replace('extensions', 'out'))))
    } else if (ext === 'eslint') {
      return gulp.src(relative(__dirname, client))
        .pipe(gulp.dest(dirname(client.replace('extensions', 'out'))))
    } else {
      return gulp.src(relative(__dirname, client))
        .pipe(webpack(commonConfig))
        .pipe(gulp.dest(dirname(client.replace('extensions', 'out'))))
    }
  })
});

// server compile
extensions.forEach((ext) => {
  gulp.task(serverTask(ext), [clientTask(ext)], () => {
    let entry = '';
    const local = join(extPath, ext);
    const packageJson = readJSONSync(join(local, 'package.json'));

    // server entry
    const serverRoot = join(local, 'server');
    if (existsSync(serverRoot) && statSync(serverRoot).isDirectory()) {
      let serverScript = join(serverRoot, 'server.js');
      if (existsSync(serverScript) && statSync(serverScript).isFile()) {
        entry = serverScript;
      } else {
        const serverScript = join(serverRoot, 'out', `${ext}ServerMain.js`);
        if (existsSync(serverScript) && statSync(serverScript).isFile())
          entry = serverScript;
      }
    }

    if (!packageJson.main || !entry) {
      return gulp.src(local)
        gulp.dest(distPath)
    }
    if (entry.indexOf('.js') === -1)
      entry += '.js';

    commonConfig.output.filename = basename(entry);
    commonConfig.output.path = dirname(entry);

    if (ext === 'eslint') {
      return gulp.src(relative(__dirname, entry))
        .pipe(gulp.dest(dirname(entry.replace('extensions', 'out'))))
    } else {
      return gulp.src(relative(__dirname, entry))
        .pipe(webpack(commonConfig))
        .pipe(gulp.dest(dirname(entry.replace('extensions', 'out'))))
    }
  })
});

// install deps
extensions.forEach((ext) => {
  gulp.task(installTask(ext), () => {
    return gulp.src(join(extPath, ext))
      .pipe(gulp.dest(join(distPath)));
  })
});

gulp.task('build-extensions', gulpSequence(...extensions.map(serverTask)));
