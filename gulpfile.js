var gulp = require('gulp'),
    plugins = require("gulp-load-plugins")({lazy: false}),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    ngAnnotate = require('gulp-ng-annotate'),
    expect = require('gulp-expect-file'),
    path = require('path'),
    clean = require('gulp-clean'),
    coffee = require('gulp-coffee');


var config = {

    SRC_SCRIPTS: [
        '!./**/*_test.js',

        "./src/wSQL.js"
    ],
    EXAMPLE_SCRIPTS: [
        //example 1
        './examples/example1/wSQL.config.js',
        './examples/example1/app.js'
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
    gulp.src(config.EXAMPLE_SCRIPTS)
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

gulp.task('scripts_dev', function () {
    gulp.src(config.EXAMPLE_SCRIPTS)
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
    gulp.src('./examples/example1/index.html')
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
    gulp.watch('./examples/example1/index.html', ['copy_index']);
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
    gulp.watch('./examples/example1/index.html', ['copy_index']);
});

gulp.task('connect', plugins.connect.server({
    root: ['dev'],
    port: 9000,
    livereload: true
}));

gulp.task('clean', function () {
    return gulp.src('./dev', {read: false})
        .pipe(clean({force: true}));
});

gulp.task('default', ['scripts_dev', 'copy_index', 'vendorBOWER', 'watch_dev', 'connect']);

gulp.task('build',   ['scripts_min', 'copy_index', 'vendorBOWER', 'connect']);

gulp.task('dist',   ['scripts_min_prod']);