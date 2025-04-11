import { describe, expect, test } from 'bun:test'
import { interpolate } from './templates'

describe('Templates', () => {
	test('interpolate', () => {
		const urls = ['/', '/users/:id.html']
		let params: Record<string, string> = { id: '1' }
		expect(interpolate(urls, params)).toEqual(['/', '/users/1.html'])
		params = { id: '2' }
		expect(interpolate(urls, params)).toEqual(['/', '/users/2.html'])
	})
})
