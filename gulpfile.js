const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
// const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');

function pages() {
	return src('src/pages/*.html')
		.pipe(include({
			includePaths: 'src/components/'
		}))
		.pipe(dest('src'))
		.pipe(browserSync.stream())
}

function images() {
	return src(['src/assets/images/images_src/*.*', '!src/assets/images/images_src/*.svg'])
		.pipe(newer('src/assets/images/images_build'))
		.pipe(avif({ quality : 50}))
			
		.pipe(src('src/assets/images/images_src/*.*'))
		.pipe(newer('src/assets/images/images_build'))
		.pipe(webp())
		
		.pipe(src('src/assets/images/images_src/*.*'))
		.pipe(newer('src/assets/images/images_build'))
		.pipe(imagemin())
		
		.pipe(dest('src/assets/images/images_build'))
}

function sprite() {
	return src('src/images/dist/*.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../sprite.svg',
					example: true
				}
			}
		}))
		.pipe(dest('src/images/dist'))
}

function fonts() {
	return src('src/assets/fonts/fonts_src/*.*')
		.pipe(fonter({
			formats: ['woff', 'ttf' ]
		}))
		.pipe(src('src/assets/fonts/fonts_build/*.ttf'))
		.pipe(ttf2woff2())
		.pipe(dest('src/assets/fonts/fonts_build'))
}


function styles() {
	return src('src/scss/style.scss')
		// .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version']}))
		.pipe(concat('style.min.css'))
		.pipe(scss({ outputStyle: 'compressed' }))
		.pipe(dest('src/css'))
		.pipe(browserSync.stream());
}

function watching() {
	browserSync.init({
		server: {
			baseDir: "src/"
		}
	});	
	watch(['src/scss/style.scss'], styles)
	watch(['src/assets/images/images_src/'], images)
	watch(['src/components/*', 'src/pages/*'], pages)
	watch(['src/*.html']).on('change', browserSync.reload);
}


function cleanDist() {
	return src('dist')
		.pipe(clean())
}

function building() {
	return src([
		'src/css/style.min.css',
		'src/assets/images/images_build/*.*',
		'src/assets/fonts/fonts_build/*.*',
		'src/**/*.html'
	], {base : 'src'})
		.pipe(dest('dist'))
}

exports.styles = styles;
exports.watching = watching;
exports.images = images;
exports.browserSync = browserSync;
exports.sprite =  sprite;
exports.fonts = fonts;
exports.pages = pages;


exports.build = series(cleanDist, building);
exports.default = parallel(styles, images, pages, watching);

