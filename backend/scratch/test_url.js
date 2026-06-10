const http = require('http');

http.get('http://127.0.0.1:5000/uploads/logo-netflix-1781074760347.png', (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  process.exit(0);
}).on('error', (err) => {
  console.error('Error connecting to backend:', err.message);
  process.exit(1);
});
