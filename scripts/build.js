build({
	entryPoints: [`builds/cdn.js`],
	outfile: `dist/router.min.js`,
	define: { CDN: 'true' },
	platform: 'browser',
	sourcemap: 'inline',
})

build({
	entryPoints: [`builds/module.js`],
	mainFields: ['main', 'module'],
	outfile: `dist/router.esm.js`,
	platform: 'browser',
	sourcemap: 'inline',
})

function build(options) {
	options.define || (options.define = {})

	return import('esbuild')
		.then((esbuild) =>
			esbuild.build({
				...options,
				sourcemap: true,
				bundle: true,
				minify: true,
			}),
		)
		.catch(() => process.exit(1))
}
