import { sendThankYouEmail } from './src/config/email.js';

async function test() {
  console.log('Starting email test...');
  try {
    // Replace with a real email to test if you want, or just check the logs
    const testEmail = 'sakshikolhe.anantkamal@gmail.com';
    const testName = 'Test User';
    
    console.log(`Sending thank you email to ${testEmail}...`);
    const result = await sendThankYouEmail(testEmail, testName, 'contact');
    console.log('Result:', result ? 'Success' : 'Failed (no result)');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

test();
