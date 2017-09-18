var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var directoryMap = require('gulp-directory-map');

gulp.task('js', function () {
  gulp.src('js/**/*.js')
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('animations', function () {
  return gulp.src('style/animations/**/*.scss')
    .pipe(directoryMap({
      filename: 'animations.json'
    }))
    .pipe(gulp.dest('style/animations'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('sass', function() {
  return gulp.src(['style/**/*.scss', '!style/animations/**/*.scss'])
    .pipe(sass())
    .pipe(gulp.dest('style/'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('watch', ['browserSync', 'animations', 'sass', 'js'], function(){
  gulp.watch('style/**/*.scss', ['animations', 'sass']); 
  gulp.watch('js/**/*.js', ['js']);
  gulp.watch('**/*.json', ['js']);
  gulp.watch('index.html');
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: '.'
    },
  })
});
