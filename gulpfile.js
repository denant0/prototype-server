var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

gulp.task('webix', function(){
    gulp.src('src/client/scripts/data-grid/grid-data.js')
        .pipe(browserify({transform: 'reactify'}))
        .pipe(concat('grid-data.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('public/scripts/data-grid'));
});

gulp.task('copy', function(){
    gulp.src('src/client/index.html')
        .pipe(gulp.dest('public'));
    gulp.src('src/client/style/**/*.*')
        .pipe(gulp.dest('public/style/'));
    gulp.src('src/client/scripts/lib/**/*.*')
        .pipe(gulp.dest('public/scripts/lib/'));
});

gulp.task('default',['webix', 'copy']);

gulp.task('watch', function(){
    gulp.watch('src/**/*.*',['default']);
});