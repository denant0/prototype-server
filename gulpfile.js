var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');
var babel = require("gulp-babel");
var less = require('gulp-less');
var path = require('path');


gulp.task('webix', function(){
    gulp.src('src/client/scripts/main.js')
        .pipe(browserify({transform: 'reactify'}))
        .pipe(concat('datagrid.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
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

gulp.task('less', function () {
    return gulp.src('src/client/style/**/*.less')
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(gulp.dest('public/style/'));
});

gulp.task('default',['webix', 'copy', 'less']);

gulp.task('watch', function(){
    gulp.watch('src/**/*.*',['default']);
});