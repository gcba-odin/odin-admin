var gulp = require('gulp');

gulp.task('watch', ['serve'], function() {
  // Static Files
  gulp.watch(gulp.paths.static, ['static-watch']);

  // Vendors
  gulp.watch(gulp.paths.vendors, ['vendors-watch']);

  // Javascript
  gulp.watch(gulp.paths.javascript, ['javascript-watch']);

  // // Style
  // gulp.watch([
  //   'css/**/*.{css,scss}'
  //   ], ['styles']);
});

// Watch subtasks
gulp.task('static-watch', ['static'], function (done) {
  gulp.browserSync.reload();
  done();
});

gulp.task('vendors-watch', ['vendors'], function (done) {
  gulp.browserSync.reload();
  done();
});

gulp.task('javascript-watch', ['javascript'], function (done) {
  gulp.browserSync.reload();
  done();
});
