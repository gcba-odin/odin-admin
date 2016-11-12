var gulp = require('gulp');

gulp.task('watch', ['serve'], function() {
  // Static Files
  gulp.watch(gulp.paths.static, { interval: 1000 }, ['static-watch', 'vendors']);

  // Vendors
  gulp.watch(gulp.paths.vendors, { interval: 1000 }, ['vendors-watch']);

  // Javascript
  gulp.watch(gulp.paths.javascript, { interval: 1000 }, ['javascript-watch']);

  // Style
  gulp.watch(gulp.paths.styles, { interval: 1000 }, ['styles-watch']);

  // Fonts
  gulp.watch(gulp.paths.fonts, { interval: 1000 }, ['fonts-watch']);
});

// Watch subtasks
gulp.task('static-watch', ['static'], function (done) {
  gulp.browserSync.reload();
  done();
});

// Fonts
gulp.task('fonts-watch', ['fonts'], function (done) {
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

gulp.task('styles-watch', ['styles'], function (done) {
  gulp.browserSync.reload();
  done();
});
