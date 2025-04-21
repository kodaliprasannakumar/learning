// Example usage of the generate-media Lambda function

// Function to generate text responses
async function generateText(prompt) {
  try {
    const response = await fetch('https://kxjju6abc5.execute-api.us-west-2.amazonaws.com/default/generate-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'text',
        prompt: prompt,
        max_tokens: 200
      })
    });
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return data.response;
  } catch (error) {
    console.error('Error generating text:', error);
    throw error;
  }
}

// Function to generate an enhanced image from a doodle
async function generateImage(imageUrl, style = 'cartoon') {
  try {
    const response = await fetch('https://kxjju6abc5.execute-api.us-west-2.amazonaws.com/default/generate-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'image',
        doodleImage: imageUrl,
        style: style
      })
    });
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return {
      imageUrl: data.imageUrl,
      description: data.description
    };
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Function to generate a video representation from a doodle
async function generateVideo(imageUrl, description = '', style = 'cartoon') {
  try {
    const response = await fetch('https://kxjju6abc5.execute-api.us-west-2.amazonaws.com/default/generate-media', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mode: 'video',
        doodleImage: imageUrl,
        prompt: description,
        style: style
      })
    });
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    return {
      videoUrl: data.videoUrl,
      description: data.description,
      message: data.message
    };
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}

// Example usage:
// async function testLambdaFunction() {
//   try {
//     // Test text generation
//     const textResponse = await generateText('What are clouds made of?');
//     console.log('Text response:', textResponse);
//     
//     // Test image generation
//     const imageResponse = await generateImage('https://example.com/doodle.jpg', 'watercolor');
//     console.log('Image URL:', imageResponse.imageUrl);
//     console.log('Description:', imageResponse.description);
//     
//     // Test video generation
//     const videoResponse = await generateVideo('https://example.com/doodle.jpg', 'A flying dragon', 'cartoon');
//     console.log('Video URL:', videoResponse.videoUrl);
//     console.log('Video description:', videoResponse.description);
//   } catch (error) {
//     console.error('Test failed:', error);
//   }
// }
// 
// testLambdaFunction();

// To use in a React component:
/*
import React, { useState } from 'react';

function DoodleProcessor() {
  const [doodleImage, setDoodleImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoodleImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const processImage = async () => {
    if (!doodleImage) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateImage(doodleImage, 'cartoon');
      setResultImage(result.imageUrl);
    } catch (err) {
      setError(err.message || 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {doodleImage && <img src={doodleImage} alt="Doodle" width="200" />}
      <button onClick={processImage} disabled={!doodleImage || loading}>
        {loading ? 'Processing...' : 'Enhance Doodle'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {resultImage && <img src={resultImage} alt="Enhanced" width="400" />}
    </div>
  );
}

export default DoodleProcessor;
*/ 