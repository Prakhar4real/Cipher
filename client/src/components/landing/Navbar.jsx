import { Link } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-logo">
        {/* Logo will be added here later */}
        <span>C</span>
      </div>

      <nav className="navbar-links">
        <a href="#" className="active">
          Home
        </a>

        <a href="#features">Features</a>

        <a href="#how-it-works">How It Works</a>
      </nav>

      <Link to="/login" className="navbar-signin">
        Sign In
      </Link>
    </header>
  );
}

export default Navbar;
