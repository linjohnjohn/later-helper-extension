var gulp = require('gulp');;
var watch = require('gulp-watch');
var io = require('socket.io');
var run = require('gulp-run');

gulp.task('chrome-watch', function () {
    var WEB_SOCKET_PORT = 8890;
    io = io.listen(WEB_SOCKET_PORT);
    watch(['src/**/*.*', 'public/**/*.*'], function (file) {
        console.log('change detected', file.relative);
        gulp.series("build", "reload")();
    });
});

gulp.task('build', function () {
    run('yarn build').exec();
});

gulp.task('reload', function() {
    io.emit('file.change', {});
})

