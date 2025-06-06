import { describe, expect, test } from 'bun:test'
import Alpine from 'alpinejs'
import { version } from '../package.json'

import { createPineconeRouter } from './router'

const router = createPineconeRouter('pinecone-router', version, '/')
var output = ''

// setup routes

describe('Router', () => {
	test('Router Setup', () => {
		try {
			router.add('/', {})
			router.add('/profile', {})
			router.add('/about', {})
			router.add('/redirect', {
				handlers: [
					() => router.navigate('/'),
					() => {
						output = 'this should not have happened'
					},
				],
			})
			router.add('/halt', {
				handlers: [
					(_, ctrl) => ctrl.abort(),
					() => {
						output = 'this should not have happened'
					},
				],
			})
			Alpine.start()
		} catch (error) {
			expect(error).toBeNull()
		}
	})

	test('Navigation History', () => {
		expect(router).toBeDefined()

		expect(router.history.entries).toEqual([])
		expect(router.history.index).toBe(0)

		router.navigate('/')
		expect(router.history.entries).toEqual(['/'])
		expect(router.history.index).toBe(0)

		expect(router.history.canGoBack()).toBe(false)
		expect(router.history.canGoForward()).toBe(false)

		router.navigate('/profile')
		expect(router.history.entries).toEqual(['/', '/profile'])
		expect(router.history.index).toBe(1)

		router.navigate('/about')
		expect(router.history.entries).toEqual(['/', '/profile', '/about'])
		expect(router.history.index).toBe(2)

		router.navigate('/')
		expect(router.history.entries).toEqual(['/', '/profile', '/about', '/'])
		expect(router.history.index).toBe(3)

		router.history.back()
		router.history.back()
		expect(router.history.entries).toEqual(['/', '/profile', '/about', '/'])
		expect(router.history.index).toBe(1)

		router.history.forward()
		expect(router.history.entries).toEqual(['/', '/profile', '/about', '/'])
		expect(router.history.index).toBe(2)

		router.navigate('/profile')
		expect(router.history.entries).toEqual([
			'/',
			'/profile',
			'/about',
			'/profile',
		])
		expect(router.history.index).toBe(3)

		router.navigate('/redirect')
		expect(router.history.entries).toEqual([
			'/',
			'/profile',
			'/about',
			'/profile',
			'/',
		])
		expect(router.history.index).toBe(4)
	})

	test('Handler redirect & halting', () => {
		expect(router).toBeDefined()
		router.navigate('/redirect')
		expect(output).toBe('')
		output = ''
		router.navigate('/halt')
		expect(output).toBe('')
	})
})
test('Settings.basePath', async () => {
	const router = createPineconeRouter('pinecone-router', version, '/')
	// Test basePath setting
	router.settings({ basePath: '/test' })

	// Should automatically add basePath to routes
	router.add('/', {})
	router.add('/hello', {})
	router.add('/about', {})

	expect(router.routes.has('/test/hello')).toBe(true)

	// Should add basePath to navigation
	await router.navigate('/hello')
	expect(router.context.path).toBe('/test/hello')

	// Test navigation with absolute path including basePath
	await router.navigate('/test/about')
	expect(router.context.path).toBe('/test/about')

	// Test that history entries include basePath
	expect(router.history.entries).toEqual(['/test/hello', '/test/about'])
})
