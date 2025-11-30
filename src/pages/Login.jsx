// GreenMap-Frontend/src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services';
import { Loader2, Lock, User } from 'lucide-react';

import logoImg from '../assets/logo.png'; 

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await loginUser(username, password);
      
      if (data && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        navigate('/dashboard', { replace: true });
      } else {
        setError('Đăng nhập thất bại.');
      }
    } catch {
      setError('Đăng nhập thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white-500/10 mb-4 p-4 border border-green-500/30">
            <img src={logoImg} alt="GreenMap Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">GreenMap Portal</h1>
          <p className="text-gray-400 text-sm mt-2">Đăng nhập dành cho Quản trị viên</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-6 text-center text-sm">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500" size={18} />
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-green-500 outline-none transition-colors focus:border-green-500" placeholder="Username" required />
            </div>
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={18} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-green-500 outline-none transition-colors focus:border-green-500" placeholder="Password" required />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : 'Đăng Nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}