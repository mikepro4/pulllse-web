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
app.use(sslRedirect(['production'], 301));

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