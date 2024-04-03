build({
	entryPoints: [`builds/cdn.js`],
	outfile: `dist/router.min.js`,
	platform: 'browser',
	define: { CDN: 'true' },
	sourcemap: 'inline',
})

build({
	entryPoints: [`builds/module.js`],
	outfile: `dist/router.esm.js`,
	platform: 'neutral',
	mainFields: ['main', 'module'],
	sourcemap: 'inline',
})

function build(options) {
	options.define || (options.define = {})

	return require('esbuild')
		.build({ ...options, minify: true, bundle: true, sourcemap: true })
		.catch(() => process.exit(1))
}
