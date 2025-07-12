// src/store/modules/encryptor.ts
import { encryptTransform } from 'redux-persist-transform-encrypt';

// 1. Vite expõe variáveis de ambiente através de `import.meta.env`
//    Não é necessário usar 'dotenv' nem 'process.env'
const secretKey = import.meta.env.VITE_REDUX_SECRET_KEY;

// Verifica se a chave secreta foi definida
if (!secretKey) {
  throw new Error("A chave secreta para o Redux (VITE_REDUX_SECRET_KEY) não foi definida no seu arquivo .env");
}

// Cria o transformador de criptografia
export const encryptor = encryptTransform({
  secretKey: secretKey,
  onError: function (error) {
    // Opcional: lida com erros, por exemplo, em caso de falha na descriptografia
    console.error('Falha na transformação do redux-persist:', error);
  },
});