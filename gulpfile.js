'use strict';

const gulp = require('gulp');
const less = require('gulp-less');
const sourcemaps = require('gulp-sourcemaps');
const gulpIf = require('gulp-if');
const del = require('del');
const newer = require ('gulp-newer');
const browserSync = require('browser-sync').create();
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const imagemin = require('gulp-imagemin');
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');
var minify = require('gulp-csso');
var webp = require('gulp-webp');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';


gulp.task('webp', function(){
    return gulp.src('src/img/**/*.{png,jpg}')
    .pipe(webp({quality:90}))
    .pipe(gulp.dest('src/img'));
});

// touch icon
// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
    realFavicon.generateFavicon({
        masterPicture: 'src/wB5GkX1UanA.jpg',
        dest: 'src',
        iconsPath: '/',
        design: {
            ios: {
                pictureAspect: 'noChange',
                assets: {
                    ios6AndPriorIcons: false,
                    ios7AndLaterIcons: false,
                    precomposedIcons: false,
                    declareOnlyDefaultIcon: true
                }
            },
            desktopBrowser: {},
            windows: {
                pictureAspect: 'noChange',
                backgroundColor: '#da532c',
                onConflict: 'override',
                assets: {
                    windows80Ie10Tile: false,
                    windows10Ie11EdgeTiles: {
                        small: false,
                        medium: true,
                        big: false,
                        rectangle: false
                    }
                }
            },
            androidChrome: {
                pictureAspect: 'noChange',
                themeColor: '#ffffff',
                manifest: {
                    display: 'standalone',
                    orientation: 'notSet',
                    onConflict: 'override',
                    declared: true
                },
                assets: {
                    legacyIcon: false,
                    lowResolutionIcons: false
                }
            }
        },
        settings: {
            scalingAlgorithm: 'Mitchell',
            errorOnImageTooSmall: false,
            readmeFile: false,
            htmlCodeFile: false,
            usePathAsIs: false
        },
        markupFile: FAVICON_DATA_FILE
    }, function() {
        done();
    });
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page. You can keep this task
// as is or refactor your existing HTML pipeline.
gulp.task('inject-favicon-markups', function() {
    return gulp.src([ 'src/*.html' ])
        .pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
        .pipe(gulp.dest('src'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
    var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
    realFavicon.checkForUpdates(currentVersion, function(err) {
        if (err) {
            throw err;
        }
    });
});
// touch


gulp.task('images', function(){
    return gulp.src('src/img/**/*.{png,jpg,svg}')
    .pipe(imagemin([
        imagemin.optipng({optimizationLevel:3}),
        imagemin.jpegtran({progressive:true}),
        imagemin.svgo()
    ]))
    .pipe(gulp.dest('src/img'));
});

gulp.task('styles', function(){
    return gulp.src('src/styles/style.less')
    .pipe(plumber({
        errorHandler: notify.onError(function(err){
            return {
                title: 'Styles',
                message: err.message
            };
        })
    }))
    .pipe(gulpIf(isDevelopment, sourcemaps.init()))
    .pipe(less())
    .pipe(postcss([autoprefixer()]))
    .pipe(minify())
    .pipe(gulpIf(isDevelopment, sourcemaps.write()))
    .pipe(gulp.dest('build/styles'));
});

gulp.task('clean', function() {
    return del('build');
});

gulp.task('copy', function(){
    return gulp.src('src/**/*.{html,png,jpg,svg,webp,woff,woff2,js}', {base:'src'}, {since: gulp.lastRun('copy')})
    .pipe(newer('build'))
    .pipe(gulp.dest('build'));
})

gulp.task('build', gulp.series(
    'clean',
     gulp.parallel('styles', 'copy'))
     );

gulp.task('watch', function(){
    gulp.watch('src/styles/**/*.*', gulp.series('styles'));
    gulp.watch('src/**/*.{html,png,jpg,svg,woff,woff2,js}', gulp.series('copy'));
});

gulp.task('serve', function(){
    browserSync.init({
        server:'build'
    });
    browserSync.watch('build/**/*.*').on('change',browserSync.reload);
});

gulp.task('start', 
gulp.series('build', gulp.parallel('watch','serve'))
);