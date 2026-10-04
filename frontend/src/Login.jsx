import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import BrandMark from "./BrandMark";
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
                <BrandMark />
              </div>

              <div>
                <strong className="brand-wordmark">
                  <span className="brand-word-cyber">Cyber</span>
                  <span className="brand-word-shield">Shield</span>
                </strong>
                <span>AI SECURITY</span>
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
                  <div className="point-icon"><Icon name="check" size={14} /></div>

                  <div>
                    <strong>
                      Preliminary Threat Analysis
                    </strong>

                    <span>
                      Review suspicious indicators
                    </span>
                  </div>
                </div>

                <div className="security-point">
                  <div className="point-icon"><Icon name="check" size={14} /></div>

                  <div>
                    <strong>
                      Security Analysis
                    </strong>

                    <span>
                      Review suspicious activity
                    </span>
                  </div>
                </div>

                <div className="security-point">
                  <div className="point-icon"><Icon name="check" size={14} /></div>

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
              Security analysis workspace
            </div>

          </div>

          <div className="shield-orbit orbit-one"></div>
          <div className="shield-orbit orbit-two"></div>

          <div className="visual-shield">
            <div className="shield-glow"></div>
            <Icon name="privacy" size={20} />
          </div>

        </div>

        <div className="login-form-side">

          <div className="mobile-brand">
            <div className="mobile-logo">
              <BrandMark />
            </div>

            <div>
              <strong className="brand-wordmark">
                <span className="brand-word-cyber">Cyber</span>
                <span className="brand-word-shield">Shield</span>
              </strong>
              <span>AI SECURITY</span>
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
                <label htmlFor="login-email">Email Address</label>

                <div className="login-input-wrapper">
                  <span className="input-icon">
                    <Icon name="email" size={16} />
                  </span>

                  <input
                    id="login-email"
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
                <label htmlFor="login-password">Password</label>

                <div className="login-input-wrapper password-wrapper">
                  <span className="input-icon">
                    <Icon name="password" size={16} />
                  </span>

                  <input
                    id="login-password"
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
                    <Icon name={showPassword ? "eye" : "eyeOff"} size={17} />
                  </button>
                </div>
              </div>

              {error && (
                <div className="login-error" role="alert">
                  <span>!</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
              >
                <span>Sign In</span>
                <Icon name="chevron" size={16} />
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
            <Icon name="privacy" size={16} />
            Secure CyberShield Session
          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;