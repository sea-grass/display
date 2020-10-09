const https = require('https');
const express=require('express');
const path=require('path');
const fs = require('fs');
require('dotenv').config();

startDevServer(
    process.env.DEV_PRIVATE_KEY,
    process.env.DEV_PRIVATE_CERT,
    process.env.DEV_PORT,
    path.join(__dirname, '../docs')
)

function startDevServer(key, cert, port, staticDir) {
    console.log("startDevServer", arguments);
    const app = express();
    app.use(express.static(staticDir));
    const options = {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert)
    }
    https.createServer(options, app).listen(port);
    console.log("Dev server listening at " + "https://localhost:"+port);
}