var del = require("del");

var gulp = require("gulp");

require("./gulp/js");
require("./gulp/css");

gulp.task("default", ["clean-build"]);
gulp.task("build", ["js", "css"]);
gulp.task("clean-build", ["clean", "build"]);

gulp.task("clean", function(cb) {
	del.sync([
		"dist/**/*"
	]);
	cb();
});
