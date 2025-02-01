export interface ArrayMessage {
  body: string;
  sender: string;
}

export interface MessageProps {
  messages: ArrayMessage[];
}

export interface ChatFooterProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  message: string;
  setMessage: (value: string) => void;
  handleSendMessage: () => void;
}

export interface LoginProps {
  idInstance: string;
  setIdInstance: (value: string) => void;
  apiTokenInstance: string;
  setApiTokenInstance: (value: string) => void;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  handleLogin: () => void;
}
