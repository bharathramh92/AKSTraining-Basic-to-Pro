/*jshint esversion: 6 */

const Express = require('express');
const Path = require("path")
const Http = require("http");
const Https = require("https");
const Axios = require("axios");
const DotEnv = require("dotenv");
const FS = require("fs");

const _express = Express();
const _httpServer = Http.createServer(_express);
DotEnv.config();

const baseFolderPath = Path.resolve(__dirname);
var privateKey = FS.readFileSync(baseFolderPath + process.env.KEY_FILENAME).toString();
var certificate = FS.readFileSync(baseFolderPath + process.env.CERT_FILENAME);

var tlsCreds = {key: privateKey, cert: certificate};
const _httpsServer = Https.createServer(tlsCreds, _express);

// const options =
// {

//     pfx: certificate,
//     passphrase: "<pwd>"

// };
// const _httpsServer = Https.createServer(options, _express);

_express.use(Express.json
({

    extended: true

}));

_express.use(Express.urlencoded
({

    extended: true

}));
    

_express.get('/', (req, res) =>
{
    
    let dt = new Date();
    const body = {};
    body.responseTime = dt.toLocaleTimeString();
    res.send(body);

});

_express.get('/bkend', (req, res) =>
{
    
    let dt = new Date();
    const body = {};

    Axios.get(process.env.API_URL)
    .then((response) =>
    {

        const data = response.data.toString() + dt.toLocaleDateString();
        body.data = data;
        res.send(body);

    }).catch((error) =>
    {

        const data = error.message + dt.toLocaleDateString();
        body.data = data;
        res.send(body);

    });

});

_express.post('/api/post', (req, res) =>
{
    
    let dt = new Date();
    const body = req.body;
    body.responseTime = dt.toLocaleTimeString();
    res.send(body);

});

_express.post('/api/post/bkend', (req, res) =>
{
    
    let dt = new Date();
    const body = {};

    Axios.post(process.env.API_URL + "/api/post").then((response) =>
    {
        
        const data = response.data + '\n' + dt.toLocaleDateString();
        body.data = data;
        res.send(body);

    }).catch((error) =>
    {

        const data = error.message + '\n' + dt.toLocaleDateString();
        body.data = data;
        res.send(body);

    });

});

let httpPort = process.env.PORT || 8081;
let httpsPort = process.env.PORT || 8443;
let host = "0.0.0.0";
_httpServer.listen(httpPort, host, function ()
{

    console.log(`Docker container started the server on http ${_httpServer.address().port}\n`);

});

_httpsServer.listen(httpsPort, host, function ()
{

    console.log(`Docker container started the server on https ${_httpsServer.address().port}\n`);

});

_httpServer.on("close", function ()
{

    console.log("We are Closing ç\n");

});

_httpsServer.on("close", function ()
{

    console.log("We are Closing Https\n");


});

process.on("SIGINT", function()
{
    _httpServer.close();
    _httpsServer.close();

});
