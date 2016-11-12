var gulp = require('gulp');

gulp.task('build', [
  'clean',
  'styles',
  'javascript',
  'vendors',
  'static',
  'fonts'
]);
