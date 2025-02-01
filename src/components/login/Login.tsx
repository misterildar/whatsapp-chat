import { LoginProps } from "../types";

export const Login = ({
  rememberMe,
  idInstance,
  handleLogin,
  setRememberMe,
  setIdInstance,
  apiTokenInstance,
  setApiTokenInstance,
}: LoginProps) => {
  return (
    <div className="flex flex-col items-center justify-center w-[35%] h-full">
      <h2 className="text-2xl font-bold mb-4">Введите данные для входа</h2>
      <input
        className="border border-gray-300 rounded-lg p-2 mb-2 w-full"
        type="text"
        placeholder="ID Instance"
        value={idInstance}
        onChange={(e) => setIdInstance(e.target.value)}
      />
      <input
        className="border border-gray-300 rounded-lg p-2 mb-2 w-full"
        type="text"
        placeholder="API Token"
        value={apiTokenInstance}
        onChange={(e) => setApiTokenInstance(e.target.value)}
      />
      <label className="flex items-center mb-4">
        <input
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="mr-2"
        />
        Запомнить меня
      </label>
      <button
        className="bg-green-500 text-white rounded-lg p-2 w-[40%] hover:bg-green-600"
        onClick={handleLogin}
      >
        Войти
      </button>
    </div>
  );
};
