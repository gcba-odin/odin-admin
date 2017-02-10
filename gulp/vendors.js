var gulp = require('gulp'),
    lazypipe = require('lazypipe'),
    plumber = require('gulp-plumber'),
    gulpif = require('gulp-if'),
    ngAnnotate = require('gulp-ng-annotate'),
    useref = require('gulp-useref'),
    sourcemaps = require('gulp-sourcemaps'),
    fs = require('fs'),
    template = require('gulp-template'),
    rename = require('gulp-rename');

gulp.task('vendors', ['static', 'styles'], function() {
    var env = process.env.NODE_ENV || 'local',
        config = require('../config.json');
  return gulp.src(gulp.paths.build + '/index.html')
    .pipe(template({ baseUrl: config[env].BaseHTML5.url }))
    .pipe(plumber())
    .pipe(useref({ searchPath: '.' },
      lazypipe().pipe(sourcemaps.init, { loadMaps: true }))
    )
    .pipe(gulpif('*.js', ngAnnotate({
      add: true
    })))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(gulp.paths.build));
});
