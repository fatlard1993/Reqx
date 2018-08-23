const Gulp = require('gulp');
const BrowserSync = require('browser-sync').create();

const Compile = {
	js: require('../swiss-army-knife/gulpfiles/compileJS'),
	html: require('../swiss-army-knife/gulpfiles/compileHTML')
};
const Watcher = require('../swiss-army-knife/gulpfiles/watcher');

const BrowserSyncOptions = {
	server: {
		baseDir: 'client/public'
	}
};

Gulp.task('compile-js', function(){ Compile.js('client/public/js'); });

Gulp.task('compile-html', function(){
	Gulp.src('client/html/index.html').pipe(Gulp.dest('client/public'));
});

Gulp.task('compile', ['compile-js', 'compile-html']);

Gulp.task('dev', ['compile'], function(){
	BrowserSync.init(BrowserSyncOptions);

	Watcher(Gulp, BrowserSync);
});

Gulp.task('default', ['compile']);