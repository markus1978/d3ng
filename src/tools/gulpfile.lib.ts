
import * as gulp from 'gulp';
import * as del from 'del';
import {inlineResourcesForDirectory} from './inline-resources';


gulp.task('copy-and-inline-resources', () => {
  gulp.src('src/lib/**/*.js').pipe(gulp.dest('./dist/lib')).on('end', () => {
  gulp.src('src/lib/**/*.html').pipe(gulp.dest('./dist/lib')).on('end', () => {
  gulp.src('src/lib/**/*.css').pipe(gulp.dest('./dist/lib')).on('end', () => {
  inlineResourcesForDirectory('dist/lib');
  del(['./dist/lib/*.css', './dist/lib/*.html'])
  });});});
});

gulp.task('default', ['copy-and-inline-resources']);
