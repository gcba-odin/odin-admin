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
    '*.html',
    'plugins/**',
  ],
  build: 'dist',
  javascript: [
    'js/**/*.js',
    'config.json',
  ],
  vendors: [
    'css/**/*',
    'plugins/**',
    'index.html',
  ]
};
