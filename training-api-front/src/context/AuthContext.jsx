// importa as dependências necessárias para criar o contexto de autenticação, gerenciar o estado do usuário e do token, e fazer requisições à API
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({}); // Cria um contexto de autenticação para compartilhar o estado de login em toda a aplicação

export const AuthProvider = ({ children }) => { // Componente que fornece o contexto de autenticação para toda a aplicação
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('@IronSoul:token'));

  useEffect(() => { // Adiciona o token ao cabeçalho das requisições
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const login = async (data) => { // Função assíncrona para fazer login, recebe os dados do formulário de login
    try {
      const response = await api.post('/users/login', data);
      const { token: receivedToken } = response.data;
      setToken(receivedToken);
      localStorage.setItem('@IronSoul:token', receivedToken);
      setUser({ email: data.email, name: 'Atleta Elite' });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Credenciais inválidas" };
    }
  };

  const logout = () => { // Limpa o estado e remove o token do localStorage
    setToken(null);
    setUser(null);
    localStorage.removeItem('@IronSoul:token');
    delete api.defaults.headers.common['Authorization'];
  };

  return ( // Fornece o estado do usuário, token, e as funções de login e logout para os componentes filhos que consomem este contexto
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); //exporta o hook para acessar o contexto de autenticação em outros componentes do projeto