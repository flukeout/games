const gulp       = require('gulp');
const plumber    = require('gulp-plumber');
const sass       = require('gulp-sass');
const replace    = require('gulp-replace');
const uglify     = require('gulp-uglify-es');
const sourcemaps = require('gulp-sourcemaps');
const concat     = require('gulp-concat');
const rename     = require("gulp-rename");
const header     = require('gulp-header');
const zip        = require('gulp-zip');
const insert     = require('gulp-insert');

const JS_HEADER = '/* Copyright 2018 Luke Pacholski & Bobby Richter */\n';
const CSS_HEADER = '/* Copyright 2018 Luke Pacholski & Bobby Richter */\n';
const HTML_HEADER = '<!-- Copyright 2018 Luke Pacholski & Bobby Richter -->\n';

const jsFiles = {
  game: [
    'sound-settings.js',
    'input-mappings.js',
    'settings.js',
    'debug.js',
    'particles.js',
    'effects.js',
    'canvas-stars.js',
    'ai.js',
    'title.js',
    'sounds.js',
    'powerups.js',
    'music.js',
    'input.js',
    'menu-controls.js',
    'pause.js',
    'game.js',
    'collisions.js',
    'convert.js',
    'components.js',
    'paddle.js',
    'ball.js',
    'reactions.js',
    'framerate.js',
    'start.js',
    'balltrail.js'
  ].map(file => { return './src/js/' + file }),
  splash: [
    'sound-settings.js',
    'effects.js',
    'particles.js',
    'settings.js',
    'canvas-stars.js',
    'music.js',
    'sounds.js',
    'particles.js',
    'input-mappings.js',
    'input.js',
    'menu-controls.js',
    'components.js',
    'splash.js'
  ].map(file => { return './src/js/' + file }),
  rules: [
    'sound-settings.js',
    'settings.js',
    'canvas-stars.js',
    'music.js',
    'sounds.js',
    'effects.js',
    'particles.js',
    'input-mappings.js',
    'input.js',
    'menu-controls.js',
    'components.js',
    'rules.js'
  ].map(file => { return './src/js/' + file }),
  story: [
    'sound-settings.js',
    'effects.js',
    'particles.js',
    'settings.js',
    'canvas-stars.js',
    'music.js',
    'sounds.js',
    'particles.js',
    'input-mappings.js',
    'input.js',
    'menu-controls.js',
    'components.js',
    'story.js'
  ].map(file => { return './src/js/' + file })
};

gulp.task('html', () => {
  [{html: 'index', js: 'story'}, {html: 'game', js: 'game'}, {html: 'rules', js: 'rules'}, {html: 'splash', js: 'splash'}].forEach(htmlFile => {
    gulp.src(htmlFile.html + '.html')
      .pipe(replace(/<base href=".+">/g, ''))
      .pipe(replace(/<script src="js\/.+"><\/script>.*/g,''))
      .pipe(replace(/<!-- insert minified source here -->/g,'<script src="matter.min.js"></script><script src="' + htmlFile.js + '.min.js"></script>'))
      .pipe(header(HTML_HEADER))
      .pipe(plumber())
      .pipe(gulp.dest('./build/'))
  });
});

gulp.task('css', () => {
  gulp.src('src/scss/style.scss')
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./src/'))
    .pipe(header(CSS_HEADER))
    .pipe(gulp.dest('./build/'))
});

function compileJS(files, destinationFilename) {
  return gulp.src(files)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(concat(destinationFilename))
    // .pipe(gulp.dest('./build/')) // save .js
    .pipe(uglify.default({
    }))
    .pipe(header(JS_HEADER))
    .pipe(rename({
      extname: '.min.js'
    }))
    // .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('./build/')) // save .min.js
}

gulp.task('sound-settings', (cb) => {
  gulp.src('./sound-settings.json')
    .pipe(plumber())
    .pipe(insert.prepend('window.__soundSettings='))
    .pipe(insert.append(';'))
    .pipe(rename({
      extname: '.js'
    }))
    .pipe(gulp.dest('./src/js/'))
    .on('end', function() {
      cb();
    });
});

gulp.task('js', ['sound-settings'], () => {
  jsFiles.game.forEach(f => {
    if (!require('fs').existsSync(f)) {
      throw new Error('THIS FILE DOESN\'T EXIST AND CAN\'T BE INCLUDED IN DIST BUILD: ' + f);
    }
  })

  compileJS(jsFiles.game, 'game.js');
  compileJS(jsFiles.splash, 'splash.js');
  compileJS(jsFiles.story, 'story.js');
  compileJS(jsFiles.rules, 'rules.js');

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

gulp.task('build', ['sound-settings', 'css', 'html', 'js', 'assets'], () => {
  gulp.src('build/**/*')
      .pipe(zip('paddleforce.zip'))
      .pipe(gulp.dest('dist'));
});

gulp.task('watch', [
  'css',
  // 'html',
  // 'js',
  // 'assets',
  // 'sound-settings',
  ], () => {
  // gulp.watch('sound-settings.json', ['sound-settings']);
  gulp.watch('src/scss/**/*', ['css']);
  // gulp.watch('index.html', ['html']);
  // gulp.watch('splash.html', ['html']);
  // gulp.watch('story.html', ['html']);
  // gulp.watch('rules.html', ['html']);
  // gulp.watch('src/js/**/*.js', ['js']);
  // gulp.watch(['src/assets/**/*', 'src/fonts/**/', 'src/sounds/**/', 'src/music/**/'], ['assets'])
});

gulp.task('default', ['watch']);
