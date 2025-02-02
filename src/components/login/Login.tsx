'use client';
import { useEffect, useState } from 'react';
import { LoginProps } from '../types';

export const Login = ({
  idInstance,
  setIdInstance,
  fetchMessages,
  apiTokenInstance,
  setIsAuthenticated,
  setApiTokenInstance,
}: LoginProps) => {
  const [rememberMe, setRememberMe] = useState(false);

  // Эффект для загрузки сохраненных данных из localStorage
  useEffect(() => {
    const savedIdInstance = localStorage.getItem('idInstance');
    const savedApiTokenInstance = localStorage.getItem('apiTokenInstance');
    if (savedIdInstance && savedApiTokenInstance) {
      setIdInstance(savedIdInstance);
      setApiTokenInstance(savedApiTokenInstance);
      setRememberMe(true);
    }
  }, []);

  // Обработка авторизации
  const handleLogin = () => {
    if (idInstance && apiTokenInstance) {
      setIsAuthenticated(true);
      if (rememberMe) {
        localStorage.setItem('idInstance', idInstance);
        localStorage.setItem('apiTokenInstance', apiTokenInstance);
      }
      fetchMessages();
    }
  };

  return (
    <div className='flex flex-col items-center justify-center w-[35%] h-full'>
      <h2 className='text-2xl font-bold mb-4'>Введите данные для входа</h2>
      <input
        className='border border-gray-300 rounded-lg p-2 mb-2 w-full'
        type='text'
        placeholder='ID Instance'
        value={idInstance}
        onChange={(e) => setIdInstance(e.target.value)}
      />
      <input
        className='border border-gray-300 rounded-lg p-2 mb-2 w-full'
        type='text'
        placeholder='API Token'
        value={apiTokenInstance}
        onChange={(e) => setApiTokenInstance(e.target.value)}
      />
      <label className='flex items-center mb-4'>
        <input
          type='checkbox'
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className='mr-2'
        />
        Запомнить меня
      </label>
      <button
        className='bg-green-500 text-white rounded-lg p-2 w-[40%] hover:bg-green-600'
        onClick={handleLogin}
      >
        Войти
      </button>
    </div>
  );
};
