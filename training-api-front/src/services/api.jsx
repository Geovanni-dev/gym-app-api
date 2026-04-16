import axios from 'axios'; // importa a biblioteca axios para fazer requisições HTTP

const api = axios.create({ // cria uma instância do axios com uma configuração base
  baseURL: 'http://localhost:3000',
});

api.interceptors.request.use((config) => { // adiciona um interceptor para incluir o token de autenticação em todas as requisições
  const token = localStorage.getItem('@superfrango:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; // exporta a instância do axios para ser usada em outros arquivos do projeto