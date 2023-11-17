// server.js
const { createServer } = require('http');
const next = require('next');
const absoluteUrl = require('next-absolute-url').default;
const { parse } = require('url');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => createServer((req, res) => {
	const { url } = req;
	const { protocol, host } = absoluteUrl(req);

	if (!dev && protocol === 'http:') {
		res.writeHead(301, {
			Location: `https://${host}${url}`
		});
		res.end();
		return {};
	}

	const parsedUrl = parse(url, true);
	return handle(req, res, parsedUrl);
}).listen(3000, (err) => {
	if (err) throw err;
	console.log('> Sever is running!');
}));