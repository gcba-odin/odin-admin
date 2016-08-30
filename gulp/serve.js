var gulp = require('gulp'),
    connectLogger = require('connect-logger'),
    connectHistoryApiFallback = require('connect-history-api-fallback');

gulp.task('serve', function() {
  return gulp.browserSync.init({
    server: {
      baseDir: '.'
    },
    middleware: [connectLogger(), connectHistoryApiFallback()]
  });
});
