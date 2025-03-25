import { describe, expect, test } from 'bun:test'
import Alpine from 'alpinejs'

import { createPineconeRouter } from './router'

const router = createPineconeRouter('7.0.0')
router.add('/', {})
router.add('/profile', {})
router.add('/about', {})
Alpine.start()

describe('Router', () => {
	test('Navigation Stack', () => {
		expect(router).toBeDefined()

		expect(router.context.navigationStack).toEqual([])
		expect(router.context.navigationIndex).toBe(0)

		router.navigate('/')
		expect(router.context.navigationStack).toEqual(['/'])
		expect(router.context.navigationIndex).toBe(0)

		router.navigate('/profile')
		expect(router.context.navigationStack).toEqual(['/', '/profile'])
		expect(router.context.navigationIndex).toBe(1)

		router.navigate('/about')
		expect(router.context.navigationStack).toEqual(['/', '/profile', '/about'])
		expect(router.context.navigationIndex).toBe(2)

		router.navigate('/')
		expect(router.context.navigationStack).toEqual([
			'/',
			'/profile',
			'/about',
			'/',
		])
		expect(router.context.navigationIndex).toBe(3)

		router.back()
		router.back()
		expect(router.context.navigationStack).toEqual([
			'/',
			'/profile',
			'/about',
			'/',
		])
		expect(router.context.navigationIndex).toBe(1)

		router.forward()
		expect(router.context.navigationStack).toEqual([
			'/',
			'/profile',
			'/about',
			'/',
		])
		expect(router.context.navigationIndex).toBe(2)

		router.navigate('/profile')
		expect(router.context.navigationStack).toEqual([
			'/',
			'/profile',
			'/about',
			'/profile',
		])
		expect(router.context.navigationIndex).toBe(3)
	})
})
