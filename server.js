// require("dotenv").config({ path: "./config.env" });


const express = require("express");
const sslRedirect = require('heroku-ssl-redirect').default;
const app = express();
const server = require("http").Server(app);
const next = require("next");
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
const proxy = require ("express-http-proxy");
const PORT = process.env.PORT || 9999;
const PROXY_ROUTE = "/api";
const HOST = process.env.HOST || `localhost:${PORT}`;
const dns  = require("node:dns");

dns.setDefaultResultOrder('ipv4first');

// enable ssl redirect
// HTTPS Redirect Middleware
function ensureSecure(req, res, next) {
    console.log('x-forwarded-proto:', req.headers["x-forwarded-proto"]); // Debug log
    if (req.headers["x-forwarded-proto"] === "https" || req.headers["x-forwarded-proto"] === undefined) {
        // Request was via https, so do no special handling
        next();
    } else {
        // Redirect to https
        res.redirect('https://' + req.hostname + req.url);
    }
}

 // Apply the middleware only in production
 if (process.env.NODE_ENV === 'production') {
    app.use(ensureSecure);
}


app.use(
    PROXY_ROUTE,
    proxy("http://mikhailcoapi.herokuapp.com", {
        proxyReqOptDecorator: opts => {
            opts.headers["x-forwarded-host"] = HOST;
            return opts;
        }
    })
    // proxy("http://localhost:3000/", {
    //     proxyReqOptDecorator: opts => {
    //         opts.headers["x-forwarded-host"] = HOST;
    //         return opts;
    //     }
    // })
);

app.use(express.json()); // this is the body parser

nextApp.prepare().then(() => {

   

    app.all('*', (req, res) => handle(req, res));

    server.listen(PORT, err => {
        if(err) throw err;
        console.log(`Express server running on port ${PORT}`)
    })
})