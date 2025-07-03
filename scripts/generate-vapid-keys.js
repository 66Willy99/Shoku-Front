#!/usr/bin/env node

/**
 * Script para generar VAPID keys para notificaciones push web
 * Ejecutar: node scripts/generate-vapid-keys.js
 */

const crypto = require('crypto');

// Función para generar claves VAPID
function generateVAPIDKeys() {
  const keyPair = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: {
      type: 'spki',
      format: 'der'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'der'
    }
  });

  const publicKey = Buffer.from(keyPair.publicKey).toString('base64url');
  const privateKey = Buffer.from(keyPair.privateKey).toString('base64url');

  return {
    publicKey,
    privateKey
  };
}

// Generar las claves
console.log('🔑 Generando claves VAPID...\n');

try {
  const keys = generateVAPIDKeys();
  
  console.log('✅ Claves VAPID generadas exitosamente:\n');
  console.log('📂 Agrega estas líneas a tu archivo .env:');
  console.log('═'.repeat(60));
  console.log(`EXPO_VAPID_PUBLIC_KEY=${keys.publicKey}`);
  console.log(`EXPO_VAPID_PRIVATE_KEY=${keys.privateKey}`);
  console.log('═'.repeat(60));
  
  console.log('\n🔐 IMPORTANTE:');
  console.log('• La clave pública puede ser compartida');
  console.log('• La clave privada NUNCA debe ser compartida');
  console.log('• Usa estas claves tanto en frontend como backend');
  console.log('• Para producción, genera claves nuevas para cada proyecto');
  
} catch (error) {
  console.error('❌ Error generando claves VAPID:', error);
  console.log('\n🛠️ Alternativas:');
  console.log('1. Instala web-push: npm install -g web-push');
  console.log('2. Genera claves: web-push generate-vapid-keys');
  console.log('3. O usa un generador online: https://vapidkeys.com/');
}
