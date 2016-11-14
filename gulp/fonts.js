var gulp = require('gulp');

gulp.task('fonts', function() {
    return gulp.src(gulp.paths.fonts)
            .pipe(gulp.dest('dist/fonts/'));
});
