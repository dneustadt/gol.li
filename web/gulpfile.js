var gulp = require('gulp'),
    sass = require('gulp-sass'),
    csso = require('gulp-csso'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify-es').default;

var sassConfig = {
    inputDirectory: 'css/src/*.scss',
    outputDirectory: 'css/dist',
    options: {
        outputStyle: 'expanded'
    }
};

gulp.task('default', ['build-css', 'build-scripts']);

gulp.task('build-css', function() {
    return gulp
        .src(sassConfig.inputDirectory)
        .pipe(sass(sassConfig.options).on('error', sass.logError))
        .pipe(gulp.dest(sassConfig.outputDirectory))
        .pipe(rename({ suffix: '.min' }))
        .pipe(csso())
        .pipe(gulp.dest(sassConfig.outputDirectory));
});

var jsFiles = ['js/src/lib/*.js', 'js/src/*.js'],
    jsDest = 'js/dist';

gulp.task('build-scripts', function() {
    return gulp
        .src(jsFiles)
        .pipe(concat('scripts.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(rename('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(jsDest));
});

gulp.task('watch', function() {
    gulp.watch('css/src/*.scss', ['build-css', 'build-scripts']);
});