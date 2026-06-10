const http = require('http');

http.get('http://localhost:5173/uploads/logo-netflix-1781074760347.png', (res) => {
  console.log('Vite Proxy Status Code:', res.statusCode);
  console.log('Vite Proxy Headers:', res.headers);
  process.exit(0);
}).on('error', (err) => {
  console.error('Error connecting to Vite:', err.message);
  process.exit(1);
});
