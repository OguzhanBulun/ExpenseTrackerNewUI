import axios from 'axios';

const API_BASE_URL = 'https://localhost:7258/api/auth'; 

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  message: string;
}

export const login = async (credentials: { email: string; password: string }): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_BASE_URL}/login`, credentials);
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
