// Test script to verify GPX upload functionality
const fs = require('fs');
const path = require('path');

// Create a test GPX file
const testGpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Test GPX" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Ruta de prueba</name>
    <trkseg>
      <trkpt lat="43.3623" lon="-8.4115">
        <ele>50</ele>
        <time>2024-01-01T10:00:00Z</time>
      </trkpt>
      <trkpt lat="43.3624" lon="-8.4116">
        <ele>52</ele>
        <time>2024-01-01T10:01:00Z</time>
      </trkpt>
      <trkpt lat="43.3625" lon="-8.4117">
        <ele>55</ele>
        <time>2024-01-01T10:02:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`;

// Write the test GPX file
const testGpxPath = path.join(__dirname, 'test-upload.gpx');
fs.writeFileSync(testGpxPath, testGpxContent);

console.log('✅ Test GPX file created successfully:', testGpxPath);
console.log('📁 File size:', fs.statSync(testGpxPath).size, 'bytes');
console.log('🔍 You can now use this file to test the GPX upload functionality in the application.');
console.log('');
console.log('To test:');
console.log('1. Open the application in your browser');
console.log('2. Click on "Añadir ruta" button');
console.log('3. Fill in the required fields (at least "Nombre de la ruta")');
console.log('4. In the "Track GPS (GPX/KML)" section, click "Subir Track"');
console.log('5. Select the test-upload.gpx file');
console.log('6. You should see a success message and the file name displayed');
console.log('7. Submit the form to create the route');
console.log('8. After creation, you should see a download button for the GPS track');