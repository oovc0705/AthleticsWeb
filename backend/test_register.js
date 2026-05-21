const axios = require('axios');

const API_URL = 'http://localhost:3006/api/auth/register';

const testRegister = async () => {
  const randomStr = Math.random().toString(36).substring(7);
  
  // Test 1: Duplicate Username
  const userDuplicateName = {
    name: 'admin', // assuming 'admin' exists
    email: `email_${randomStr}@test.com`,
    password: 'password123',
    country: 'CN'
  };

  console.log('Attempting to register with duplicate USERNAME:', userDuplicateName);

  try {
    const response = await axios.post(API_URL, userDuplicateName);
    console.log('Registration success (unexpected):', response.data);
  } catch (error) {
    console.error('Registration failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testRegister();
