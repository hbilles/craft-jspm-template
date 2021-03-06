import config from '../config'

import browserSync from 'browser-sync'
import cached from 'gulp-cached'
import gulp from 'gulp'
import gulpJspm from 'gulp-jspm'
import eslint from 'gulp-eslint'
import filter from 'gulp-filter'
import lazypipe from 'lazypipe'
import path from 'path'
import plumber from 'gulp-plumber'
import rename from 'gulp-rename'
import rev from 'gulp-rev'
import sequence from 'gulp-sequence'
import size from 'gulp-size'
import sourcemaps from 'gulp-sourcemaps'
import uglify from 'gulp-uglify'
import fs from 'fs'

const paths = {
	src: config.tasks.scripts.src,
	dist: config.tasks.scripts.dist,
	manifest: path.join(config.paths.src, 'rev-manifest.json'),
}

gulp.task('scripts:lint', () => {
	if (config.mode == 'development') {
		return gulp.src([
				path.join(paths.src, '**/*.js'),
				'!' + path.join(paths.src, 'vendor/**/*.js'),
				'!' + path.join(paths.src, 'jspm_packages/**/*.js'),
			])
			.pipe(cached('esLint'))
			.pipe(eslint())
			.pipe(eslint.format())
	}
})

const tasks = {
	development: (filename) => {
		return lazypipe()
			.pipe(plumber, config.plumber)
			.pipe(sourcemaps.init)
			.pipe(gulpJspm, { selfExecutingBundle: true })
			.pipe(rename, filename)
			.pipe(sourcemaps.write, '.')
			.pipe(gulp.dest, paths.dist)
			.pipe(browserSync.stream, { match: '**/*.js' })
			.pipe(filter, [`**/*.{${config.tasks.scripts.extensions}}`])
			.pipe(uglify)
			.pipe(size, config.output.size);
	},
	production: (filename) => {
		return lazypipe()
			.pipe(plumber, config.plumber)
			.pipe(sourcemaps.init)
			.pipe(gulpJspm, { selfExecutingBundle: true })
			.pipe(rename, filename)
			.pipe(uglify)
			.pipe(rev)
			.pipe(sourcemaps.write, '.')
			.pipe(gulp.dest, paths.dist)
			.pipe(rev.manifest, paths.manifest, { base: config.paths.src, merge: true })
			.pipe(gulp.dest, config.paths.src);
	},
};

for (const file of config.tasks.scripts.files) {
	gulp.task(file, () => {
		const task = tasks[config.mode](file)
		return gulp.src(path.join(paths.src, file)).pipe(task());
	})
}

/* Need to clean up .eslintrc before using scripts:lint
gulp.task('scripts', ['scripts:lint'], (cb) => {
	sequence.apply(this, config.tasks.scripts.files.concat('browserSync:reload'))(cb)
})
*/

gulp.task('scripts', (cb) => {
	sequence.apply(this, config.tasks.scripts.files.concat('browserSync:reload'))(cb)
})
