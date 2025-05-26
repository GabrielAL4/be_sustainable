import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// Função para obter a URL base da API
const getBaseUrl = async () => {
  if (__DEV__) {
    try {
      const netInfo = await NetInfo.fetch();
      
      // Se estiver usando Android
      if (Platform.OS === 'android') {
        // Tentar diferentes IPs em ordem
        return 'http://10.0.2.2:3000'; // Android Emulator
      }
      
      // Se estiver usando iOS
      if (Platform.OS === 'ios') {
        return 'http://localhost:3000';
      }
      
      // Fallback para localhost
      return 'http://localhost:3000';
    } catch (error) {
      console.error('Erro ao obter informações de rede:', error);
      return 'http://localhost:3000';
    }
  } else {
    // Em produção, use a URL do seu servidor de produção
    return 'https://seu-servidor-producao.com';
  }
};

// Exporta uma função que retorna a URL base
export const getApiUrl = async () => {
  const baseUrl = await getBaseUrl();
  return baseUrl;
};

// Exporta uma URL padrão para casos onde não podemos usar async/await
export const API_URL = 'http://10.0.2.2:3000'; // Android Emulator default

// Outras configurações globais podem ser adicionadas aqui 