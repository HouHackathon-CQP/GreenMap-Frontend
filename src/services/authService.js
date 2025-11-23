import { apiFetch } from './apiClient';

export const loginUser = async (username, password) => {
  try {
    return await apiFetch('login', { 
        method: 'POST', 
        body: JSON.stringify({ username, password }) 
    });
  } catch (e) {
    console.log("⚠️ Login Error. Using Dev Fallback.");
    // Mock Login cho Admin
    if (username === 'admin' && password === '123456') {
        return { access_token: "fake-admin-token", token_type: "bearer" };
    }
    throw e;
  }
};