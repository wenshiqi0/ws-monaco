const gulp = require('gulp');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const spawn = require("gulp-spawn");

gulp.task('build', function () {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('./lib'));
});

gulp.task('watch', function () {
  return gulp.watch('./src/**/*', ['build']);
});
