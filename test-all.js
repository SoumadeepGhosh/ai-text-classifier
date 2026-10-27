const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./dist/app.js').default;

const testCases = [
  {
    name: '1. Health check',
    path: '/health',
    method: 'GET',
    expectedStatus: 200,
  },
  {
    name: '2. Missing text field (Validation 400)',
    path: '/api/classify',
    method: 'POST',
    body: {},
    expectedStatus: 400,
  },
  {
    name: '3. Empty text string (Validation 400)',
    path: '/api/classify',
    method: 'POST',
    body: { text: '   ' },
    expectedStatus: 400,
  },
  {
    name: '4. Non-string text field (Validation 400)',
    path: '/api/classify',
    method: 'POST',
    body: { text: 12345 },
    expectedStatus: 400,
  },
  {
    name: '5. Oversized text input >5000 chars (Validation 400)',
    path: '/api/classify',
    method: 'POST',
    body: { text: 'x'.repeat(5001) },
    expectedStatus: 400,
  },
  {
    name: '6. Route Not Found 404',
    path: '/api/non-existent-route',
    method: 'GET',
    expectedStatus: 404,
  },
  {
    name: '7. Live AI Classification: Complaint',
    path: '/api/classify',
    method: 'POST',
    body: { text: 'I have not received my refund.' },
    expectedStatus: 200,
    expectedCategory: 'Complaint',
  },
  {
    name: '8. Live AI Classification: Query',
    path: '/api/classify',
    method: 'POST',
    body: { text: 'How do I track my shipment status?' },
    expectedStatus: 200,
    expectedCategory: 'Query',
  },
  {
    name: '9. Live AI Classification: Feedback',
    path: '/api/classify',
    method: 'POST',
    body: { text: 'The new user interface is wonderfully sleek and fast!' },
    expectedStatus: 200,
    expectedCategory: 'Feedback',
  },
  {
    name: '10. Live AI Classification: Other',
    path: '/api/classify',
    method: 'POST',
    body: { text: 'Hello, good afternoon.' },
    expectedStatus: 200,
    expectedCategory: 'Other',
  },
];

async function runTests() {
  const server = app.listen(0, async () => {
    const port = server.address().port;
    console.log(`Running test suite on ephemeral port ${port} (model: ${process.env.GEMINI_MODEL})\n`);

    let passedCount = 0;
    let failedCount = 0;

    for (const tc of testCases) {
      try {
        const payload = tc.body !== undefined ? JSON.stringify(tc.body) : '';
        const res = await new Promise((resolve, reject) => {
          const req = http.request(
            {
              hostname: '127.0.0.1',
              port,
              path: tc.path,
              method: tc.method,
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
              },
            },
            (response) => {
              let data = '';
              response.on('data', (chunk) => (data += chunk));
              response.on('end', () => {
                let parsed;
                try {
                  parsed = JSON.parse(data);
                } catch {
                  parsed = data;
                }
                resolve({ status: response.statusCode, data: parsed });
              });
            }
          );
          req.on('error', reject);
          if (payload) req.write(payload);
          req.end();
        });

        const statusOk = res.status === tc.expectedStatus;
        const categoryOk = !tc.expectedCategory || (res.data && res.data.category === tc.expectedCategory);

        if (statusOk && categoryOk) {
          console.log(`PASS: ${tc.name}`);
          passedCount++;
        } else {
          console.error(`FAIL: ${tc.name}`);
          console.error(`  Expected status: ${tc.expectedStatus}, got: ${res.status}`);
          if (tc.expectedCategory) {
            console.error(`  Expected category: ${tc.expectedCategory}, got: ${res.data?.category}`);
          }
          console.error(`  Response body:`, res.data);
          failedCount++;
        }
      } catch (err) {
        console.error(`ERROR in ${tc.name}:`, err.message);
        failedCount++;
      }
    }

    console.log(`\nTest results: ${passedCount} passed, ${failedCount} failed`);

    server.close();
    process.exit(failedCount > 0 ? 1 : 0);
  });
}

runTests();
