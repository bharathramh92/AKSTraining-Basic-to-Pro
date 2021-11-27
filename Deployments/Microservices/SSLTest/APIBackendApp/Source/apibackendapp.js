/*jshint esversion: 6 */

const Express = require('express');
const Path = require("path");
const Http = require("http");
const Https = require("https");
const FS = require("fs");
const DotEnv = require("dotenv");

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

_express.get('/', (req, res) =>
{
    
    res.send('This is apibackendapp GET');

});

_express.post('/api/post', (req, res) =>
{
    
    res.send('This is apibackendapp POST\n');

});

let httpPort = process.env.PORT || 9081;
let httpsPort = process.env.PORT || 9443;
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
