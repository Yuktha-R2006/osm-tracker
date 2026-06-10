const http = require('http');

http.get('http://localhost:5173/uploads/logo-netflix-1781068106034.png', (res) => {
  console.log('STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
  res.resume();
}).on('error', (e) => {
  console.error('ERROR:', e.message);
});
