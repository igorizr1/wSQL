var gulp = require('gulp'),
    plugins = require("gulp-load-plugins")({lazy: false}),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    ngAnnotate = require('gulp-ng-annotate'),
    expect = require('gulp-expect-file'),
    path = require('path'),
    clean = require('gulp-clean'),
    coffee = require('gulp-coffee'),

    example = 1;

//var config = {
//
//    SRC_SCRIPTS: [
//        '!./**/*_test.js',
//
//        "./src/wSQL.js"
//    ],
//    EXAMPLE_SCRIPTS: [
//        //example 1
//        './examples/example1/wSQL.config.js',
//        './examples/example1/app.js'
////        './examples/example1/batch_insert_sample.js'
//    ],
//    BOWER_SCRIPTS: [
//        "./bower_components/angular/angular.min.js"
//    ]
//
//};

var config = {
    example1: {
        EXAMPLE_SCRIPTS: [
            './examples/example1/wSQL.config.js',
            './examples/example1/app.js'
        ]
    },
    example2: {
        EXAMPLE_SCRIPTS: [
            './examples/example2/wSQL.config.js',
            './examples/example2/app.js'
        ]
    },
    example3: {
        EXAMPLE_SCRIPTS: [
            './examples/example3/wSQL.config.js',
            './examples/example3/batch_insert_sample.js'
        ]
    },
    SRC_SCRIPTS: [
        '!./**/*_test.js',
        "./src/wSQL.js"
    ],
    BOWER_SCRIPTS: [
        "./bower_components/angular/angular.min.js"
    ]
};

gulp.task('scripts_min_prod', function () {
    gulp.src(config.SRC_SCRIPTS)
        .pipe(sourcemaps.init())
        .pipe(concat('wSQL.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist'));
});

gulp.task('scripts_min', function () {
    gulp.src(config["example"+example].EXAMPLE_SCRIPTS)
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dev'));

    gulp.src(config.SRC_SCRIPTS)
        .pipe(sourcemaps.init())
        .pipe(concat('wSQL.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dev'));
});

//gulp.task('scripts_dev', function () {
//    gulp.src(config.EXAMPLE_SCRIPTS)
//        .pipe(sourcemaps.init())
//        .pipe(concat('app.min.js'))
//        .pipe(sourcemaps.write())
//        .pipe(gulp.dest('./dev'));
//
//    gulp.src(config.SRC_SCRIPTS)
//        .pipe(sourcemaps.init())
//        .pipe(concat('wSQL.min.js'))
//        .pipe(sourcemaps.write())
//        .pipe(gulp.dest('./dev'));
//});

gulp.task('scripts_dev', function () {

    console.log("running____________example__________", example);

    gulp.src(config["example"+example].EXAMPLE_SCRIPTS)
        .pipe(sourcemaps.init())
        .pipe(concat('app.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dev'));

    gulp.src(config.SRC_SCRIPTS)
        .pipe(sourcemaps.init())
        .pipe(concat('wSQL.min.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dev'));
});

gulp.task('vendorBOWER', function () {
    gulp.src(config.BOWER_SCRIPTS)
        .pipe(plugins.concat('bower-components.min.js'))
        .pipe(gulp.dest('./dev'));
    gulp.src('./bower_components/angular-sanitize/angular-sanitize.min.js.map')
        .pipe(gulp.dest('./dev'));
});

gulp.task('copy_index', function () {
    gulp.src('./examples/example'+example+'/index.html')
        .pipe(gulp.dest('./dev'));
});

gulp.task('watch_min', function () {
    gulp.watch([
        'dev/**/*.html',
        'dev/**/*.js'
    ], function (event) {
        return gulp.src(event.path)
            .pipe(plugins.connect.reload());
    });
    gulp.watch(['./**/*.js'], ['scripts_min']);
    gulp.watch('./examples/example'+example+'/index.html', ['copy_index']);
});

gulp.task('watch_dev', function () {
    gulp.watch([
        'dev/**/*.html',
        'dev/**/*.js'
    ], function (event) {
        return gulp.src(event.path)
            .pipe(plugins.connect.reload());
    });
    gulp.watch(['./src/**/*.js', './examples/**/*.js'], ['scripts_dev']);
    gulp.watch('./examples/example'+example+'/index.html', ['copy_index']);
});

gulp.task('connect', plugins.connect.server({
    root: ['dev'],
    port: 9000,
    livereload: true
}));

gulp.task('clean', function () {
    return gulp.src('./dev', {read: false}).pipe(clean({force: true}));
});

gulp.task('set_example_1', function(){example = 1;});
gulp.task('set_example_2', function(){example = 2;});
gulp.task('set_example_3', function(){example = 3;});

/**
 * run Examples START
 */
gulp.task('default',  ['set_example_1', 'scripts_dev', 'copy_index', 'vendorBOWER', 'watch_dev', 'connect']);
gulp.task('example1', ['set_example_2', 'scripts_dev', 'copy_index', 'vendorBOWER', 'watch_dev', 'connect']);
gulp.task('example2', ['set_example_2', 'scripts_dev', 'copy_index', 'vendorBOWER', 'watch_dev', 'connect']);
gulp.task('example3', ['set_example_3', 'scripts_dev', 'copy_index', 'vendorBOWER', 'watch_dev', 'connect']);

//gulp.task('build',   ['scripts_min', 'copy_index', 'vendorBOWER', 'connect']);

/**
 * RUN SCRIPT TO MINIFY LIBRARY
 */
gulp.task('dist',   ['scripts_min_prod']);

