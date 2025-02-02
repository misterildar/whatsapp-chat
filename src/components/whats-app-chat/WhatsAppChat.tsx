'use client';
import axios from 'axios';
import React, { useState, useEffect } from 'react';

import { Login } from '../login/Login';
import { ArrayMessage } from '../types';
import { API_URL, SECONDS } from '../constants';
import { Messages } from '../message/Messages';
import { ChatFooter } from '../chat-footer/ChatFooter';

export const WhatsAppChat = () => {
  const [message, setMessage] = useState('');
  const [idInstance, setIdInstance] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messages, setMessages] = useState<ArrayMessage[]>([]);
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastReceiptId, setLastReceiptId] = useState<number | null>(null);

  // Функция для отправки сообщения
  const sendMessage = async (phoneNumber: string, message: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`,
        {
          chatId: `${phoneNumber}@c.us`,
          message,
        }
      );
      // Добавляем отправленное сообщение в состояние
      setMessages((prevMessages) => [
        ...prevMessages,
        { body: message, sender: 'отправленное' },
      ]);
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
        `${API_URL}/waInstance${idInstance}/receiveNotification/${apiTokenInstance}`,
        {
          params: {
            receiveTimeout: SECONDS,
          },
        }
      );
      if (response.status !== 200) {
        console.error('Ошибка при получении сообщений:', response.data);
        return;
      }
      if (response.data?.body.typeWebhook === 'outgoingAPIMessageReceived') {
        deleteNotification(response.data.receiptId);
        return;
      }
      if (response.data && response.data.body) {
        const receiptId = response.data.receiptId;
        const messageData = response.data.body.messageData;
        // Проверяем, был ли этот receiptId уже обработан
        if (receiptId === lastReceiptId) {
          return;
        }
        if (messageData) {
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
            // Обновляем состояние, добавляя новое сообщение в массив
            setMessages((prevMessages) => [
              ...prevMessages,
              { body: newMessage, sender: 'получатель' },
            ]);
            // Обновляем последний обработанный receiptId
            setLastReceiptId(receiptId);
            await deleteNotification(receiptId);
          }
        } else {
          if (receiptId) {
            await deleteNotification(receiptId);
          }
        }
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

  const deleteNotification = async (receiptId: number) => {
    try {
      await axios.delete(
        `${API_URL}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`
      );
    } catch (error) {
      console.error('Ошибка при удалении уведомления:', error);
    }
  };

  // Обработка отправки сообщения
  const handleSendMessage = () => {
    if (phoneNumber && message) {
      sendMessage(phoneNumber, message);
      setMessage('');
    }
  };

  // Обработка нажатия клавиши
  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' || event.code === 'NumpadEnter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  // Вызов fetchMessages с интервалом
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <div className='flex  flex-col items-center h-screen bg-[#EDEDED]'>
      {!isAuthenticated ? (
        <Login
          idInstance={idInstance}
          setIdInstance={setIdInstance}
          fetchMessages={fetchMessages}
          apiTokenInstance={apiTokenInstance}
          setIsAuthenticated={setIsAuthenticated}
          setApiTokenInstance={setApiTokenInstance}
        />
      ) : (
        <div className='flex flex-col h-[90%] w-[40%] m-auto'>
          <div className='bg-green-600 text-white p-4 rounded-t-lg'>
            <h2 className='text-2xl font-bold'>Чат WhatsApp</h2>
          </div>
          <Messages messages={messages} />
          <ChatFooter
            message={message}
            setMessage={setMessage}
            phoneNumber={phoneNumber}
            handleKeyPress={handleKeyPress}
            setPhoneNumber={setPhoneNumber}
            handleSendMessage={handleSendMessage}
          />
        </div>
      )}
    </div>
  );
};
