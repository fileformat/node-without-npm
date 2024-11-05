import fs from 'node:fs';
import http from 'node:http';

process.on('SIGTERM', () => process.exit(15));
process.on('SIGINT', () => process.exit(2));

function escape(str) {
  return str.replace(/[&<>'"]/g, 
  tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag]));
}

function handleJsonp(req, res, data) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const callback = url.searchParams.get('callback');
  if (callback && callback != "") {
    res.writeHead(200, {'Content-Type': 'application/javascript'});
    res.write(`${callback}(${JSON.stringify(data)})`);
    res.end();
  } else {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET",
      "Access-Control-Max-Age": "604800",
      "Content-Type": "application/json",
    });
    res.write(JSON.stringify(data));
    res.end();
  }
}

function root(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="referrer" content="unsafe-url">
    <title>Node without NPM</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="https://cdn.simplecss.org/simple.css">
  </head>
  <body>
    <main>
      <h1>Welcome!</h1>
      <hr>
      <p>This is a simple NodeJS server built without NPM or packages of any sort.</p>
      <p>Your <code>User-Agent</code> header is <strong>${escape(
        req.headers["user-agent"]
      )}</strong>.</p>
      <p>Your IP address is <strong>${
        req.connection.remoteAddress
      }</strong>.</p>
      <p>The current time (on this server) is <strong>${new Date().toISOString()}</strong>.</p>
    </main>
    <footer>
      <p>
        <a href="https://github.com/fileformat/node-without-npm/">source</a>
        | <a href="https://andrew.marcuse.info/contact.html">contact</a>
      </p>
    </footer>
  </body>
</html>`);
  res.end();
}

function serveStaticFile(fileName, contentType) {
  const data = fs.readFileSync(fileName);
  return function(req, res) {
    res.writeHead(200, {'Content-Type': contentType});
    res.write(data);
    res.end();
  }
}

function status(req, res) {
  const data = {
    success: true,
    version: process.version,
    timestamp: new Date().toISOString(),
    lastmod: process.env['LASTMOD'] || '(not set)',
    commit: process.env['COMMIT'] || '(not set)',
    tech: `NodeJS ${process.version}`,
  }
  handleJsonp(req, res, data);
}

function main() {
  const router = new Map([
    ['/', root],
    ['/robots.txt', serveStaticFile('static/robots.txt', 'text/css')],
    ['/favicon.ico', serveStaticFile('static/favicon.ico', 'image/x-icon')],
    ['/favicon.svg', serveStaticFile('static/favicon.svg', 'image/svg+xml')],
    ['/status.json', status],
  ]);

  const port = parseInt(process.env.PORT || "4000");

  http.createServer(function (req, res) {

    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    if (router.has(path)) {
      router.get(path)(req, res);
    } else {
      if (path.endsWith('.json')) {
        handleJsonp(req, res, { success:false, message: `404: ${path} not found`});
        return;
      }
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write(`404: ${path} not found`);
      res.end();
    }
  }).listen(port);

  console.log(`Server running at http://localhost:${port}/`);
}

main();