const http = require('http');

const server = http.createServer((req, res) => {
  // 1. Handle Form Submission (POST)
  if (req.method === 'POST' && req.url === '/submit') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const formData = new URLSearchParams(body);
      const data = JSON.stringify({ name: formData.get('itemName') });

      // Send data to the Backend API (api-service)
      const options = {
        hostname: 'api-service-active', 
        port: 3000,
        path: '/items',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
      };

      const apiReq = http.request(options, () => {
        // Redirect back to the home page after saving
        res.writeHead(302, { 'Location': '/' });
        res.end();
      });
      apiReq.write(data);
      apiReq.end();
    });
    return;
  }

  // 2. Show the Webpage and Fetch Data (GET)
  http.get('http://api-service-active:3000/items', (apiRes) => {
    let data = '';
    apiRes.on('data', chunk => data += chunk);
    apiRes.on('end', () => {
      let listHtml = '<li>No items yet!</li>';
      try {
        const items = JSON.parse(data);
        if (items.length > 0) {
          listHtml = items.map(i => `<li>${i.name}</li>`).join('');
        }
      } catch (e) {
        listHtml = '<li>Error loading items</li>';
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <body style="text-align:center; font-family:sans-serif; margin-top:50px;">
            <h1>My Fullstack Data App</h1>
            <form method="POST" action="/submit">
              <input type="text" name="itemName" placeholder="Enter a new item" required />
              <button type="submit">Save to Database</button>
            </form>
            <h3>Saved Items in MongoDB:</h3>
            <ul style="list-style-type: none;">${listHtml}</ul>
          </body>
        </html>
      `);
    });
  }).on('error', () => {
    res.end('<h1>Error connecting to Backend API</h1>');
  });
});

server.listen(3000, () => console.log('Frontend Web running on port 3000'));
