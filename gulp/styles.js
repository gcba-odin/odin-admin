var gulp = require('gulp'),
    lazypipe = require('lazypipe'),
    plumber = require('gulp-plumber'),
    sass = require('gulp-sass'),
    cleanCSS = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    util = require('gulp-util'),
    concatCss = require('gulp-concat-css'),
    del = require('del'),
    useref = require('gulp-useref'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('styles', function() {
    // del.sync([gulp.paths.cleancss]);
    return gulp.src(gulp.paths.styles)
        .pipe(plumber())
        .pipe(useref({
                searchPath: '.'
            },
            lazypipe().pipe(sourcemaps.init, {
                loadMaps: true
            })))
        .pipe(sass())
        //TODO: add autoprefixer
        .pipe(concatCss('styles.min.css'))
        .pipe(rename('styles.min.css'))
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(gulp.paths.build))
        .pipe(gulp.browserSync.stream());
    // gulp.browserSync.reload();
});
