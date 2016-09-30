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
    'config/*.json',
    'manifest.json',
    '*.html',
    'plugins/**',
    'public/*'
  ],
  build: 'dist',
  cleancss:'dist/styles.min.css',
  javascript: [
    'js/**/*.js',
    'config.json',
  ],
  vendors: [
    // 'css/**/*.scss',
    // 'css/**/*.css',
    // 'css/**/*',
    'plugins/**',
    'index.html',
  ],
  styles: [
    'css/*.scss',
    'css/*.css'
  ]
};
