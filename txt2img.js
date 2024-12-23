const axios = require('axios');

// Send a POST request
async function postData() {
    // Define the API endpoint URL and the data you want to send
    const apiUrl = 'http://192.168.1.234:7860/sdapi/v1/txt2img';
    const postData = {
    prompt: 'Test'
    };

    const response = await axios.post(apiUrl, postData);
    console.log('Response from the API:', response.data);
}

postData();

/*
  .then(response => {
    console.log('Response from the API:', response.data);
  })
  .catch(error => {
    console.error('Error making the POST request:', error);
  });
*/