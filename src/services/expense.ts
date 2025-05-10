import axios from 'axios';

const API_BASE_URL = 'https://localhost:7258/api';

export interface Expense {
  id: number;
  name: string;
  amount: number;
  date: string;
  categoryId: number;
  categoryName?: string;
  description: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface ExpenseFormData {
  name: string;
  amount: number;
  date: string;
  categoryId: number;
  description: string;
}

// Harcamaları getiren servis
export const getExpenses = async (): Promise<Expense[]> => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }

    const response = await axios.get(`${API_BASE_URL}/Expense`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Harcamalar alınırken hata:', error);
    throw error.response?.data?.message || 'Harcamalar alınırken bir hata oluştu.';
  }
};

// Harcama ekleyen servis
export const addExpense = async (expenseData: ExpenseFormData): Promise<Expense> => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }
    
    console.log('Sending data:', JSON.stringify(expenseData));
    
    const response = await axios.post(`${API_BASE_URL}/Expense`, expenseData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Harcama eklenirken hata detayı:', error.response?.data || error.message);
    throw error.response?.data?.message || 'Harcama eklenirken bir hata oluştu.';
  }
};

// Harcama silen servis
export const deleteExpense = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }

    await axios.delete(`${API_BASE_URL}/Expense/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Harcama silinirken hata:', error);
    throw error.response?.data?.message || 'Harcama silinirken bir hata oluştu.';
  }
};

// Kategorileri getiren servis
export const getCategories = async (): Promise<Category[]> => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }

    const response = await axios.get(`${API_BASE_URL}/Category`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Kategoriler alınırken hata:', error);
    throw error.response?.data?.message || 'Kategoriler alınırken bir hata oluştu.';
  }
};

// Kategori ekleyen servis
export const addCategory = async (name: string): Promise<Category> => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }

    const response = await axios.post(`${API_BASE_URL}/Category`, { name }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Kategori eklenirken hata:', error);
    throw error.response?.data?.message || 'Kategori eklenirken bir hata oluştu.';
  }
};

// Kategori silen servis
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');

    if (!token) {
      throw new Error('Token bulunamadı. Lütfen giriş yapın.');
    }

    await axios.delete(`${API_BASE_URL}/Category/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error: any) {
    console.error('Kategori silinirken hata:', error);
    throw error.response?.data?.message || 'Kategori silinirken bir hata oluştu.';
  }
}; 