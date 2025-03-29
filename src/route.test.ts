import { describe, expect, test } from 'bun:test'
import { match } from './route'

describe('Route Matching', () => {
	describe('Static Routes', () => {
		test('should match exact static paths', () => {
			expect(match('/profile', '/profile')).toEqual({})
			expect(match('/profile', '/profile/')).toEqual({})
			expect(match('/profile', '/about')).toBeUndefined()
		})

		test('should handle root path matching', () => {
			expect(match('/', '/')).toEqual({})
			expect(match('/', '')).toEqual({})
			expect(match('/', '/something')).toBeUndefined()
		})

		test('should handle empty pattern edge case', () => {
			expect(match('', '/')).toEqual({})
			expect(match('', '')).toEqual({})
		})
	})

	describe('Required Parameters', () => {
		test('should match required parameters', () => {
			expect(match('/user/:name', '/user/john')).toEqual({ name: 'john' })
			expect(match('/user/:name', '/user/john/')).toEqual({ name: 'john' })
			expect(match('/user/:name', '/user')).toBeUndefined()
			expect(match('/user/:name', '/user/')).toBeUndefined()
		})

		test('should handle special characters in parameter values', () => {
			expect(match('/user/:name', '/user/john-doe')).toEqual({
				name: 'john-doe',
			})
			expect(match('/user/:name', '/user/john_doe')).toEqual({
				name: 'john_doe',
			})
			expect(match('/user/:name', '/user/john.doe')).toEqual({
				name: 'john.doe',
			})
		})

		test('should not match paths with extra segments', () => {
			expect(match('/user/:name', '/user/john/extra')).toBeUndefined()
		})
	})

	describe('Optional Parameters', () => {
		test('should match paths with or without optional parameters', () => {
			expect(match('/profile/:one?/:two?', '/profile')).toEqual({})
			expect(match('/profile/:one?/:two?', '/profile/')).toEqual({})
			expect(match('/profile/:one?/:two?', '/profile/one')).toEqual({
				one: 'one',
			})
			expect(match('/profile/:one?/:two?', '/profile/one/')).toEqual({
				one: 'one',
			})
			expect(match('/profile/:one?/:two?', '/profile/one/two')).toEqual({
				one: 'one',
				two: 'two',
			})
		})

		test('should ignore skipped optional parameters', () => {
			expect(match('/profile/:one?/:two?', '/profile//two')).toEqual({
				one: 'two',
			})
		})
	})

	describe('Wildcard Parameters (*)', () => {
		test('should match zero or more segments with wildcard', () => {
			expect(match('/about/:inf*', '/about')).toEqual({})
			expect(match('/about/:inf*', '/about/')).toEqual({})
			expect(match('/about/:inf*', '/about/foo')).toEqual({ inf: 'foo' })
			expect(match('/about/:inf*', '/about/foo/bar')).toEqual({
				inf: 'foo/bar',
			})
		})

		test('should not multi double slashes in wildcards', () => {
			expect(match('/files/:path*', '/files//readme.md')).toEqual({
				path: 'readme.md',
			})

			expect(match('/files/:path*', '/files/docs//readme.md')).toEqual({
				path: 'docs//readme.md',
			})
		})
	})

	describe('One-or-More Parameters (+)', () => {
		test('should require at least one segment for plus modifier', () => {
			expect(match('/profile/:id+', '/profile')).toBeUndefined()
			expect(match('/profile/:id+', '/profile/')).toBeUndefined()
			expect(match('/profile/:id+', '/profile/foo')).toEqual({ id: 'foo' })
			expect(match('/profile/:id+', '/profile/foo/bar')).toEqual({
				id: 'foo/bar',
			})
			expect(match('/profile/:id+', '/profile/foo/bar/')).toEqual({
				id: 'foo/bar/',
			})
		})

		test('should handle very long paths with plus modifier', () => {
			const longPath = Array(10).fill('segment').join('/')
			expect(match('/deep/:path+', '/deep/' + longPath)).toEqual({
				path: longPath,
			})
		})
	})

	describe('Regex Constraints', () => {
		test('should match parameters with regex constraints', () => {
			expect(match('/product/:id<\\d+>', '/product/123')).toEqual({
				id: '123',
			})
			expect(match('/product/:id<\\d+>', '/product/abc')).toBeUndefined()
			expect(match('/product/:id<\\d+>', '/product')).toBeUndefined()
		})

		test('should match optional parameters with regex constraints', () => {
			expect(match('/product/:id?<\\d+>', '/product')).toEqual({})
			expect(match('/product/:id?<\\d+>', '/product/123')).toEqual({
				id: '123',
			})
			expect(match('/product/:id?<\\d+>', '/product/abc')).toBeUndefined()
		})

		test('should match wildcard parameters with regex constraints', () => {
			expect(match('/stats/:numbers*<[\\d/]+>', '/stats')).toEqual({})
			expect(match('/stats/:numbers*<[\\d/]+>', '/stats/123')).toEqual({
				numbers: '123',
			})
			expect(match('/stats/:numbers*<[\\d/]+>', '/stats/123/456')).toEqual({
				numbers: '123/456',
			})
			expect(match('/stats/:numbers*<[\\d/]+>', '/stats/abc')).toBeUndefined()
		})

		test('should match plus parameters with regex constraints', () => {
			expect(match('/users/:id+<\\d+>', '/users/123')).toEqual({
				id: '123',
			})
			expect(match('/users/:id+<\\d+>', '/users/alice')).toBeUndefined()
			expect(match('/users/:id+<\\d+>', '/users')).toBeUndefined()
			expect(match('/users/:id+<[\\d/]+>', '/users/123/456/5')).toEqual({
				id: '123/456/5',
			})
		})

		test('should handle complex regex patterns', () => {
			const uuidRegex =
				'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
			expect(
				match(
					`/users/:id<${uuidRegex}>`,
					'/users/123e4567-e89b-12d3-a456-426614174000'
				)
			).toEqual({
				id: '123e4567-e89b-12d3-a456-426614174000',
			})
			expect(
				match(`/users/:id<${uuidRegex}>`, '/users/invalid-uuid')
			).toBeUndefined()
		})
	})

	describe('URL Handling Edge Cases', () => {
		test('should handle URL encoded values', () => {
			expect(match('/user/:name', '/user/john%20doe')).toEqual({
				name: 'john doe',
			})
			expect(match('/search/:query', '/search/coffee%26tea')).toEqual({
				query: 'coffee&tea',
			})
		})

		test('should handle trailing slashes consistently', () => {
			expect(match('/about/', '/about')).toEqual({})
			expect(match('/about', '/about/')).toEqual({})
			expect(match('/about/', '/about/')).toEqual({})
		})
	})

	describe('Parameter Combinations', () => {
		test('should handle consecutive parameters', () => {
			expect(match('/:a/:b/:c', '/x/y/z')).toEqual({
				a: 'x',
				b: 'y',
				c: 'z',
			})
			expect(match('/:a/:b/:c', '/x/y')).toBeUndefined()
			expect(match('/:a/:b/:c', '/x/y/z/extra')).toBeUndefined()
		})

		test('should handle mixed parameter types', () => {
			expect(match('/:required/:optional?/:wildcard*', '/foo/bar')).toEqual({
				required: 'foo',
				optional: 'bar',
			})
			expect(match('/:required/:optional?/:wildcard*', '/foo/bar/baz')).toEqual(
				{
					required: 'foo',
					optional: 'bar',
					wildcard: 'baz',
				}
			)
			expect(
				match('/:required/:optional?/:wildcard*', '/foo/bar/baz/qux')
			).toEqual({
				required: 'foo',
				optional: 'bar',
				wildcard: 'baz/qux',
			})
		})

		test('should handle parameter followed by static segment', () => {
			expect(match('/:name/profile', '/john/profile')).toEqual({
				name: 'john',
			})
			expect(match('/:name/profile', '/john/settings')).toBeUndefined()
			expect(match('/:name/profile/:section?', '/john/profile/photos')).toEqual(
				{
					name: 'john',
					section: 'photos',
				}
			)
		})
	})

	describe('Complex Routes', () => {
		test('should handle parameter followed by wildcard', () => {
			expect(match('/users/:id<\\d+>/:rest*', '/users/123')).toEqual({
				id: '123',
			})
			expect(match('/users/:id<\\d+>/:rest*', '/users/123/test')).toEqual({
				id: '123',
				rest: 'test',
			})
			expect(match('/users/:id<\\d+>/:rest*', '/users/abc')).toBeUndefined()
		})

		test('should handle parameters with enum-like regex constraints', () => {
			expect(
				match('/users/:id/:status?<active|inactive>', '/users/123')
			).toEqual({ id: '123' })
			expect(
				match('/users/:id/:status?<active|inactive>', '/users/123/active')
			).toEqual({ id: '123', status: 'active' })
			expect(
				match('/users/:id/:status?<active|inactive>', '/users/123/blue')
			).toBeUndefined()
		})

		test('should handle GitHub-style routes with plus modifier', () => {
			expect(
				match('/:owner/:repo/:path+', '/amio/my-way/package.json')
			).toEqual({
				owner: 'amio',
				repo: 'my-way',
				path: 'package.json',
			})
			expect(
				match('/:owner/:repo/:path+', '/amio/my-way/src/index.ts')
			).toEqual({
				owner: 'amio',
				repo: 'my-way',
				path: 'src/index.ts',
			})
			expect(match('/:owner/:repo/:path+', '/amio/my-way')).toBeUndefined()
		})

		test('should handle GitHub-style routes with wildcard modifier', () => {
			expect(match('/:owner/:repo/:path*', '/amio/my-way')).toEqual({
				owner: 'amio',
				repo: 'my-way',
			})
			expect(
				match('/:owner/:repo/:path*', '/amio/my-way/src/index.ts')
			).toEqual({
				owner: 'amio',
				repo: 'my-way',
				path: 'src/index.ts',
			})
		})

		test('should handle API-style versioned routes', () => {
			expect(
				match('/api/:version<v\\d+>/:resource/:id?', '/api/v1/users')
			).toEqual({
				version: 'v1',
				resource: 'users',
			})
			expect(
				match('/api/:version<v\\d+>/:resource/:id?', '/api/v2/posts/123')
			).toEqual({
				version: 'v2',
				resource: 'posts',
				id: '123',
			})
			expect(
				match('/api/:version<v\\d+>/:resource/:id?', '/api/beta/users')
			).toBeUndefined()
		})

		test('should handle nested resource paths', () => {
			expect(
				match('/posts/:postId/comments/:commentId?', '/posts/123/comments')
			).toEqual({
				postId: '123',
			})
			expect(
				match('/posts/:postId/comments/:commentId?', '/posts/123/comments/456')
			).toEqual({
				postId: '123',
				commentId: '456',
			})
		})
	})

	describe('Edge Cases', () => {
		test('should handle numeric path segments correctly', () => {
			expect(match('/:year/:month/:day', '/2023/04/01')).toEqual({
				year: '2023',
				month: '04',
				day: '01',
			})
		})

		test('should handle parameter name conflicts correctly', () => {
			expect(match('/:param/static/:param', '/value1/static/value2')).toEqual({
				param: 'value2',
			})
		})

		test('should handle patterns with no parameters', () => {
			expect(match('/about/team/leadership', '/about/team/leadership')).toEqual(
				{}
			)
			expect(match('/about/team/leadership', '/about/team')).toBeUndefined()
		})
	})
})
