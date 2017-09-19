const gulp = require('gulp');
const filter = require('gulp-filter');

const array = [
  '**',
  '!**/build/**',
  '!**/test/**',
  '!**/.vscode/**',  
  '!**/node_modules/**',
  '!**/OSSREADME.json',
  '!**/tsconfig.json',
]

gulp.task('js', function() {
  const filtered = filter(array);
  return gulp.src('./extensions/**/*.js')
    .pipe(filtered)
    .pipe(gulp.dest('./lib/buildIn'))
})

gulp.task('json', function() {
  const filtered = filter(array);
  return gulp.src('./extensions/**/*.json')
    .pipe(filtered)
    .pipe(gulp.dest('./lib/buildIn'))
})

gulp.task('tmLanguage', function() {
  const filtered = filter(array);
  return gulp.src('./extensions/**/*.tmLanguage')
    .pipe(filtered)
    .pipe(gulp.dest('./lib/buildIn'))
})

gulp.task('ts', function() {
  const filtered = filter(array);
  return gulp.src('./extensions/**/*.d.ts')
    .pipe(filtered)
    .pipe(gulp.dest('./lib/buildIn'))
})

gulp.task('default', ['json', 'js', 'tmLanguage', 'ts'])