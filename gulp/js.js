var gulp = require("gulp");
var ts = require("gulp-typescript");
var uglify_js = require("gulp-uglify");

var sourcemaps = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var header = require("gulp-header");
var replace = require("gulp-replace");

var merge = require("merge2");

var config = require("./config.json");
var pkg = require("../package.json");

gulp.task("js", ["js:header"]);

gulp.task("js:build", function() {
	var ts_result = gulp.src("js/main.ts")
		.pipe(sourcemaps.init())
		.pipe(ts({
			removeComments: true,
			declarationFiles: true,
			target: "ES5",
			out: "timeline.js"
		}));
	return merge([
		ts_result.dts.pipe(gulp.dest("dist")),
		ts_result.js
			.pipe(sourcemaps.write(".", {
				includeContent: true
			}))
			.pipe(gulp.dest("dist"))
	]);
});

gulp.task("js:compress", ["js:build"], function() {
	return gulp.src("dist/timeline.js")
		.pipe(sourcemaps.init({
			loadMaps: true
		}))
		.pipe(uglify_js({
			mangle: true
		}))
		.pipe(rename({
			extname: ".min.js"
		}))
		.pipe(sourcemaps.write(".", {
			includeContent: true,
			sourceRoot: "."
		}))
		.pipe(gulp.dest("dist"));
});

gulp.task("js:clean", ["js:compress"], function() {
	return gulp.src(["dist/**/*.d.ts"])
		.pipe(replace(/^[/]{2,}\s?<reference.*/g, ""))
		.pipe(gulp.dest("dist"));
});

gulp.task("js:header", ["js:clean"], function() {
	return gulp.src("dist/*.js")
		.pipe(header(config.banner, {
			pkg: pkg,
			year: (new Date()).getFullYear()
		}))
		.pipe(gulp.dest("dist"));
});
