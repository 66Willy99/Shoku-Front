
import { Config } from '../constants/config';
import { Platform } from 'react-native';

export interface ImageUploadResponse {
  success: boolean;
  data?: {
    id: string;
    title: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  error?: string;
}

/**
 * Convierte una imagen a Base64 dependiendo de la plataforma
 * @param imageUri - URI local de la imagen
 * @returns Promise con la imagen en Base64
 */
async function convertImageToBase64(imageUri: string): Promise<string> {
  if (Platform.OS === 'web') {
    // Para web, convertir usando fetch y blob
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remover el prefijo "data:image/...;base64,"
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Error convirtiendo imagen a Base64 en web: ${error}`);
    }
  } else {
    // Para móvil, usar expo-file-system
    try {
      const { readAsStringAsync, EncodingType } = await import('expo-file-system');
      return await readAsStringAsync(imageUri, {
        encoding: EncodingType.Base64,
      });
    } catch (error) {
      throw new Error(`Error convirtiendo imagen a Base64 en móvil: ${error}`);
    }
  }
}

/**
 * Sube una imagen a ImgBB usando Base64
 * @param imageUri - URI local de la imagen
 * @param imageName - Nombre opcional para la imagen
 * @returns Promise con la respuesta de la API
 */
export async function uploadImageToImgBB(
  imageUri: string, 
  imageName?: string
): Promise<ImageUploadResponse> {
  try {
    console.log('🖼️ Iniciando subida de imagen a ImgBB...');
    console.log('📁 URI de imagen:', imageUri);
    console.log('📱 Plataforma:', Platform.OS);
    
    // Convertir imagen a Base64
    console.log('🔄 Convirtiendo imagen a Base64...');
    const base64Image = await convertImageToBase64(imageUri);
    console.log('✅ Imagen convertida a Base64, tamaño:', base64Image.length);

    // Crear FormData para la subida
    const formData = new FormData();
    formData.append('key', Config.IMGBB_API_KEY);
    formData.append('image', base64Image);

    // Si se proporciona un nombre, agregarlo
    if (imageName) {
      formData.append('name', imageName);
    }

    console.log('📤 Enviando imagen a ImgBB...');

    const response = await fetch(Config.IMGBB_API_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    
    console.log('📥 Respuesta de ImgBB recibida:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('✅ Imagen subida exitosamente!');
      console.log('🔗 URL de la imagen:', result.data.display_url);
      return {
        success: true,
        data: result.data,
      };
    } else {
      console.error('❌ Error en la respuesta de ImgBB:', result);
      return {
        success: false,
        error: result.error?.message || 'Error desconocido al subir imagen',
      };
    }
  } catch (error) {
    console.error('❌ Error al subir imagen a ImgBB:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de conexión',
    };
  }
}

// Alias para mantener compatibilidad con el código existente
export const uploadImageToImgBBBase64 = uploadImageToImgBB;
