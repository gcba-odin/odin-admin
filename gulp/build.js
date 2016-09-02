var gulp = require('gulp');

gulp.task('build', [
  'clean',
  'static',
  'vendors',
  'javascript',
]);
