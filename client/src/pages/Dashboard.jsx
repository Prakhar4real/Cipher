
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState("Home");
  const [search, setSearch] = useState("");

  const firstName = user?.name?.split(" ")[0] || "Student";

  // Temporary until subjects and chats are connected to the backend.
  const subjects = [];
  const recentChats = [];

  return (
    <div className="dashboard">
      {/* Background video will be added here later */}
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
              <button type="button">View all →</button>
            </div>

            {subjects.length === 0 ? (
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
                  disabled
                  title="Subject creation will be connected next"
                >
                  <span>+</span>
                  Create your first subject
                </button>

                <span className="empty-state-hint">
                  Your subjects and recent chats will appear here.
                </span>
              </div>
            ) : (
              <div className="subject-grid">
                {/* Subject cards will be rendered here */}
              </div>
            )}
          </section>

          {/* Recent Chats */}
          {recentChats.length > 0 && (
            <section className="dashboard-section recent-section">
              <div className="section-heading">
                <h2>Recent Chats</h2>
                <button type="button">View all →</button>
              </div>

              <div className="recent-chat-list">
                {/* Recent chat items will be rendered here */}
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
