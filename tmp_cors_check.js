const http = require('http');
const options = {
  host: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'OPTIONS',
  headers: {
    Origin: 'http://localhost:5174',
    'Access-Control-Request-Method': 'POST'
  }
};
const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  console.log(res.headers);
  res.on('data', (d) => process.stdout.write(d));
  res.on('end', () => process.exit(0));
});
req.on('error', (e) => {
  console.error('ERR', e.message);
  process.exit(1);
});
req.end();
