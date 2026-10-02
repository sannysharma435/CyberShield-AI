import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState("");

  const handleSignup = event => {
    event.preventDefault();

    setError("");

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (name.trim().length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const users = JSON.parse(
      localStorage.getItem("cybershield_users") || "[]"
    );

    const existingUser = users.find(
      item =>
        item.email?.toLowerCase() ===
        email.trim().toLowerCase()
    );

    if (existingUser) {
      setError(
        "An account with this email already exists."
      );
      return;
    }

    const newUser = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password
    };

    users.push(newUser);

    localStorage.setItem(
      "cybershield_users",
      JSON.stringify(users)
    );

    localStorage.setItem(
      "cybershield_user",
      JSON.stringify({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      })
    );

    navigate("/");
  };

  const EyeIcon = ({ hidden }) => {
    if (hidden) {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
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
      );
    }

    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
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
    );
  };

  return (
    <div className="signup-page">

      <div className="signup-bg-glow signup-bg-one"></div>
      <div className="signup-bg-glow signup-bg-two"></div>

      <div className="signup-shell">

        {/* LEFT SIDE */}

        <div className="signup-visual">

          <div className="signup-grid"></div>

          <div className="signup-visual-content">

            <div className="signup-brand">

              <div className="signup-brand-logo">
                ⬡
              </div>

              <div>
                <strong>
                  CyberShield
                </strong>

                <span>
                  AI SECURITY PLATFORM
                </span>
              </div>

            </div>

            <div className="signup-visual-main">

              <div className="signup-eyebrow">
                <span></span>
                JOIN THE SECURITY NETWORK
              </div>

              <h1>
                Build your
                <br />
                <span>secure future.</span>
              </h1>

              <p>
                Create your CyberShield account and
                keep your security scans, activity and
                protection tools organized in one place.
              </p>

              <div className="signup-points">

                <div className="signup-point">

                  <div className="signup-point-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Personalized Security
                    </strong>

                    <span>
                      Your security activity stays organized
                    </span>
                  </div>

                </div>

                <div className="signup-point">

                  <div className="signup-point-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Smart Threat Analysis
                    </strong>

                    <span>
                      Analyze URLs, files and emails
                    </span>
                  </div>

                </div>

                <div className="signup-point">

                  <div className="signup-point-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Secure Media Protection
                    </strong>

                    <span>
                      Cloud-powered media security
                    </span>
                  </div>

                </div>

              </div>

            </div>

            <div className="signup-visual-footer">
              <span></span>
              Your security journey starts here
            </div>

          </div>

          <div className="signup-shield-orbit signup-orbit-one"></div>
          <div className="signup-shield-orbit signup-orbit-two"></div>

          <div className="signup-shield">
            <div></div>
            <span>⬡</span>
          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="signup-form-side">

          <div className="signup-mobile-brand">

            <div className="signup-mobile-logo">
              ⬡
            </div>

            <div>
              <strong>
                CyberShield
              </strong>

              <span>
                AI SECURITY PLATFORM
              </span>
            </div>

          </div>

          <div className="signup-form-card">

            <div className="signup-header">

              <span className="signup-eyebrow-small">
                CREATE ACCOUNT
              </span>

              <h2>
                Join CyberShield
              </h2>

              <p>
                Create your account to start
                protecting your digital world.
              </p>

            </div>

            <form onSubmit={handleSignup}>

              {/* NAME */}

              <div className="signup-field">

                <label>
                  Full Name
                </label>

                <div className="signup-input-wrapper">

                  <span className="signup-input-icon">
                    ◉
                  </span>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={event =>
                      setName(event.target.value)
                    }
                    autoComplete="name"
                  />

                </div>

              </div>

              {/* EMAIL */}

              <div className="signup-field">

                <label>
                  Email Address
                </label>

                <div className="signup-input-wrapper">

                  <span className="signup-input-icon">
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

              {/* PASSWORD */}

              <div className="signup-field">

                <label>
                  Password
                </label>

                <div className="signup-input-wrapper">

                  <span className="signup-input-icon">
                    ●
                  </span>

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Create a password"
                    value={password}
                    onChange={event =>
                      setPassword(event.target.value)
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <EyeIcon
                      hidden={!showPassword}
                    />
                  </button>

                </div>

              </div>

              {/* CONFIRM PASSWORD */}

              <div className="signup-field">

                <label>
                  Confirm Password
                </label>

                <div className="signup-input-wrapper">

                  <span className="signup-input-icon">
                    ●
                  </span>

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={event =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    <EyeIcon
                      hidden={!showConfirmPassword}
                    />
                  </button>

                </div>

              </div>

              {error && (
                <div className="signup-error">

                  <span>!</span>

                  <p>
                    {error}
                  </p>

                </div>
              )}

              <label className="signup-terms">

                <input
                  type="checkbox"
                  required
                />

                <span>
                  I agree to the CyberShield
                  terms and security policy.
                </span>

              </label>

              <button
                type="submit"
                className="signup-button"
              >
                <span>
                  Create Account
                </span>

                <b>
                  →
                </b>
              </button>

            </form>

            <div className="signup-divider">

              <span></span>

              <small>
                OR
              </small>

              <span></span>

            </div>

            <button
              className="signup-login-button"
              onClick={() =>
                navigate("/login")
              }
            >
              Already have an account?{" "}
              <strong>
                Sign In
              </strong>
            </button>

          </div>

          <div className="signup-security">

            <span>
              ⬡
            </span>

            Secure CyberShield Session

          </div>

        </div>

      </div>

    </div>
  );
}

export default Signup;