"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!chatStarted) setChatStarted(true);
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await axios.post("/api/gemini", { message: input });
      const botMessage = { text: res.data.reply, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Error: Unable to fetch response.", sender: "bot" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!hasMounted) {
    return null; // Avoid mismatch by skipping rendering until after mount
  }

  return (
    <div className="flex flex-col w-full max-w-screen mx-auto h-screen bg-stone-950 text-green-400 shadow-2xl overflow-hidden relative">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!chatStarted ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
            <h2 className="text-4xl font-extrabold text-green-500 animate-pulse">
              👾 Welcome to <span className="text-green-400">NetGuard!</span>
            </h2>
            <p className="text-lg text-stone-400 leading-relaxed max-w-2xl">
              You&apos;ve connected to a{" "}
              <span className="font-bold">suspicious network...</span>
              <span className="text-red-400 font-semibold"> Are you being hacked?</span> 🕵️‍♂️
            </p>
            <p className="text-lg text-stone-400 leading-relaxed max-w-2xl">
              Let me help you <span className="font-bold">stay safe</span> 🚨
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 w-full max-w-2xl">
              {[
                "🔒 What are the risks of using public WiFi?",
                "🦹‍♂️ How do hackers create fake WiFi networks?",
                "💡 What's a man-in-the-middle attack and how do I prevent it?",
                "📶 How to safely browse on public WiFi without getting hacked?",
              ].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setInput(suggestion);
                    sendMessage();
                  }}
                  className="p-5 bg-stone-900 text-gray-100 rounded-lg shadow-lg hover:bg-green-600 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex items-start ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "bot" && (
                <div className="w-8 h-8 bg-cyan-900 rounded-full flex items-center justify-center text-white font-bold">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[75%] p-3 rounded-xl break-words ${
                  msg.sender === "user"
                    ? "bg-green-700 text-white self-end rounded-br-none"
                    : "bg-stone-900 text-gray-300 self-start rounded-bl-none shadow-md"
                }`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              {msg.sender === "user" && (
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                  👤
                </div>
              )}
            </div>
          ))
        )}

        {loading && chatStarted && (
          <div className="flex items-center space-x-2 self-start bg-stone-800 text-green-400 px-4 py-2 rounded-lg w-fit animate-pulse shadow-md">
            <span className="text-sm">Typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 shadow-md flex items-center gap-2 bg-black text-green-400">
        <input
          type="text"
          className="flex-1 p-3 border border-green-700 bg-stone-900 text-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="p-3 bg-green-500 hover:bg-green-700 text-white rounded-xl transition-colors duration-200"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
