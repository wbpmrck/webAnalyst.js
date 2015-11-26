var gulp = require('gulp');
var print = require('gulp-print');
var concat = require('gulp-concat');
var order = require("gulp-order");
var headerfooter = require('gulp-header-footer');
var uglify = require('gulp-uglify');
var filterProperties = require("gulp-filter-java-properties");
var fileinclude = require('gulp-file-include');



gulp.task('main', function () {
   return gulp.src("src/**/*.js")
        .pipe(order([
           "util.js",
           "tracker.js",
           "trackers/**/*.js",
           "webAnalyst.js"
        ],{base:'src'}))
       .pipe(print())
        .pipe(headerfooter({
            header:';',
            footer:'',
            filter: function(file){
                return true
            }
        }))
        .pipe(concat("wa.js"))
        .pipe(filterProperties({
            propertiesPath: "conf/config.properties",
            delimiters: ["${*}"] // optional, defaults shown
        }))
       //.pipe(uglify())
        //.pipe(gulp.dest("demo"))
        .pipe(gulp.dest("bin"));
});
gulp.task('resource', function () {
    return gulp.src("src/trackers/*.gif")
        .pipe(gulp.dest("bin"));
});

gulp.task('snippet', function () {
    return gulp.src("snippet/*.js")
        .pipe(filterProperties({
            propertiesPath: "conf/config.properties",
            delimiters: ["${*}"] // optional, defaults shown
        }))
        .pipe(uglify())
        .pipe(gulp.dest("bin"));
});

gulp.task('demo', ['main','snippet'],function () {
    return gulp.src("./demo/**/*.*", { base: './' })
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest("bin"));
});
gulp.task('default', ['resource','demo']);