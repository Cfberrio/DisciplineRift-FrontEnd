const http = require('http');

const data = JSON.stringify({
  preview: true,
  testEmail: null,
  limit: null
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/send-cancellation-emails',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(responseData);
      
      if (jsonData.success && jsonData.students) {
        const students = jsonData.students;
        console.log('Datos obtenidos correctamente');
        console.log('Total estudiantes:', students.length);
        
        // Mostrar estructura para ver si incluye teléfonos
        if (students.length > 0) {
          console.log('Estructura del primer estudiante:');
          console.log(JSON.stringify(students[0], null, 2));
        }
        
      } else {
        console.log('Error obteniendo datos:', jsonData);
      }
    } catch (error) {
      console.log('Error parsing JSON:', error.message);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.log('Request error:', error.message);
  console.log('El servidor probablemente no está corriendo en localhost:3000');
});

req.end();


