const axios = require('axios');

require('dotenv').config();

// Gemini API key (same as used for text) and Google Cloud Project ID
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAB57IgJOMDV-qR2yi4W3BAJOrqrca3Tew';
const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'gen-lang-client-0295082848';

// Smart mock image selection based on query context
const getSmartMockImage = (query) => {
  const lowerQuery = query.toLowerCase();
  const mockImages = [
    {
      keywords: ['diagram', 'chart', 'graph', 'flowchart'],
      url: 'https://images.unsplash.com/photo-1611224923851-80b023f1d372?w=400&h=300&fit=crop',
      description: 'Professional flowchart diagram',
    },
    {
      keywords: ['science', 'biology', 'physics', 'chemistry'],
      url: 'https://images.unsplash.com/photo-1635070041078-e181b4400572?w=400&h=300&fit=crop',
      description: 'Educational science illustration',
    },
    {
      keywords: ['math', 'geometry', 'algebra'],
      url: 'https://images.unsplash.com/photo-1509228622682-30c4646b56ad?w=400&h=300&fit=crop',
      description: 'Mathematical diagram',
    },
    {
      keywords: ['history', 'geography', 'map'],
      url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&h=300&fit=crop',
      description: 'Historical map illustration',
    },
    {
      keywords: ['education', 'learning', 'study'],
      url: 'https://images.unsplash.com/photo-1501504901894-7c8f1a1472d7?w=400&h=300&fit=crop',
      description: 'General educational graphic',
    },
  ];

  // Find a matching mock image based on query keywords
  const matchedImage = mockImages.find((image) =>
    image.keywords.some((keyword) => lowerQuery.includes(keyword))
  );

  return matchedImage?.url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'; // Fallback generic educational image
};

// Smart mock video selection based on query context
const getSmartMockVideo = (query) => {
  const lowerQuery = query.toLowerCase();
  const mockVideos = [
    {
      keywords: ['science', 'biology', 'physics', 'chemistry'],
      url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_2mb.mp4',
      description: 'Short science animation-like video',
    },
    {
      keywords: ['math', 'geometry', 'algebra'],
      url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      description: 'Short educational animation',
    },
    {
      keywords: ['history', 'geography', 'map'],
      url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4',
      description: 'Short history-related animation',
    },
    {
      keywords: ['education', 'learning', 'study'],
      url: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_10mb.mp4',
      description: 'General educational video',
    },
  ];

  // Find a matching mock video based on query keywords
  const matchedVideo = mockVideos.find((video) =>
    video.keywords.some((keyword) => lowerQuery.includes(keyword))
  );

  return matchedVideo?.url || 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'; // Fallback generic video
};

module.exports = {
  generateVisual: async (query) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('Gemini API key missing. Using smart mock image.');
      return getSmartMockImage(query); // Smart mock image based on query
    }
    if (!GOOGLE_CLOUD_PROJECT_ID || GOOGLE_CLOUD_PROJECT_ID === 'your_project_id_here') {
      console.warn('Google Cloud Project ID missing. Using smart mock image.');
      return getSmartMockImage(query); // Smart mock image based on query
    }

    try {
      const prompt = `A clear, labeled, educational diagram or illustration for the topic: ${query}. The image should be detailed, suitable for students, with a clean and professional style, including relevant annotations and vibrant colors.`;
      const response = await axios.post(
        `https://us-central1-aiplatform.googleapis.com/v1/projects/${GOOGLE_CLOUD_PROJECT_ID}/locations/us-central1/publishers/google/models/imagegeneration@006:predict`,
        {
          instances: [
            {
              prompt: prompt,
            },
          ],
          parameters: {
            sampleCount: 1,
            sampleImageSize: '512x512',
            aspectRatio: '1:1',
            style: 'photorealistic', // Imagen 3 supports photorealistic, adjust as needed
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${GEMINI_API_KEY}`,
          },
        }
      );

      // Imagen 3 returns base64 image data
      const imageData = response.data.predictions?.[0]?.image?.bytesBase64Encoded;
      const imageUrl = imageData
        ? `data:image/png;base64,${imageData}`
        : getSmartMockImage(query); // Smart mock image for generation failure
      console.log('Image generated successfully:', imageUrl.slice(0, 50) + '...');
      return imageUrl;
    } catch (err) {
      console.error('Gemini Image API error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        stack: err.stack,
      });
      return getSmartMockImage(query); // Smart mock image for API error
    }
  },

  generateVideo: async (query) => {
    console.warn('Gemini API does not support free video generation. Using smart mock video.');
    return getSmartMockVideo(query); // Smart mock video based on query

    // Manual Canva Magic Media fallback:
    // 1. Sign up at https://canva.com (Google login, no credit card).
    // 2. Go to Elements > Magic Media > Text to Video.
    // 3. Enter prompt (e.g., "Animation of an apple falling").
    // 4. Download video, upload to backend (e.g., public/assets/apple_falling.mp4).
    // 5. Return static URL:
    // return 'http://localhost:5000/assets/apple_falling.mp4';
  },
};