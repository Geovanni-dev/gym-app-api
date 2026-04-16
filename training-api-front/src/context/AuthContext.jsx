import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('@superfrango:token'));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      //Tenta carregar o usuário salvo no localStorage
      const savedUser = localStorage.getItem('@superfrango:user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
  }, [token]);

  const login = async (data) => {
    try {
      const response = await api.post('/users/login', data);
      const { token: receivedToken, user: userData } = response.data;

      setToken(receivedToken);
      setUser(userData);

      localStorage.setItem('@superfrango:token', receivedToken);
      localStorage.setItem('@superfrango:user', JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      // CAPTURA A FLAG NOTVERIFIED DO BACKEND
      const isNotVerified = error.response?.status === 403 && error.response?.data?.notVerified;

      return {
        success: false,
        message: error.response?.data?.message || 'Email ou senha incorretos',
        notVerified: isNotVerified // Manda a flag para o App.jsx
      };
    }
  };
  // FUNÇÃO NOVA: Para o ProfileSideMenu atualizar a foto sem dar refresh na página
  const updateUserData = (newData) => {
    setUser(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('@superfrango:user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('@superfrango:token');
    localStorage.removeItem('@superfrango:user');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      updateUserData, // Exportando a nova função
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);