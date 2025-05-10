import axios from 'axios';

const API_BASE_URL = 'https://localhost:7258/api/Report/monthly';

export const getReportData = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }

    const response = await axios.get(`${API_BASE_URL}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    throw error.response?.data?.message || 'Rapor verisi alınırken bir hata oluştu.';
  }
};
