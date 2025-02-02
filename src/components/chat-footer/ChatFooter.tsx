import { ChatFooterProps } from '../types';

export const ChatFooter = ({
  message,
  setMessage,
  phoneNumber,
  setPhoneNumber,
  handleKeyPress,
  handleSendMessage,
}: ChatFooterProps) => {
  return (
    <>
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
        onKeyDown={handleKeyPress}
      />
    </>
  );
};
