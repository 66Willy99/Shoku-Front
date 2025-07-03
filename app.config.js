import 'dotenv/config';

export default {
  expo: {
    name: 'ShokuApp',
    slug: 'shoku-app',
    version: '1.0.0',
    platforms: ['ios', 'android', 'web'],
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/images/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      permissions: [
        'CAMERA',
        'RECORD_AUDIO',
        'RECEIVE_BOOT_COMPLETED',
        'VIBRATE',
        'com.android.vending.BILLING',
        'NOTIFICATIONS',
        'RECEIVE_BOOT_COMPLETED',
        'WAKE_LOCK'
      ]
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png'
    },
    plugins: [
      'expo-router',
      [
        'expo-notifications',
        {
          icon: './assets/images/icon.png',
          color: '#ffffff',
          sounds: ['./assets/notification-sound.wav'],
          mode: 'production'
        }
      ]
    ],
    notification: {
      icon: './assets/images/icon.png',
      color: '#ffffff',
      androidMode: 'default',
      androidCollapsedTitle: 'Shoku - Notificaciones',
      iosDisplayInForeground: true,
      vapidPublicKey: process.env.EXPO_VAPID_PUBLIC_KEY || 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEgJMrze31pMBcupHtkgcoqknvgMFbG4_DIZrRpkUqOaih8RyPHyL_gPbxKFABj-KZdh4xblZr4MIWt_eCckN4hg'
    },
    experiments: {
      typedRoutes: true
    },
    extra: {
      API_URL: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: process.env.EXPO_PROJECT_ID || 'your-project-id-here' // Reemplaza con tu project ID real
      }
    },
  },
};
