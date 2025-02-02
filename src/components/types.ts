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
  handleKeyPress: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export interface LoginProps {
  idInstance: string;
  apiTokenInstance: string;
  fetchMessages: () => void;
  setIdInstance: (value: string) => void;
  setIsAuthenticated: (value: boolean) => void;
  setApiTokenInstance: (value: string) => void;
}
