const { join, dirname } = require('path');
const gulp = require('gulp');
const tsb = require('gulp-tsb');
const es = require('event-stream');
const rimraf = require('rimraf');
const filter = require('gulp-filter');
const glob = require('glob');

const extensionsPath = join(__dirname, './extensions');

const compilations = glob.sync('**/tsconfig.json', {
	cwd: extensionsPath,
	ignore: ['**/out/**', '**/node_modules/**']
});

const tasks = compilations.map(tsconfigFile => {
  const absolutePath = join(extensionsPath, tsconfigFile);
  const relativeDirname = dirname(tsconfigFile);
  const tsOptions = require(absolutePath).compilerOptions;
	tsOptions.verbose = false;
  tsOptions.sourceMap = false;
  
  const name = relativeDirname.replace(/\//g, '-');
  
  // Tasks
	const clean = 'clean-extension:' + name;
	const compile = 'compile-extension:' + name;
	const watch = 'watch-extension:' + name;

	// Build Tasks
	const cleanBuild = 'clean-extension-build:' + name;
	const compileBuild = 'compile-extension-build:' + name;
  const watchBuild = 'watch-extension-build:' + name;
  
  const root = join(__dirname, 'extensions', relativeDirname);
	const srcBase = join(root, 'src');
	const src = join(srcBase, '**');
  const out = join(root, 'out');
    
  function createPipeline(build, emitError) {
    const compilation = tsb.create(tsOptions, null, null, err => console.error(err));
    
    return function () {
      const input = es.through();
      const tsFilter = filter(['**/*.ts', '!**/lib/lib*.d.ts', '!**/node_modules/**'], { restore: true });
      const output = input
      .pipe(tsFilter)
      .pipe(compilation())
      .pipe(tsFilter.restore)

      return es.duplex(input, output);            
    }
  }

  const srcOpts = { cwd: dirname(__dirname), base: srcBase };  

  gulp.task(compile, [clean], () => {
		const pipeline = createPipeline(false, true);
		const input = gulp.src(src, srcOpts);

		return input
			.pipe(pipeline())
			.pipe(gulp.dest(out));
  });
  
  gulp.task(clean, cb => rimraf(out, cb));
  
  return {
		clean: clean,
		compile: compile
	};
})

gulp.task('compile-extensions', tasks.map(t => t.compile));

gulp.task('upload-extensions', () => {
  const filtered = filter(['**', '!**/*.ts', '!**/*.txt', '!**/*.map', '!**/*.md', '!**/src/**', '!**/test/**']);
  return gulp.src('extensions/**')
    .pipe(filtered)
    .pipe(gulp.dest('./out-extensions'))
})
