const express = require('express')
 config = require('./config'),
 { forEach } = require('lodash'),
 path = require('path'),
 cors = require('cors');

const allowedOrigins = [
'http://localhost:8080',
'http://localhost:4200',
'https://localhost:4200',
'localhost:27017'
];

const ACCESS_CONTROLS_HEADERS = [
    'Authorization',
    'Content-Type',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'X-Requested-With',
    'X-Access-Token'
]
const ACCESS_CONTROLS = ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'];
const corsOptions = {
    origin: function(origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) return callback(null, true);
        else { console.log('failed origin', origin)}
    },
    optionSuccessStatus: 200,
    methods: ACCESS_CONTROLS.toString(),
    allowedHeaders: ACCESS_CONTROLS_HEADERS.toString(),
    credentials: false
}

 const router = express.Router();

// @TODO cors headers 
router.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.header('origin'));
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
    res.header("Access-Control-Allow-Credentials","true");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    return next();
});

forEach(config.getGlobbedFiles('./api/**/*.routes.js'), routePath => {
    const mod = path.resolve(routePath);
    require(mod)(router);
})

module.exports = [cors(corsOptions), router];