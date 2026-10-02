import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = event => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    const users = JSON.parse(
      localStorage.getItem("cybershield_users") || "[]"
    );

    const user = users.find(
      item =>
        item.email?.toLowerCase() ===
          email.trim().toLowerCase() &&
        item.password === password
    );

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    localStorage.setItem(
      "cybershield_user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email
      })
    );

    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-bg-glow login-bg-one"></div>
      <div className="login-bg-glow login-bg-two"></div>

      <div className="login-shell">

        <div className="login-visual">

          <div className="visual-grid"></div>

          <div className="visual-content">

            <div className="visual-brand">
              <div className="visual-logo">
                ⬡
              </div>

              <div>
                <strong>CyberShield</strong>
                <span>AI SECURITY PLATFORM</span>
              </div>
            </div>

            <div className="visual-main">

              <div className="visual-eyebrow">
                <span></span>
                INTELLIGENT SECURITY
              </div>

              <h1>
                Protect your
                <br />
                <span>digital world.</span>
              </h1>

              <p>
                Detect threats, analyze suspicious
                activity and keep your digital
                environment protected with
                CyberShield AI.
              </p>

              <div className="security-points">

                <div className="security-point">
                  <div className="point-icon">✓</div>

                  <div>
                    <strong>
                      AI Threat Detection
                    </strong>

                    <span>
                      Intelligent security analysis
                    </span>
                  </div>
                </div>

                <div className="security-point">
                  <div className="point-icon">✓</div>

                  <div>
                    <strong>
                      Real-time Protection
                    </strong>

                    <span>
                      Monitor suspicious activity
                    </span>
                  </div>
                </div>

                <div className="security-point">
                  <div className="point-icon">✓</div>

                  <div>
                    <strong>
                      Secure Media Analysis
                    </strong>

                    <span>
                      Cloud-powered file security
                    </span>
                  </div>
                </div>

              </div>
            </div>

            <div className="visual-footer">
              <span className="footer-status"></span>
              All security systems operational
            </div>

          </div>

          <div className="shield-orbit orbit-one"></div>
          <div className="shield-orbit orbit-two"></div>

          <div className="visual-shield">
            <div className="shield-glow"></div>
            <span>⬡</span>
          </div>

        </div>

        <div className="login-form-side">

          <div className="mobile-brand">
            <div className="mobile-logo">
              ⬡
            </div>

            <div>
              <strong>CyberShield</strong>
              <span>AI SECURITY PLATFORM</span>
            </div>
          </div>

          <div className="login-form-card">

            <div className="login-header">
              <span className="login-eyebrow">
                SECURE ACCESS
              </span>

              <h2>Welcome Back</h2>

              <p>
                Sign in to access your CyberShield
                security dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin}>

              <div className="login-field">
                <label>Email Address</label>

                <div className="login-input-wrapper">
                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={event =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="login-field">
                <label>Password</label>

                <div className="login-input-wrapper password-wrapper">
                  <span className="input-icon">
                    ●
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={event =>
                      setPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        <circle
                          cx="12"
                          cy="12"
                          r="2.7"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 3l18 18"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />

                        <path
                          d="M10.6 6.2C11.05 6.07 11.52 6 12 6c6 0 9.5 6 9.5 6a17.8 17.8 0 0 1-3.2 3.75M6.4 6.85C4.15 8.18 2.5 12 2.5 12s3.5 6 9.5 6c1.2 0 2.3-.23 3.28-.6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
              >
                <span>Sign In</span>
                <b>→</b>
              </button>

            </form>

            <div className="login-divider">
              <span></span>
              <small>OR</small>
              <span></span>
            </div>

            <button
              className="guest-button"
              onClick={() => navigate("/")}
            >
              Continue as Guest
            </button>

            <div className="login-footer">
              <span>
                Don't have an account?
              </span>

              <button
                onClick={() =>
                  navigate("/signup")
                }
              >
                Create Account
              </button>
            </div>

          </div>

          <div className="login-security">
            <span>⬡</span>
            Secure CyberShield Session
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;