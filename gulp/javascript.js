var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify'),
    util = require('gulp-util'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('javascript', ['ng-config', 'ng-version', 'pdf-build'], function() {
  return gulp.src(
      gulp.paths.javascript.filter(function(file) {
        return file.endsWith('.js');
      })
    )
    .pipe(plumber())
    .pipe(sourcemaps.init())
      .pipe(concat('bundle.min.js'))
      .pipe(ngAnnotate({
        add: true
      }))
      .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(gulp.paths.build));
});
