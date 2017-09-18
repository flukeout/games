var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();

gulp.task('sass', function() {
  return gulp.src('style/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('style/'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('watch', ['browserSync', 'sass'], function(){
  gulp.watch('style/**/*.scss', ['sass']); 
  gulp.watch('js/**/*.js');
  gulp.watch('index.html');
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: '.'
    },
  })
});
