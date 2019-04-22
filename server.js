const http = require('http');
const fs = require('fs');
const qs = require('querystring');

const authorizedUsers = {
  banana: 'peel',
};

const server = http.createServer(function(req, res) {
  // GET

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

  // POST

  if (req.method === 'POST' && req.url === '/elements') {
    if (req.headers.authorization) {
      const encodedString = req.headers.authorization.slice(6);
      const base64Buffer = new Buffer(encodedString, 'base64');
      const decodedString = base64Buffer.toString();
      let username = decodedString.slice(0, decodedString.indexOf(':'));
      let password = decodedString.slice(decodedString.indexOf(':') + 1);

      if (authorizedUsers.hasOwnProperty(username) && authorizedUsers[username] === password) {
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
            let elementName = parsedBody.elementName.toLowerCase();
            fs.writeFile(`./public/${elementName}.html`, pageTemplate, (err, data) => {
              if (err) {
                res.writeHead(500);
                return res.end('{ "success": false }');
              } else {
                updateIndex();
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end('{ "success": true }');
            });
          }
        });
      } else {
        res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="SecureArea"' });
        return res.end(`<html><body>Invalid Authentication Credentials</body></html>`);
      }
    } else {
      res.writeHeader(401, { 'WWW-Authenticate': 'Basic realm="SecureArea"' });
      return res.end(`<html><body>Not Authorized</body></html>`);
    }
  }

  // PUT
  if (req.method === 'PUT') {
    if (req.headers.authorization) {
      const encodedString = req.headers.authorization.slice(6);
      const base64Buffer = new Buffer(encodedString, 'base64');
      const decodedString = base64Buffer.toString();
      let username = decodedString.slice(0, decodedString.indexOf(':'));
      let password = decodedString.slice(decodedString.indexOf(':') + 1);

      if (authorizedUsers.hasOwnProperty(username) && authorizedUsers[username] === password) {
        fs.readdir(`./public`, (err, files) => {
          if (!files.includes(req.url.slice(1))) {
            res.writeHead(500);
            return res.end(`{ "error" : "resource ${req.url} does not exist" }`);
          }
        });
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
            fs.writeFile(`./public/${req.url}`, pageTemplate, (err, data) => {
              if (err) {
                res.writeHead(500);
                return res.end('{ "success": false }');
              } else {
                updateIndex();
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end('{ "success": true }');
            });
          }
        });
      } else {
        res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="SecureArea"' });
        return res.end(`<html><body>Invalid Authentication Credentials</body></html>`);
      }
    } else {
      res.writeHeader(401, { 'WWW-Authenticate': 'Basic realm="SecureArea"' });
      return res.end(`<html><body>Not Authorized</body></html>`);
    }
  }
  // DELETE

  if (req.method === 'DELETE') {
    if (req.headers.authorization) {
      const encodedString = req.headers.authorization.slice(6);
      const base64Buffer = new Buffer(encodedString, 'base64');
      const decodedString = base64Buffer.toString();
      let username = decodedString.slice(0, decodedString.indexOf(':'));
      let password = decodedString.slice(decodedString.indexOf(':') + 1);

      if (authorizedUsers.hasOwnProperty(username) && authorizedUsers[username] === password) {
        let dontDeleteFiles = ['/server.js', '/elementtest.js', '/css', '/.keep'];

        if (!dontDeleteFiles.includes(req.url)) {
          fs.unlink(`./public${req.url}`, (err) => {
            if (err) throw err;
            // update index
            updateIndex();
            return res.end(`${req.url} was deleted  `);
          });
        }
      } else {
        res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="SecureArea"' });
        return res.end(`<html><body>Invalid Authentication Credentials</body></html>`);
      }
    } else {
      res.writeHeader(401, { 'WWW-Authenticate': 'Basic realm="SecureArea"' });
      return res.end(`<html><body>Not Authorized</body></html>`);
    }
  }
});

server.listen(8080, () => {
  console.log(`Server is ON`);
});

// updateIndex function
function updateIndex() {
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
</head>    const decodedString = base64Buffer.toString();
let username = decodedString.slice(0, decodedString.indexOf(':'));
let password = decodedString.slice(decodedString.indexOf(':'));
if (authorizedUsers.hasOwnProperty(username) && authorizedUsers[username] === password) {
  postOrPut();
<body></body>
</html></h3>
<ol>
${fileList}
</ol>
</body>
</html>`;
    }
  });
}
