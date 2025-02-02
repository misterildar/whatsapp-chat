import { MessageProps } from '../types';

export const Messages = ({ messages }: MessageProps) => {
  return (
    <div className='flex flex-col-reverse flex-grow overflow-auto bg-white rounded-b-lg shadow-lg p-4'>
      <ul className='flex flex-col'>
        {messages?.map((message, index) => (
          <li
            key={index}
            className={`my-2 p-2 max-w-[70%] rounded-lg ${
              message.sender === 'отправленное'
                ? 'bg-green-500 text-white self-end rounded-br-none'
                : 'bg-gray-300 self-start rounded-bl-none'
            }`}
          >
            {message.body}
          </li>
        ))}
      </ul>
    </div>
  );
};
