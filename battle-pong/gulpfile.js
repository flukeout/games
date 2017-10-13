var gulp         = require('gulp'),
    plumber      = require('gulp-plumber'),
    sass         = require('gulp-sass');

// gulp.task('html', function () {
//   gulp.src('src/**/*.html')
//     .pipe(plumber())
//     .pipe(gulp.dest('dist/'))
// });

// gulp.task('assets', function () {
//   gulp.src('src/assets/**/*')
//     .pipe(plumber())
//     .pipe(gulp.dest('dist/assets'))
// });

gulp.task('css', function () {
  gulp.src('src/scss/style.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./'))
});

// Watch asset folder for changes
gulp.task('watch', [
  'css', 
  // 'html', 
  // 'assets'
  ], function () {
  gulp.watch('src/scss/**/*', ['css']);
  // gulp.watch('src/js/**/*', ['webpack']);
  // gulp.watch('src/assets/**/*', ['assets']);
  // gulp.watch('src/**/*', ['html']);
});

gulp.task('default', ['watch']);
