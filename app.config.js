import 'dotenv/config';

export default {
  expo: {
    name: 'ShokuApp',
    slug: 'shoku-app',
    version: '1.0.0',
    extra: {
      API_URL: process.env.EXPO_PUBLIC_API_URL,
      },
  },
};