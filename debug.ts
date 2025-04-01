import { parse } from './src/route'

let res = parse('/api/')
let m = res.exec('/api/a')
console.log({ m })
if (m?.groups) {
	console.log('m', m.groups)
}
