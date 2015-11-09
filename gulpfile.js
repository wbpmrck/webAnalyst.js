var gulp = require('gulp');

var concat = require('gulp-concat');
var order = require("gulp-order");
var headerfooter = require('gulp-header-footer');
var uglify = require('gulp-uglify');
var filterProperties = require("gulp-filter-java-properties");

gulp.task('main', function () {
    gulp.src("src/**/*.js")

        .pipe(order([
            "src/eventHub.js",
            "src/tracker.js",
            "src/trackers/**/*.js",
            "src/webAnalyst.js"
        ]))
        .pipe(headerfooter({
            header:';',
            footer:'',
            filter: function(file){
                return true
            }
        }))
        .pipe(concat("wa.js"))
        .pipe(gulp.dest("demo"))
        .pipe(gulp.dest("bin"));
});
gulp.task('snippet', function () {
    gulp.src("snippet/*.js")
        .pipe(filterProperties({
            propertiesPath: "conf/config.properties",
            delimiters: ["${*}"] // optional, defaults shown
        }))
        .pipe(uglify())
        .pipe(gulp.dest("bin"));
});
gulp.task('default', ['snippet','main']);