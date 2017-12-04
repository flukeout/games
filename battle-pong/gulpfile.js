var gulp         = require('gulp'),
    plumber      = require('gulp-plumber'),
    sass         = require('gulp-sass'),
    replace      = require('gulp-replace');

gulp.task('html', function () {
  gulp.src('index.html')
    .pipe(replace(/<base href=".+">/g, ''))
    .pipe(plumber())
    .pipe(gulp.dest('src/'))
});

gulp.task('css', function () {
  gulp.src('src/scss/style.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./src'))
});

gulp.task('watch', [
  'css', 
  'html', 
  ], function () {
  gulp.watch('src/scss/**/*', ['css']);
  gulp.watch('index.html', ['html']);
});

gulp.task('default', ['watch']);
