import axios from 'axios';

const API_BASE_URL = 'https://localhost:7258/api/User';
const API_BASE_URL_AUTH = 'https://localhost:7258/api/Auth';

export interface UserPreferences {
  itemsPerPage: number;
  defaultCurrency: string;
  notificationEnabled: boolean;
}

export const updateMonthlySalary = async (newSalary: number): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }
    
    await axios.put(`${API_BASE_URL_AUTH}/update-salary`, { newSalary }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('Maaş güncellenirken hata:', error);
    throw error.response?.data?.message || 'Maaş güncellenirken bir hata oluştu.';
  }
};

export const updateProfile = async (
  profilePicture: string | null,
  language: string,
  theme: string
): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }
    
    await axios.put(`${API_BASE_URL_AUTH}/update-profile`, {
      profilePicture,
      language,
      theme
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('Profil güncellenirken hata:', error);
    throw error.response?.data?.message || 'Profil güncellenirken bir hata oluştu.';
  }
};

export const updatePreferences = async (
  itemsPerPage: number,
  defaultCurrency: string,
  notificationEnabled: boolean
): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }
    
    await axios.put(`${API_BASE_URL_AUTH}/update-preferences`, {
      itemsPerPage,
      defaultCurrency,
      notificationEnabled
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('Tercihler güncellenirken hata:', error);
    throw error.response?.data?.message || 'Tercihler güncellenirken bir hata oluştu.';
  }
};

// Kullanıcı tercihlerini getirme
export const getUserPreferences = async (): Promise<UserPreferences> => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }
    
    const response = await axios.get(`${API_BASE_URL_AUTH}/preferences`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Tercihler alınırken hata:', error);
    throw error.response?.data?.message || 'Tercihler alınırken bir hata oluştu.';
  }
}; 