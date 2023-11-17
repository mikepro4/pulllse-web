const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
 
const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 9999;
const hostname = process.env.HOST || `localhost`;

// when using middleware `hostname` and `port` must be provided below

function ensureSecure(req, res, next) {
    console.log('x-forwarded-proto:', req.headers["x-forwarded-proto"]); // Debug log
    if (req.headers["x-forwarded-proto"] === "https" || req.headers["x-forwarded-proto"] === undefined) {
        // Request was via https, so do no special handling
        next({ dev, hostname, port })
    } else {
        // Redirect to https
        res.redirect('https://' + req.hostname + req.url);
    }
}


const app = next({ dev, hostname, port })

 // Apply the middleware only in production
 if (process.env.NODE_ENV === 'production') {
    app.use(ensureSecure);
}
const handle = app.getRequestHandler()
 
app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
      const { pathname, query } = parsedUrl
 
      if (pathname === '/a') {
        await app.render(req, res, '/a', query)
      } else if (pathname === '/b') {
        await app.render(req, res, '/b', query)
      } else {
        await handle(req, res, parsedUrl)
      }
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })
    .once('error', (err) => {
      console.error(err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`)
    })
})