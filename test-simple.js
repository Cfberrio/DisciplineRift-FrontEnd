const http = require('http');

const testData = {
  preview: false,
  testEmail: 'cfberrio@uninorte.edu.co',
  limit: 1,
  specificTeam: 'prueba'
};

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/send-cancellation-emails',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
    try {
      const data = JSON.parse(body);
      console.log('Parsed:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Could not parse JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(JSON.stringify(testData));
req.end();