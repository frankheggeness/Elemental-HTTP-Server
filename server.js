const http = require('http');
const fs = require('fs');
const qs = require('querystring');

const server = http.createServer(function(req, res) {
  if (req.method === 'GET') {
    if (req.url === '/') {
      fs.readFile('./public/index.html', 'utf8', (err, data) => {
        if (err) {
          return res.end(`Error: ${err}`);
        } else {
          return res.end(data);
        }
      });
    }

    fs.readFile(`./public${req.url}`, 'utf8', (err, data) => {
      if (err) {
        return res.end(`Error: ${err}`);
      } else {
        return res.end(data);
      }
    });
  }

  if (req.method === 'POST' && req.url === '/elements') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', (chunk) => {
      if (chunk) {
        body += chunk;
      } else {
        let parsedBody = qs.parse(body);
        let pageTemplate = `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta http-equiv="X-UA-Compatible" content="ie=edge" />
            <title>Document</title>
            <link rel="stylesheet" href="css/styles.css" />
          </head>
          <body>
          <h1>${parsedBody.elementName}</h1>
          <h2>${parsedBody.elementSymbol}</h2>
          <h3>${parsedBody.elementAtomicNumber}</h3>
          <p>${parsedBody.elementDescription}</p>
          <p><a href="/">back</a></p>
          </body>
        </html>`;
        fs.writeFile(`./public/${parsedBody.elementName.toLowerCase()}.html`, pageTemplate, (err, data) => {
          if (err) {
            res.writeHead(500);
            return res.end('{ "success": false }');
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end('{ "success": true }');
        });
      }
    });

    // req.on('data', (data) => {
    //   body = qs.parse(data);
    //   fs.writeFile(`./public/elements.js`, data, function(err) {
    //     if (err) {
    //       return console.log(err);
    //     }

    //     console.log('The file was saved!');
    //   });
    //   return res.end(data);
    // });
  }
});

server.listen(8080, () => {
  console.log(`Server is ON`);
});
