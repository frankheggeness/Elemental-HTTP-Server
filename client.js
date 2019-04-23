'use strict';

const fs = require('fs');
const http = require('http');
const net = require('net');

let port = 80;
let args = process.argv;
let headerRequest = false;
let headerObj = {};
let saveResponse = false;
let fileName;

// user manual

if (!args[2]) {
  console.log('no argument');
}

// authorization
let username;
let password;
let authorizationData;
let buff;
let encodedPass;
let method = 'GET';

if (args.includes('-clearance')) {
  username = args[args.indexOf('-clearance') + 1];
  password = args[args.indexOf('-clearance') + 2];
  authorizationData = `${username}:${password}`;
  buff = new Buffer(authorizationData);
  encodedPass = buff.toString('base64');
}

// check for methods
let methodsArray = ['GET', 'POST', 'DELETE', 'PUT'];

if (methodsArray.includes(args[3])) {
  method = args[3];
}

if (args.includes('-save')) {
  let saveIndex = args.indexOf('-save');
  fileName = args[saveIndex + 1];
}
// get host

let argument = args[2];
let host = argument.substring(0, argument.indexOf('.com') + 4);
let URI = argument.substring(argument.indexOf('.com') + 4, argument.length);

if (argument.indexOf('localhost') !== -1) {
  host = 'localhost';
  port = 8080;

  let findURI = argument.indexOf('/');
  URI = argument.substring(findURI, argument.length);
}

// make request
let request = `${method} ${URI} HTTP/1.1\r\n`;
request += `host: ${host}\r\n`;
request += `date: ${new Date().toUTCString()}\r\n`;
request += `Authorization:Basic ${encodedPass}\r\n`;
request += `\r\n`;

// POST REQUEST
if (method === 'POST') {
  let request = `${method} ${URI} HTTP/1.1\r\n`;
  request += `host: ${host}\r\n`;
  request += `date: ${new Date().toUTCString()}\r\n`;
  request += `Authorization:Basic ${encodedPass}\r\n`;
  request += `Content-Type: application/x-www-form-urlencoded\r\n`;
  request += `Content-Length: 89 \r\n`;
  request += `\r\n`;
  request += `elementName=securitytesttest&elementAtomicNumber=9&elementSymbol=D&elementDescription=test`;
  console.log(request);
  // request += `elementAtomicNumber=12\r\n`;
  // request += `elementSymbol=B\r\n`;
  // request += `elementDescription=This is a test desciprtion\r\n`;
}

console.log(method);
const client = net.createConnection(port, host, () => {
  client.setEncoding('utf-8');
  client.on('connect', () => {
    console.log('connected');
  });

  client.write(request);
});

client.on('data', (data) => {
  // status errors
  let status = data.slice(data.indexOf('.') + 3, data.indexOf('\r\n'));
  if (status[0] === '4') {
    process.stdout.write(`Client Error: ${status}\r\n`);
  } else if (status[0] === '5') {
    process.stdout.write(`Server Error: ${status}\r\n`);
  } else if (status[0] === '3') {
    process.stdout.write(`Redirection: ${status}\r\n`);
  }

  process.stdout.write(data);
});

// end client
client.on('end', () => {
  console.log('The connection has ended');
});

client.on('error', () => {
  console.log('CAUTION ERROR');
  process.exit();
});
