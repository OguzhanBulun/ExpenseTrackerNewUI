import axios from 'axios';

const API_BASE_URL = 'https://localhost:7258/api/auth'; 
const API_USER_URL = 'https://localhost:7258/api/User';

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  message: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  monthlySalary?: number;
  profilePicture?: string | null;
  language?: string;
  theme?: string;
  preferences?: any;
}

export const login = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}/login`, credentials);
    localStorage.setItem('authToken', response.data.token);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Giriş sırasında bir hata oluştu.';
  }
};


export const registerApi = async (userData: {
    username: string;
    email: string;
    password: string;
    monthlySalary: number;
  }): Promise<RegisterResponse> => {
  try {
    const response = await axios.post<RegisterResponse>(`${API_BASE_URL}/register`, userData);
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Kayıt sırasında bir hata oluştu.';
  }
};

// API'den kullanıcı bilgilerini getiren fonksiyon
export const getUserData = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      return null;
    }
    
    const response = await axios.get<User>(`${API_USER_URL}/userdata`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Kullanıcı bilgileri alınırken hata:', error);
    return null;
  }
};

// Token'dan kullanıcı bilgilerini çözümleyen fonksiyon (yedek olarak kalsın)
export const getUserFromToken = (): User | null => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      return null;
    }
    
    // JWT token yapısı: header.payload.signature
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }
    
    // Payload kısmını Base64 decode ediyoruz
    const payload = tokenParts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    // JSON string'i objeye çeviriyoruz
    const parsedPayload = JSON.parse(jsonPayload);
    
    // JWT'de farklı claim isimleri kullanılabiliyor, bunları kontrol ediyoruz
    return {
      id: parsedPayload.nameid || parsedPayload.userId || parsedPayload.sub,
      email: parsedPayload.email || parsedPayload.unique_name,
      username: parsedPayload.unique_name || parsedPayload.name,
      monthlySalary: parsedPayload.monthlySalary
    };
  } catch (error) {
    console.error('Token çözümlenirken hata:', error);
    return null;
  }
};

// Kullanıcının giriş yapmış olup olmadığını kontrol eden fonksiyon
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  return !!token;
};

// Çıkış yapma işlemi
export const logout = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('token');
  window.location.href = '/login';
};
