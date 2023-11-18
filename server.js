const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 9999;
const hostname = process.env.HOST || `localhost`;

// when using middleware `hostname` and `port` must be provided below


const app = next({ dev, hostname, port })

// Apply the middleware only in production

const handle = app.getRequestHandler()



app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            // Be sure to pass `true` as the second argument to `url.parse`.
            // This tells it to parse the query portion of the URL.
            const parsedUrl = parse(req.url, true)
            const { pathname, query } = parsedUrl

            if (req.headers["x-forwarded-proto"] === "https" || req.headers["x-forwarded-proto"] === undefined) {
                if (pathname === '/a') {
                    await app.render(req, res, '/a', query)
                } else if (pathname === '/b') {
                    await app.render(req, res, '/b', query)
                } else {
                    await handle(req, res, parsedUrl)
                }
            } else {
                // Redirect to https
                handle(req, res, { pathname: `https://${req.headers.host}${req.url}` })
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