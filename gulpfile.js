"use strict";
const gulp = require("gulp");
const babel = require("gulp-babel");
const babelRegister = require("babel-core/register");
const exec = require("child_process").exec;
const mocha = require("gulp-mocha");
const istanbul = require("gulp-babel-istanbul");
const webpack = require("webpack");
const del = require("del");
const path = require("path");
const webpackConfig = {
	entry:path.resolve(__dirname, "src/index.js"),
	devtool:"source-map",
	output:{
		filename:"index.js",
		path:path.resolve(__dirname, "./")
	},
	plugins:[
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin()
  ]
}
/* jshint unused:false */
gulp.task("webpack", ["test"], function(callback) {
	webpack(webpackConfig, function(err, stats) {
		if(err) console.log(err);
		callback();
	});
});

gulp.task("clean", function() {
	return del(["index.js"]);
});

gulp.task("babel", ["clean"], function() {
	return gulp.src(["src/index.js"])
	.pipe(babel())
	.pipe(gulp.dest("./"));
});

gulp.task("doc", function(cb) {
	exec("jsdox --templateDir docs/templates --output docs src/*.js", function(err, stdout, stderr) {
		console.log(stderr);
		console.log(stdout);
		cb(err);
	});
});

gulp.task("test", function() {
	return gulp.src(["test/*.js"])
	.pipe(mocha({
		bail:true,
		compilers: {
			js:babelRegister
		}
	}));
});

gulp.task("test:coverage", function(cb) {
	gulp.src(["src/*js"])
	.pipe(istanbul())
	.pipe(istanbul.hookRequire())
	.on("finish", function() {
		gulp.src(["test/*.js"])
		.pipe(mocha({
			compilers: {
				bail:true,
				js:babelRegister
			}
		}))
		.pipe(istanbul.writeReports())
		.on("end", cb)
	});
});

gulp.task("default", ["test:coverage", "babel"]);
