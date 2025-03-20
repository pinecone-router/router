await Bun.build({
	entrypoints: ['./builds/cdn.js'],
	naming: '[dir]/router.min.[ext]', // default
	platform: 'browser',
	sourcemap: 'linked',
	outdir: './dist',
	format: 'iife',
	minify: true,
})

await Bun.build({
	entrypoints: ['./builds/module.js'],
	naming: '[dir]/router.esm.[ext]', // default
	platform: 'browser',
	sourcemap: 'linked',
	outdir: './dist',
	format: 'esm',
	minify: true,
})
