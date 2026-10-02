import Navbar from "../components/landing/Navbar";
import { Link } from "react-router-dom";

function Landing() {
  return (
    <main className="landing-page">
      <video className="landing-background" autoPlay muted loop playsInline>
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
          type="video/mp4"
        />
      </video>

      <Navbar />

      <section className="hero">
        <div className="hero-content">
          <div className="hero-trust">
            <span className="trust-dot"></span>
            <span>AI-powered study assistant</span>
          </div>

          <h1>
            Study smarter.
            <br />
            With Cipher.
          </h1>

          <p>
            Upload your study material, ask questions, and get answers grounded
            directly in your documents.
          </p>

          <Link to="/login" className="hero-cta">
            Get Started
          </Link>
        </div>
      </section>

      {/* <div className="hero-stats">
        <div className="hero-stat">
          <div className="stat-icon">✦</div>
          <strong>PDF</strong>
          <span>Study Material</span>
        </div>

        <div className="hero-stat">
          <div className="stat-icon">✧</div>
          <strong>AI</strong>
          <span>Context-Aware</span>
        </div>

        <div className="hero-stat">
          <div className="stat-icon">◈</div>
          <strong>100%</strong>
          <span>Source Grounded</span>
        </div>

        <div className="hero-stat">
          <div className="stat-icon">↗</div>
          <strong>RAG</strong>
          <span>Document Based</span>
        </div>
      </div> */}
    </main>
  );
}

export default Landing;
