import { describe, expect, test } from 'bun:test'
import { parse } from './route'

function match(pattern: string, path: string): Record<string, string> | void {
	let m = parse(pattern).exec(path)
	if (m) {
		return { ...m.groups }
	}
}

describe('match function', () => {
	// Static routes
	test('static route matches exact path', () => {
		expect(match('/foo', '/foo')).toEqual({})
	})

	test('static route fails on mismatch', () => {
		expect(match('/foo', '/bar')).toBeUndefined()
	})

	test('nested static route matches exact path', () => {
		expect(match('/foo/bar', '/foo/bar')).toEqual({})
	})

	// Parameters
	test('route parameter captures path segment', () => {
		expect(match('/:title', '/hello')).toEqual({ title: 'hello' })
	})

	test('multiple parameters capture respective segments', () => {
		expect(match('/books/:genre/:title', '/books/fiction/dune')).toEqual({
			genre: 'fiction',
			title: 'dune',
		})
	})

	// Parameters with suffix
	test('parameter with suffix captures segment before suffix', () => {
		expect(match('/movies/:title.mp4', '/movies/inception.mp4')).toEqual({
			title: 'inception',
		})
	})

	test('parameter with suffix fails on incorrect suffix', () => {
		expect(match('/movies/:title.mp4', '/movies/inception.avi')).toBeUndefined()
	})

	// Optional parameters
	test('optional parameter captures value when present', () => {
		expect(match('/:title?', '/hello')).toEqual({ title: 'hello' })
	})

	test('optional parameter returns empty object when absent', () => {
		expect(match('/:title?', '/')).toEqual({})
	})

	test('nested optional parameter preserves other parameters when absent', () => {
		expect(match('/books/:genre/:title?', '/books/fiction')).toEqual({
			genre: 'fiction',
		})
	})

	// Wildcards
	test('wildcard captures entire remaining path', () => {
		expect(match('/books/:rest+', '/books/fiction/dune/chapter1')).toEqual({
			rest: 'fiction/dune/chapter1',
		})
	})

	test('parameter followed by wildcard captures both correctly', () => {
		expect(
			match('/books/:genre/:rest+', '/books/fiction/dune/chapter1')
		).toEqual({
			genre: 'fiction',
			rest: 'dune/chapter1',
		})
	})

	// Optional wildcards
	test('optional wildcard captures remaining path when present', () => {
		expect(match('/books/:book*', '/books/dune/chapter1')).toEqual({
			book: 'dune/chapter1',
		})
	})

	test('optional wildcard returns empty object when absent', () => {
		expect(match('/books/:book*', '/books')).toEqual({})
	})

	// Trailing slash handling
	test('routes match regardless of trailing slashes', () => {
		expect(match('/foo', '/foo/')).toEqual({})
		expect(match('/:foo', '/foo/')).toEqual({ foo: 'foo' })
		expect(match('/:foo+', '/foo/bar/')).toEqual({ foo: 'foo/bar/' })
		expect(match('/:foo*', '/foo/bar')).toEqual({ foo: 'foo/bar' })
	})

	test('encoded URL parameter is captured correctly', () => {
		expect(
			match(
				'/watch/:url',
				'/watch/' + encodeURIComponent('https://youtu.be/2942358')
			)
		).toEqual({
			url: encodeURIComponent('https://youtu.be/2942358'),
		})
	})
})
