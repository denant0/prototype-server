var gulp = require('gulp'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');
var babel = require("gulp-babel");

gulp.task('webix', function(){
    gulp.src('src/client/scripts/data-grid/datagrid.js')
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
    gulp.src('src/client/scripts/data-grid/custom-filter-sort.js')
        .pipe(gulp.dest('public/scripts/data-grid'));
});

gulp.task('default',['webix', 'copy']);

gulp.task('watch', function(){
    gulp.watch('src/**/*.*',['default']);
});