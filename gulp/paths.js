var gulp = require('gulp');

gulp.paths = {
  static: [
    'fonts/**/*',
    'images/**/*',
    'img/**/*',
    'uib/**/*',
    'directives/**/*.html',
    'views/**/*.html',
    '*.{svg,png,xml,ico}',
    'manifest.json',
    // TODO: remove from here on
    'bootstrap/**/*',
    'css/**/*',
    'plugins/**/*',
    'index.html',
    'config.html',
    'home.html',
    'login.html',
  ],
  build: 'dist',
  javascript: [
    'js/**/*.js',
    'config.json',
  ],
};
