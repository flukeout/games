const gulp       = require('gulp');
const plumber    = require('gulp-plumber');
const sass       = require('gulp-sass');
const replace    = require('gulp-replace');
const uglify     = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const concat     = require('gulp-concat');
const rename     = require("gulp-rename");
const babel      = require("gulp-babel");

gulp.task('html', () => {
  gulp.src('index.html')
    .pipe(replace(/<base href=".+">/g, ''))
    .pipe(replace(/<script src="js\/.+"><\/script>.*/g,''))
    .pipe(replace(/<!-- insert minified source here -->/g,'<script src="matter.min.js"></script><script src="battle-pong.min.js"></script>'))
    .pipe(plumber())
    .pipe(gulp.dest('./build/app'))
});

gulp.task('css', () => {
  gulp.src('src/scss/style.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./src/'))
    .pipe(gulp.dest('./build/app'))
});

gulp.task('js', () => {
  gulp.src([
      './src/js/settings.js',
      './src/js/particles.js',
      './src/js/effects.js',
      './src/js/title.js',
      './src/js/sounds.js',
      './src/js/input-mappings.js',
      './src/js/input.js',
      './src/js/game.js',
      './src/js/collisions.js',
      './src/js/convert.js',
      './src/js/components.js',
      './src/js/paddle.js',
      './src/js/ball.js',
      './src/js/powerups.js',
      './src/js/reactions.js',
      './src/js/intro.js',
      './src/js/menu.js',
      './src/js/framerate.js',
      './src/js/start.js'
    ])
    .pipe(plumber())
    // .pipe(sourcemaps.init())
    .pipe(concat('battle-pong.js'))
    // .pipe(gulp.dest('./build/')) // save .js
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify({
      // toplevel: true
    }))
    .pipe(rename({
      extname: '.min.js'
    }))
    // .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('./build/app')) // save .min.js

  gulp.src('./src/js/matter.min.js')
    .pipe(plumber())
    .pipe(gulp.dest('./build/app'));
});

gulp.task('assets', () => {
  gulp.src(['src/assets/**/*'])
    .pipe(plumber())
    .pipe(gulp.dest('./build/app/assets/'));
  gulp.src(['src/fonts/**/*'])
    .pipe(plumber())
    .pipe(gulp.dest('./build/app/fonts/'));
  gulp.src(['src/sounds/**/*'])
    .pipe(plumber())
    .pipe(gulp.dest('./build/app/sounds/'));
});

gulp.task('electron', () => {
  gulp.src('electron/electron.js')
    .pipe(plumber())
    .pipe(gulp.dest('./build/app'));
  gulp.src('electron/package.json')
    .pipe(plumber())
    .pipe(gulp.dest('./build/'));
});

gulp.task('build', ['css', 'html', 'js', 'assets', 'electron'], () => {

});

gulp.task('watch', [
  'css', 
  'html',
  'js',
  'assets',
  'electron'
  ], () => {
  gulp.watch('src/scss/**/*', ['css']);
  gulp.watch('index.html', ['html']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('electron/**/*', ['electron']);
  gulp.watch(['src/assets/**/*', 'src/fonts/**/', 'src/sounds/**/'], ['assets'])
});

gulp.task('default', ['watch']);
