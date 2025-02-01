'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Message {
  body: string;
  sender: string;
}

export const WhatsAppChat = () => {
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const apiUrl = 'https://1103.api.green-api.com';
  const seconds = 30;

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

  // Функция для отправки сообщения
  const sendMessage = async (phoneNumber: string, message: string) => {
    try {
      const response = await axios.post(
        `${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
        {
          chatId: `${phoneNumber}@c.us`,
          message,
        }
      );
      // Добавляем отправленное сообщение в состояние
      setMessages((prevMessages) => [
        ...prevMessages,
        { body: message, sender: 'ваш номер' }, // Помечаем как отправленное
      ]);

      // Удаляем уведомление (если оно есть)
      if (response.data.receiptId) {
        await deleteNotification(response.data.receiptId);
      }
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
    }
  };

  // Функция для получения сообщений
  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`,
        {
          params: {
            receiveTimeout: seconds,
          },
        }
      );

      if (response.data.body.typeWebhook === 'outgoingAPIMessageReceived') {
        deleteNotification(response.data.receiptId);
        return;
      }

      // Проверяем, есть ли данные в ответе
      if (response.data && response.data.body) {
        const messageData = response.data.body.messageData;

        // Проверяем, есть ли messageData
        if (messageData) {
          // Проверяем, есть ли extendedTextMessageData или textMessageData
          let newMessage = '';
          if (
            messageData.extendedTextMessageData &&
            messageData.extendedTextMessageData.text
          ) {
            newMessage = messageData.extendedTextMessageData.text;
          } else if (
            messageData.textMessageData &&
            messageData.textMessageData.text
          ) {
            newMessage = messageData.textMessageData.text;
          }

          if (newMessage) {
            const receiptId = response.data.receiptId; // Получаем receiptId для удаления уведомления

            // Обновляем состояние, добавляя новое сообщение в массив
            setMessages((prevMessages) => [
              ...prevMessages,
              { body: newMessage, sender: 'получатель' },
            ]);

            // Удаляем уведомление из очереди
            await deleteNotification(receiptId);
          } else {
            console.warn('Нет текста сообщения в ответе API:', response.data);
          }
        } else {
          // Если messageData отсутствует, проверяем receiptId
          const receiptId = response.data.receiptId; // Получаем receiptId для удаления уведомления
          if (receiptId) {
            await deleteNotification(receiptId);
          } else {
            console.warn('Нет данных в ответе API и receiptId:', response.data);
          }
        }
      } else {
        console.warn('Нет данных в ответе API:', response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Ошибка при получении сообщений:', error.message);
        console.error('Детали ошибки:', error.response?.data);
      } else {
        console.error('Неизвестная ошибка:', error);
      }
    }
  };

  // Функция для удаления уведомления
  const deleteNotification = async (receiptId: number) => {
    try {
      await axios.delete(
        `${apiUrl}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`
      );
      console.log(`Уведомление с ID ${receiptId} успешно удалено.`);
    } catch (error) {
      console.error('Ошибка при удалении уведомления:', error);
    }
  };

  // Обработка авторизации
  const handleLogin = () => {
    if (idInstance && apiTokenInstance) {
      setIsAuthenticated(true);
      if (rememberMe) {
        localStorage.setItem('idInstance', idInstance);
        localStorage.setItem('apiTokenInstance', apiTokenInstance);
      }
      fetchMessages(); // Получаем сообщения сразу после авторизации
    }
  };

  // Обработка отправки сообщения
  const handleSendMessage = () => {
    if (phoneNumber && message) {
      sendMessage(phoneNumber, message);
      setMessage(''); // Очищаем поле ввода сообщения
    }
  };

  // Пример вызова fetchMessages с интервалом
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchMessages, 5000); // Получаем новые сообщения каждые 5 секунд
      return () => clearInterval(interval); // Очистка интервала при размонтировании компонента
    }
  }, [isAuthenticated]);

  return (
    <div className='flex  flex-col items-center h-screen  bg-[#EDEDED]'>
      {!isAuthenticated ? (
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
      ) : (
        <div className='flex flex-col h-full w-[40%]'>
          <div className='bg-green-600 text-white p-4 rounded-t-lg'>
            <h2 className='text-2xl font-bold'>Чат WhatsApp</h2>
          </div>
          <div className='flex flex-col flex-grow overflow-auto bg-white rounded-b-lg shadow-lg p-4'>
            <ul className='flex flex-col'>
              {messages?.map((msg, index) => (
                <li
                  key={index}
                  className={`my-2 p-2 rounded-lg ${
                    msg.sender === 'ваш номер'
                      ? 'bg-green-500 text-white self-end rounded-br-none'
                      : 'bg-gray-300 self-start rounded-bl-none'
                  }`}
                >
                  {msg.body}
                </li>
              ))}
            </ul>
          </div>
          <div className='flex p-4 bg-white border-t border-gray-300'>
            <input
              className='border border-gray-300 rounded-lg p-2  w-full'
              type='text'
              placeholder='Введите номер телефона'
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <button
              className='bg-green-500 text-white rounded-lg p-2 ml-2'
              onClick={handleSendMessage}
            >
              Отправить
            </button>
          </div>
          <textarea
            className='border border-gray-300 rounded-lg p-2 mb-2 w-full h-[20%]'
            placeholder='Сообщение'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
