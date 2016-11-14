var gulp = require('gulp');

gulp.paths = {
  static: [
    // 'fonts/**/*',
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
  fonts: [
    'fonts/*.woff',
    'fonts/*.woff2',
    'fonts/*.eot',
    'fonts/*.svg',
    'fonts/*.ttf',
    'fonts/*.otf'
  ],
  styles: [
    'css/*.scss',
    'css/*.css'
    // 'css/angular-date-picker.min.css',
    // 'css/angular-color-picker.css',
    // 'css/ionicons.min.css',
    // 'node_modules/css/font-awesome.min.css',
    // 'css/bootstrap.min.css',
    // 'css/selectize.default.css',
    // 'css/ng-alertify.css',
    // 'css/styles_admin.css',
    // 'css/AdminLTE.css',
    // 'css/main.css',
    // 'css/marca_ba.css',
  ]
};
