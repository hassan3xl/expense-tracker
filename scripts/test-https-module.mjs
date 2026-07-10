import https from 'https';

console.log("Testing with https module (IPv4)...");
const req = https.request('https://ep-steep-wind-abejzkn2.eu-west-2.aws.neon.tech/', {
  method: 'HEAD',
  family: 4 // Force IPv4
}, (res) => {
  console.log('Status:', res.statusCode);
});

req.on('error', (e) => {
  console.error('Error:', e);
});

req.end();
