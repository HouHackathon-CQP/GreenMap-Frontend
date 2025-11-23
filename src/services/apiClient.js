const BASE_URL = 'http://160.250.5.180:8001/';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Lỗi Auth -> Không logout tự động ở đây nữa để tránh loop, ném lỗi ra ngoài
  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  // Các lỗi Client/Server khác
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}`);
  }

  if (response.status === 204) return null;
  return await response.json();
}
