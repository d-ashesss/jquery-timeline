var gulp = require("gulp");
var less = require("gulp-less");
var minify_css = require("gulp-minify-css");

var sourcemaps = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var header = require("gulp-header");

var config = require("./config.json");
var pkg = require("../package.json");

gulp.task("css", ["css:header"]);

gulp.task("css:build", function() {
	return gulp.src("css/timeline.less")
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(sourcemaps.write(".", {
			includeContent: true
		}))
		.pipe(gulp.dest("dist"));
});

gulp.task("css:compress", ["css:build"], function() {
	return gulp.src("dist/timeline.css")
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(minify_css({
			output: "timeline.min.css"
		}))
		.pipe(rename({
			extname: ".min.css"
		}))
		.pipe(sourcemaps.write(".", {
			includeContent: true,
			sourceRoot: "."
		}))
		.pipe(gulp.dest("dist"));
});

gulp.task("css:header", ["css:compress"], function() {
	return gulp.src("dist/*.css")
		.pipe(header(config.banner, {
			pkg: pkg,
			year: (new Date()).getFullYear()
		}))
		.pipe(gulp.dest("dist"));
});
