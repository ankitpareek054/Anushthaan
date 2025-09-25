import axios from 'axios';

const getProfileUrl = async (fileName) => {
  try {
    if (!fileName) {
      console.error('❌ getProfileUrl: fileName is missing');
      return null;
    }

    const token = localStorage.getItem('token');
    
    // Send the file name as part of the URL, not in the body
    const response = await axios.post(
      `http://localhost:5000/api/getPresignedUrls/${fileName}`, // <-- Fix: Include fileName in URL as param
      {}, // Empty body
      {
        headers: {
          Authorization: `Bearer ${token}`, // Optional: Ensure token is sent if needed
        },
      }
    );

    const imageUrl = response?.data?.presignedUrl;
    if (imageUrl) {
      return imageUrl;
    } else {
      console.error('getProfileUrl: No URL returned in response');
      return null;
    }
  } catch (error) {
    console.error('getProfileUrl: Failed to fetch URL', error);
    return null;
  }
};

export default getProfileUrl;
