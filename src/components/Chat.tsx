// src/components/Chat.tsx

import { useState } from 'react';

type Message = {
  sender: "ルミエルbot" | "ユーザー";  // 修正: senderの型をリテラル型に
  name: string;
  text: string;
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);  // setMessagesを定義
  const [userName] = useState(localStorage.getItem("userName") || "あなた");
  const [partnerName] = useState(localStorage.getItem("partnerName") || "お相手");
  const [userMessage, setUserMessage] = useState<string>("");  // userMessageを定義

  const handleUserMessage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && userMessage.trim()) {
      const newMessages: Message[] = [
        ...messages,
        { sender: "ユーザー", name: userName, text: userMessage },
      ];
      setMessages(newMessages);
      setUserMessage("");  // ユーザーメッセージをクリア

      const botReply: Message = {
        sender: "ルミエルbot",
        name: "ルミエル",
        text: "こんにちは",
      };
      setMessages((prevMessages) => [...prevMessages, botReply]);
    }
  };

  return (
    <div>
      <h1>Chat with {partnerName}</h1>  // partnerNameを表示
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender === "ユーザー" ? msg.name : msg.sender}: </strong>
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={userMessage}
        onChange={(e) => setUserMessage(e.target.value)}
        onKeyPress={handleUserMessage}
        placeholder="メッセージを入力"
      />
    </div>
  );
};

export default Chat;
