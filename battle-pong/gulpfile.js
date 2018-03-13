const gulp       = require('gulp');
const plumber    = require('gulp-plumber');
const sass       = require('gulp-sass');
const replace    = require('gulp-replace');
const uglify     = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const concat     = require('gulp-concat');
const rename     = require("gulp-rename");
const babel      = require("gulp-babel");

const gameJSFiles = [
  'settings.js',
  'debug.js',
  'particles.js',
  'effects.js',
  'ai.js',
  'title.js',
  'sounds.js',
  'powerups.js',
  'music.js',
  'input-mappings.js',
  'input.js',
  'game.js',
  'collisions.js',
  'convert.js',
  'components.js',
  'paddle.js',
  'ball.js',
  'reactions.js',
  'intro.js',
  'menu.js',
  'framerate.js',
  'canvas-stars.js',
  'rules.js',
  'start.js'
].map(file => { return './src/js/' + file });

const splashJSFiles = [
  'particles.js',
  'settings.js',
  'canvas-stars.js',
  'music.js',
  'sounds.js',
  'splash.js'
].map(file => { return './src/js/' + file });

gulp.task('html', () => {
  gulp.src('splash.html')
    .pipe(replace(/<base href=".+">/g, ''))
    .pipe(replace(/<script src="js\/.+"><\/script>.*/g,''))
    .pipe(replace(/<!-- insert minified source here -->/g,'<script src="matter.min.js"></script><script src="splash.min.js"></script>'))
    .pipe(plumber())
    .pipe(gulp.dest('./build/'))

  gulp.src('index.html')
    .pipe(replace(/<base href=".+">/g, ''))
    .pipe(replace(/<script src="js\/.+"><\/script>.*/g,''))
    .pipe(replace(/<!-- insert minified source here -->/g,'<script src="matter.min.js"></script><script src="deathstroid.min.js"></script>'))
    .pipe(plumber())
    .pipe(gulp.dest('./build/'))
});

gulp.task('css', () => {
  gulp.src('src/scss/style.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./src/'))
    .pipe(gulp.dest('./build/'))
});

function compileJS(files, destinationFilename) {
  return gulp.src(files)
    .pipe(plumber())
    // .pipe(sourcemaps.init())
    .pipe(concat(destinationFilename))
    // .pipe(gulp.dest('./build/')) // save .js
    // .pipe(babel({
    //   presets: ['env']
    // }))
    // .pipe(uglify({
    //   // toplevel: true
    // }))
    .pipe(rename({
      extname: '.min.js'
    }))
    // .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('./build/')) // save .min.js
}

gulp.task('js', () => {
  compileJS(gameJSFiles, 'deathstroid.js');
  compileJS(splashJSFiles, 'splash.js');

  gulp.src('./src/js/matter.min.js')
    .pipe(plumber())
    .pipe(gulp.dest('./build/'));
});

gulp.task('assets', () => {
  gulp.src(['src/assets/**/*'])
    .pipe(plumber())
    .pipe(gulp.dest('./build/assets/'));
  gulp.src(['src/fonts/**/*'])
    .pipe(plumber())
    .pipe(gulp.dest('./build/fonts/'));
  gulp.src(['src/sounds/**/*'])
    .pipe(plumber())
    .pipe(gulp.dest('./build/sounds/'));
  gulp.src(['src/music/**/*'])
    .pipe(plumber())
    .pipe(gulp.dest('./build/music/'));
});

gulp.task('build', ['css', 'html', 'js', 'assets'], () => {

});

gulp.task('watch', [
  'css',
  'html',
  'js',
  'assets',
  ], () => {
  gulp.watch('src/scss/**/*', ['css']);
  gulp.watch('index.html', ['html']);
  gulp.watch('splash.html', ['html']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch(['src/assets/**/*', 'src/fonts/**/', 'src/sounds/**/', 'src/music/**/'], ['assets'])
});

gulp.task('default', ['watch']);
