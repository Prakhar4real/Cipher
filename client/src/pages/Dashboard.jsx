
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api";

function Dashboard() {
  const { user, token, logout } = useAuth();

  const [activePage, setActivePage] = useState("Home");
  const [search, setSearch] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [creatingSubject, setCreatingSubject] = useState(false);
  const [createError, setCreateError] = useState("");

  const firstName = user?.name?.split(" ")[0] || "Student";

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      setSubjectsError("");

      try {
        const response = await fetch(`${API_URL}/subjects`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load subjects.");
        }

        setSubjects(data.subjects || []);
      } catch (error) {
        console.error("Fetch subjects error:", error);
        setSubjectsError(error.message);
      } finally {
        setLoadingSubjects(false);
      }
    };

    if (token) {
      fetchSubjects();
    } else {
      setLoadingSubjects(false);
      setSubjectsError("Authentication token not found. Please sign in again.");
    }
  }, [token]);

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(search.toLowerCase())
  );

  const openSubjectModal = () => {
    setSubjectName("");
    setCreateError("");
    setShowSubjectModal(true);
  };

  const closeSubjectModal = () => {
    if (creatingSubject) return;

    setShowSubjectModal(false);
    setSubjectName("");
    setCreateError("");
  };

  const handleCreateSubject = async (event) => {
    event.preventDefault();

    const trimmedName = subjectName.trim();

    if (!trimmedName) {
      setCreateError("Please enter a subject name.");
      return;
    }

    setCreatingSubject(true);
    setCreateError("");

    try {
      const response = await fetch(`${API_URL}/subjects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create subject.");
      }

      setSubjects((previous) => [data.subject, ...previous]);
      setSearch("");
      setShowSubjectModal(false);
      setSubjectName("");
    } catch (error) {
      console.error("Create subject error:", error);
      setCreateError(error.message || "Unable to create subject.");
    } finally {
      setCreatingSubject(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-background" />

      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="brand-logo">C</div>
          <span>Cipher</span>
        </div>

        <nav className="sidebar-nav">
          {[
            { name: "Home", icon: "⌂" },
            { name: "Subjects", icon: "▱" },
            { name: "Chat", icon: "▢" },
          ].map((item) => (
            <button
              key={item.name}
              className={`sidebar-link ${
                activePage === item.name ? "active" : ""
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="logout-button" onClick={logout}>
            <span className="sidebar-icon">↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search subjects or chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="topbar-actions">
            <button
              className="notification-button"
              aria-label="Notifications"
            >
              ♧
            </button>

            <button className="profile-avatar" title={user?.name || "Profile"}>
              {firstName.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="welcome-section">
            <h1>Welcome back, {firstName} 👋</h1>
            <p>Continue learning with your subjects and chats.</p>
          </div>

          {/* Subjects */}
          <section className="dashboard-section">
            <div className="section-heading">
              <h2>Your Subjects</h2>

              <button
                type="button"
                className="add-subject-button"
                onClick={openSubjectModal}
              >
                + Add Subject
              </button>
            </div>

            {loadingSubjects ? (
              <div className="empty-state">
                <p>Loading your subjects...</p>
              </div>
            ) : subjectsError ? (
              <div className="empty-state">
                <p>{subjectsError}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
              </div>
            ) : subjects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">✦</div>

                <h2>LET'S DIVE IN!</h2>

                <p>
                  Your learning journey starts here.
                  Create your first subject, upload your study materials,
                  and start exploring your notes with Cipher.
                </p>

                <button
                  className="create-first-subject"
                  type="button"
                  onClick={openSubjectModal}
                >
                  <span>+</span>
                  Create your first subject
                </button>

                <span className="empty-state-hint">
                  Your subjects and recent chats will appear here.
                </span>
              </div>
            ) : filteredSubjects.length === 0 ? (
              <div className="empty-state">
                <p>No subjects match "{search}".</p>
              </div>
            ) : (
              <div className="subject-grid">
                {filteredSubjects.map((subject) => (
                  <div className="subject-card" key={subject._id}>
                    <h3>{subject.name}</h3>
                    <p>
                      Created{" "}
                      {new Date(subject.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </main>

      {/* Create Subject Modal */}
      {showSubjectModal && (
        <div
          className="subject-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSubjectModal();
            }
          }}
        >
          <div
            className="subject-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subject-modal-title"
          >
            <button
              className="subject-modal-close"
              type="button"
              onClick={closeSubjectModal}
              disabled={creatingSubject}
              aria-label="Close modal"
            >
              ×
            </button>

            <div className="subject-modal-icon">✦</div>

            <h2 id="subject-modal-title">Create a Subject</h2>

            <p className="subject-modal-description">
              Give your learning space a name to get started.
            </p>

            <form onSubmit={handleCreateSubject}>
              <label htmlFor="subject-name">Subject Name</label>

              <input
                id="subject-name"
                type="text"
                placeholder="e.g. Data Structures and Algorithms"
                value={subjectName}
                onChange={(event) => {
                  setSubjectName(event.target.value);
                  if (createError) setCreateError("");
                }}
                maxLength={80}
                autoFocus
                disabled={creatingSubject}
              />

              {createError && (
                <p className="subject-modal-error">{createError}</p>
              )}

              <div className="subject-modal-actions">
                <button
                  type="button"
                  className="subject-cancel-button"
                  onClick={closeSubjectModal}
                  disabled={creatingSubject}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="subject-submit-button"
                  disabled={creatingSubject}
                >
                  {creatingSubject ? "Creating..." : "Create Subject"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
