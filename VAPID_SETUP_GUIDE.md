# 🔑 Guía para Configurar VAPID Keys

## ¿Qué son las VAPID Keys?

Las VAPID (Voluntary Application Server Identification) keys son necesarias para las notificaciones push en la web. Son un par de claves (pública y privada) que identifican tu aplicación de manera única.

## 🛠️ Cómo Generar VAPID Keys

### Método 1: Usando web-push (Recomendado)

```bash
# Instalar web-push globalmente
npm install -g web-push

# Generar par de claves VAPID
web-push generate-vapid-keys
```

### Método 2: Usando Node.js Script

```javascript
// generar-vapid.js
const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);
```

```bash
# Ejecutar el script
node generar-vapid.js
```

### Método 3: Online Generator

Puedes usar generadores online como:
- https://vapidkeys.com/
- https://web-push-codelab.glitch.me/

## 📝 Configuración

### 1. Frontend (Expo)

Actualiza tu `.env`:
```properties
# Clave pública VAPID (puedes compartir esta)
EXPO_VAPID_PUBLIC_KEY=TU_CLAVE_PUBLICA_AQUI
```

### 2. Backend (Python)

Agrega a tu backend las claves VAPID:
```python
# En tu servicio de notificaciones
VAPID_PUBLIC_KEY = "TU_CLAVE_PUBLICA_AQUI"
VAPID_PRIVATE_KEY = "TU_CLAVE_PRIVADA_AQUI"  # ¡NUNCA la compartas!
VAPID_EMAIL = "tu-email@ejemplo.com"
```

### 3. Configuración completa en app.config.js

```javascript
notification: {
  icon: './assets/images/icon.png',
  color: '#ffffff',
  androidMode: 'default',
  androidCollapsedTitle: 'Shoku - Notificaciones',
  iosDisplayInForeground: true,
  vapidPublicKey: process.env.EXPO_VAPID_PUBLIC_KEY
},
```

## 🚀 Clave Temporal para Testing

Para pruebas de desarrollo, puedes usar esta clave pública temporal:
```
BKxreGl1a1aGhq-VWMpvZdMI8gWnLHwKzO4mHgJgI8KKkwXBLZgr9mVmjWyZkLOYpx7pIhPGBdRbHLKKfQmRdRE
```

**⚠️ IMPORTANTE**: Para producción, SIEMPRE genera tus propias claves VAPID.

## 🔐 Seguridad

- ✅ La clave pública puede ser compartida
- ❌ La clave privada NUNCA debe ser compartida
- ✅ Usa variables de entorno para las claves
- ✅ Genera nuevas claves para cada proyecto

## 🧪 Verificar Configuración

Después de configurar las claves:

1. Reinicia el servidor Expo: `npx expo start --clear`
2. Usa el botón "🔍 Diagnosticar" en la app
3. Verifica que no aparezcan errores de VAPID

## 📱 Limitaciones

- **Móvil**: No necesita VAPID keys (usa Expo Push Service)
- **Web**: Requiere VAPID keys obligatoriamente
- **Desarrollo**: Puedes usar claves temporales
- **Producción**: Siempre usa tus propias claves
