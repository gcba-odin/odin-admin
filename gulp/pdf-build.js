var gulp = require('gulp'),
        uglify = require('gulp-uglify');
gulp.task('pdf-build', function () {
    return gulp.src('plugins/pdf/**.js')
            .pipe(uglify({mangle: false}))
            .pipe(gulp.dest('dist/plugins/pdf'));
});