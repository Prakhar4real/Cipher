import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./SubjectChats.css";

const API_URL = "http://localhost:5000/api";

function SubjectChats() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [subject, setSubject] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [creatingChat, setCreatingChat] = useState(false);
  const [createChatError, setCreateChatError] = useState("");

  const [activeChatMenu, setActiveChatMenu] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");

  const [showUploadModal, setShowUploadModal] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSubjectChats = async () => {
      setLoading(true);
      setError("");

      try {
        const [subjectResponse, chatsResponse] = await Promise.all([
          fetch(`${API_URL}/subjects/${subjectId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_URL}/chats/subject/${subjectId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const subjectData = await subjectResponse.json();
        const chatsData = await chatsResponse.json();

        if (!subjectResponse.ok) {
          throw new Error(subjectData.message || "Failed to load subject.");
        }

        if (!chatsResponse.ok) {
          throw new Error(chatsData.message || "Failed to load chats.");
        }

        setSubject(subjectData.subject);
        setChats(chatsData);
      } catch (error) {
        console.error("Fetch subject chats error:", error);
        setError(error.message || "Unable to load subject chats.");
      } finally {
        setLoading(false);
      }
    };

    if (token && subjectId) {
      fetchSubjectChats();
    }
  }, [subjectId, token]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subjectId", subjectId);

    try {
      const response = await fetch(`${API_URL}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload PDF.");
      }

      setDocuments((prev) => [
        data.document,
        ...prev.filter((doc) => doc._id !== data.document._id),
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Something went wrong during upload.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      setDocumentsLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/documents/subject/${subjectId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load resources.");
        }

        setDocuments(data.documents || []);
      } catch (error) {
        console.error("Fetch documents error:", error);
      } finally {
        setDocumentsLoading(false);
      }
    };

    if (token && subjectId) {
      fetchDocuments();
    }
  }, [subjectId, token]);

  const handleCreateChat = async () => {
    if (creatingChat) return;

    setCreatingChat(true);
    setCreateChatError("");

    try {
      const response = await fetch(`${API_URL}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectId,
          title: "New Chat",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create chat.");
      }

      navigate(`/subjects/${subjectId}/chats/${data._id}`);
    } catch (error) {
      console.error("Create chat error:", error);
      setCreateChatError(error.message || "Unable to create chat.");
    } finally {
      setCreatingChat(false);
    }
  };

  const handleRenameChat = async (chatId) => {
    const trimmedTitle = renameTitle.trim();

    if (!trimmedTitle) {
      alert("Chat title cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/chats/${chatId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: trimmedTitle }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to rename chat.");
      }

      setChats((prevChats) =>
        prevChats.map((chat) => (chat._id === chatId ? data.chat : chat)),
      );

      setRenamingChatId(null);
      setRenameTitle("");
      setActiveChatMenu(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteChat = async (chatId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this chat? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/chats/${chatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete chat.");
      }

      setChats((prevChats) => prevChats.filter((chat) => chat._id !== chatId));

      setActiveChatMenu(null);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="subject-chats-page">
      {/* Top Navigation */}
      <header className="subject-chats-topbar">
        <div className="cipher-brand">
          <span className="brand-icon">C</span>
        </div>

        <div className="topbar-subject">{subject?.name || "Subject"}</div>
      </header>

      {/* Main Workspace */}
      <div className="subject-chats-workspace">
        {/* Left Chat Sidebar */}
        <aside className="chats-sidebar">
          {/* Shared Subject Resources */}
          <div className="resources-section">
            <div className="sidebar-section-header">
              <h2>Resources</h2>
            </div>

            <button
              className="add-resources-button"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <span>+</span>
              Add Resources
            </button>

            {uploading && (
              <div className="upload-status">
                <span className="upload-spinner"></span>
                <div>
                  <p>Uploading your PDF...</p>
                  <small>
                    Processing document and preparing it for Cipher.
                  </small>
                </div>
              </div>
            )}

            {uploadError && <p className="upload-error">{uploadError}</p>}

            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,application/pdf"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            <div className="resources-list">
              {documentsLoading ? (
                <div className="resources-empty">
                  <p>Loading resources...</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="resources-empty">
                  <span>▤</span>
                  <p>No resources added yet</p>
                  <small>Upload PDFs to use them across all your chats.</small>
                </div>
              ) : (
                documents.map((document) => (
                  <div className="resource-item" key={document._id}>
                    <span className="resource-icon">▤</span>

                    <div className="resource-info">
                      <h3 title={document.name}>{document.name}</h3>
                      <p>
                        {document.status === "ready"
                          ? "Ready"
                          : document.status === "processing"
                            ? "Processing..."
                            : document.status === "failed"
                              ? "Failed"
                              : "Uploaded"}
                      </p>
                    </div>

                    <span
                      className={`resource-status ${document.status}`}
                      title={document.status}
                    >
                      {document.status === "ready" ? "✓" : "•"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sidebar-divider"></div>

          {/* Chat History */}
          <div className="chats-section">
            <div className="sidebar-section-header">
              <h2>Chats</h2>
            </div>

            <button
              className="new-chat-button"
              type="button"
              onClick={handleCreateChat}
              disabled={creatingChat}
            >
              <span>+</span>
              {creatingChat ? "Creating..." : "New Chat"}
            </button>

            <div className="chat-history">
              {loading ? (
                <p>Loading chats...</p>
              ) : error ? (
                <p>{error}</p>
              ) : chats.length === 0 ? (
                <div className="empty-chat-history">
                  <p>No conversations yet</p>
                  <span>Your chats will appear here.</span>
                </div>
              ) : (
                chats.map((chat) => (
                  <div className="chat-history-item" key={chat._id}>
                    {renamingChatId === chat._id ? (
                      <div className="chat-rename-form">
                        <input
                          type="text"
                          value={renameTitle}
                          onChange={(e) => setRenameTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameChat(chat._id);
                            if (e.key === "Escape") {
                              setRenamingChatId(null);
                              setRenameTitle("");
                            }
                          }}
                          autoFocus
                          maxLength={100}
                        />

                        <button
                          type="button"
                          onClick={() => handleRenameChat(chat._id)}
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRenamingChatId(null);
                            setRenameTitle("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          className="chat-history-open"
                          type="button"
                          onClick={() =>
                            navigate(`/subjects/${subjectId}/chats/${chat._id}`)
                          }
                        >
                          <span className="chat-history-icon">▤</span>

                          <div>
                            <h3>{chat.title}</h3>
                            <p>
                              {new Date(chat.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </button>

                        <div className="chat-history-actions">
                          <button
                            className="chat-menu-trigger"
                            type="button"
                            aria-label="Chat options"
                            onClick={() =>
                              setActiveChatMenu((prev) =>
                                prev === chat._id ? null : chat._id,
                              )
                            }
                          >
                            ⋯
                          </button>

                          {activeChatMenu === chat._id && (
                            <div className="chat-options-menu">
                              <button
                                type="button"
                                onClick={() => {
                                  setRenamingChatId(chat._id);
                                  setRenameTitle(chat.title);
                                  setActiveChatMenu(null);
                                }}
                              >
                                Rename
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteChat(chat._id)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main-area">
          <div className="chat-welcome">
            <div className="welcome-icon">✦</div>

            <h1>Welcome to {subject?.name || "your subject"}</h1>

            <p>
              Your personal study space. Start a conversation and explore your
              uploaded study materials.
            </p>

            <button
              className="welcome-new-chat-button"
              type="button"
              onClick={handleCreateChat}
              disabled={creatingChat}
            >
              {creatingChat ? "Creating..." : "+ Start a new chat"}
            </button>

            {createChatError && (
              <p className="create-chat-error">{createChatError}</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default SubjectChats;
