"use client";
import axios from "axios";
import React, { useState, useEffect } from "react";

import { Login } from "../login/Login";
import { ArrayMessage } from "../types";
import { apiUrl, seconds } from "../constants";
import { Messages } from "../message/Messages";
import { ChatFooter } from "../chat-footer/ChatFooter";

export const WhatsAppChat = () => {
  const [message, setMessage] = useState("");
  const [idInstance, setIdInstance] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [messages, setMessages] = useState<ArrayMessage[]>([]);
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Эффект для загрузки сохраненных данных из localStorage
  useEffect(() => {
    const savedIdInstance = localStorage.getItem("idInstance");
    const savedApiTokenInstance = localStorage.getItem("apiTokenInstance");
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
        { body: message, sender: "ваш номер" }, // Помечаем как отправленное
      ]);
      // Удаляем уведомление (если оно есть)
      if (response.data.receiptId) {
        await deleteNotification(response.data.receiptId);
      }
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
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
      // Проверяем, есть ли данные в ответе
      if (response.data && response.data.body) {
        const messageData = response.data.body.messageData;
        if (response.data.body.typeWebhook === "outgoingAPIMessageReceived") {
          deleteNotification(response.data.receiptId);
          return;
        }
        if (messageData) {
          let newMessage = "";
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
            const receiptId = response.data.receiptId;
            setMessages((prevMessages) => [
              ...prevMessages,
              { body: newMessage, sender: "получатель" },
            ]);
            await deleteNotification(receiptId);
          }
        } else {
          const receiptId = response.data.receiptId;
          if (receiptId) {
            await deleteNotification(receiptId);
          } else {
            console.warn("Нет данных в ответе API и receiptId:", response.data);
          }
        }
      } else {
        console.warn("Нет данных в ответе API:", response.data);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Ошибка при получении сообщений:", error.message);
        console.error("Детали ошибки:", error.response?.data);
      } else {
        console.error("Неизвестная ошибка:", error);
      }
    }
  };

  const deleteNotification = async (receiptId: number) => {
    try {
      await axios.delete(
        `${apiUrl}/waInstance${idInstance}/deleteNotification/${apiTokenInstance}/${receiptId}`
      );
      console.log(`Уведомление с ID ${receiptId} успешно удалено.`);
    } catch (error) {
      console.error("Ошибка при удалении уведомления:", error);
    }
  };

  // Обработка авторизации
  const handleLogin = () => {
    if (idInstance && apiTokenInstance) {
      setIsAuthenticated(true);
      if (rememberMe) {
        localStorage.setItem("idInstance", idInstance);
        localStorage.setItem("apiTokenInstance", apiTokenInstance);
      }
      fetchMessages(); // Получаем сообщения сразу после авторизации
    }
  };

  // Обработка отправки сообщения
  const handleSendMessage = () => {
    if (phoneNumber && message) {
      sendMessage(phoneNumber, message);
      setMessage("");
    }
  };

  // Пример вызова fetchMessages с интервалом
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <div className="flex  flex-col items-center h-screen  bg-[#EDEDED]">
      {!isAuthenticated ? (
        <Login
          rememberMe={rememberMe}
          idInstance={idInstance}
          handleLogin={handleLogin}
          setIdInstance={setIdInstance}
          setRememberMe={setRememberMe}
          apiTokenInstance={apiTokenInstance}
          setApiTokenInstance={setApiTokenInstance}
        />
      ) : (
        <div className="flex flex-col h-full w-[40%]">
          <div className="bg-green-600 text-white p-4 rounded-t-lg">
            <h2 className="text-2xl font-bold">Чат WhatsApp</h2>
          </div>
          <Messages messages={messages} />
          <ChatFooter
            message={message}
            setMessage={setMessage}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            handleSendMessage={handleSendMessage}
          />
        </div>
      )}
    </div>
  );
};
