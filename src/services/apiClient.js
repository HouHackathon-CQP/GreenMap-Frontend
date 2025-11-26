// src/services/apiClient.js

// 1. Lấy URL từ biến môi trường
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiFetch = async (endpoint, options = {}) => {
  // Ghép chuỗi: "http://160...:8001" + "/" + "locations"
  const url = `${BASE_URL}/${endpoint}`;
  
  console.log(`🌐 Calling Direct API: ${url}`); 

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const text = await response.text();
    return text ? JSON.parse(text) : {};
    
  } catch (error) {
    console.error('API Request Failed:', error);
    throw error;
  }
};