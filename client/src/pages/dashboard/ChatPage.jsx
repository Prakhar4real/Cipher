import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ChatPage.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL = "http://localhost:5000/api";

function ChatPage() {
  const { subjectId, chatId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    const maxHeight = 160;

    textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;

    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [input]);

  useEffect(() => {
    const fetchChat = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_URL}/chats/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load chat.");
        }

        setChat(data.chat);
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Fetch chat error:", error);
        setError(error.message || "Unable to load chat.");
      } finally {
        setLoading(false);
      }
    };

    if (token && chatId) {
      fetchChat();
    }
  }, [chatId, token]);

  const handleSendMessage = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || sending) return;

    setInput("");
    setSending(true);
    setSendError("");

    // Show the user's message immediately
    const temporaryMessage = {
      _id: `temp-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
    };

    setMessages((prev) => [...prev, temporaryMessage]);

    try {
      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: trimmedMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message.");
      }

      setMessages((prev) => [
        ...prev.filter((message) => message._id !== temporaryMessage._id),
        data.userMessage,
        data.assistantMessage,
      ]);
    } catch (error) {
      console.error("Send message error:", error);

      // Keep the user's message visible, but show the error
      setSendError(
        error.message || "Unable to send message. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="chat-page">
      {/* Top Navigation */}
      <header className="chat-page-topbar">
        <div className="chat-page-brand">
          <span className="chat-brand-icon">C</span>
        </div>

        <div className="chat-page-breadcrumb">
          <button onClick={() => navigate("/dashboard")} type="button">
            Dashboard
          </button>

          <span>/</span>

          <button
            onClick={() => navigate(`/subjects/${subjectId}/chats`)}
            type="button"
          >
            Subject Chats
          </button>

          <span>/</span>

          <strong>{chat?.title || "New Chat"}</strong>
        </div>
      </header>

      {/* Chat Workspace */}
      <main className="chat-page-main">
        {loading ? (
          <p className="chat-loading">Loading conversation...</p>
        ) : error ? (
          <p className="chat-error">{error}</p>
        ) : (
          <>
            {/* Messages */}
            <section className="chat-messages-area">
              {messages.length === 0 ? (
                <div className="chat-empty-state">
                  <div className="chat-empty-icon">✦</div>

                  <h1>What would you like to learn?</h1>

                  <p>
                    Ask anything about your study materials. Cipher will help
                    you understand the concepts.
                  </p>
                </div>
              ) : (
                <div className="chat-messages-list">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`chat-message ${message.role}`}
                    >
                      <div className="message-role">
                        {message.role === "user" ? "You" : "Cipher"}
                      </div>

                      <div className="message-content">
                        {message.role === "assistant" ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          message.content
                        )}
                      </div>

                      {message.role === "assistant" &&
                        message.sources?.length > 0 && (
                          <details className="message-sources">
                            <summary>
                              Sources ({message.sources.length} references)
                            </summary>

                            <ul>
                              {[
                                ...message.sources.reduce((groups, source) => {
                                  const key = source.documentName;

                                  if (!groups.has(key)) {
                                    groups.set(key, new Set());
                                  }

                                  groups.get(key).add(source.pageNumber);

                                  return groups;
                                }, new Map()),
                              ].map(([documentName, pages]) => (
                                <li key={documentName}>
                                  <strong>{documentName}</strong>
                                  <span>
                                    Pages{" "}
                                    {[...pages]
                                      .sort((a, b) => a - b)
                                      .join(", ")}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </details>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Message Input */}
            <div className="chat-input-wrapper">
              <div className="chat-input-box">
                <textarea
                  ref={textareaRef}
                  placeholder="Ask Cipher anything about your resources..."
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={sending}
                />

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || sending}
                >
                  {sending ? "..." : "↑"}
                </button>

                {sendError && <p className="chat-error">{sendError}</p>}

                {sending && (
                  <p className="chat-loading">Cipher is thinking...</p>
                )}
              </div>

              <p className="chat-input-disclaimer">
                Cipher answers using your uploaded study materials.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default ChatPage;
