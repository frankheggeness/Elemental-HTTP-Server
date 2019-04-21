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
          fs.readdir(`./public`, (err, files) => {
            if (err) {
              throw new Error(err);
            } else {
              let numberOfElements = 0;
              let ignoreFiles = ['server.js', 'elementtest.js', 'css', '.keep'];
              let fileList = '';
              files.forEach((file) => {
                if (!ignoreFiles.includes(file)) {
                  numberOfElements++;
                  let fileName = file.slice(0, file.indexOf('.'));
                  // fileName = fileName[0].toUpperCase + fileName.slice(1);
                  fileList += `
                  <li>
                  <a href="${file}">${fileName}</a>
                </li>`;
                }
              });
              let indexTemplate = `
              <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>The Elements</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <h1>The Elements</h1>
  <h2>These are all the known elements.</h2>
  <h3>These are ${numberOfElements}<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>Document</title>
      <link rel="stylesheet" href="css/styles.css" />
    </head>
    <body></body>
  </html></h3>
  <ol>
    ${fileList}
  </ol>
</body>
</html>`;
              fs.writeFile(`./public/index.html`, indexTemplate, (err, data) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end('{ "success": true }');
              });
            }
          });
          // res.writeHead(200, { 'Content-Type': 'application/json' });
          // return res.end('{ "success": true }');
        });
      }
    });
  }
});

server.listen(8080, () => {
  console.log(`Server is ON`);
});
