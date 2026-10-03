import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const API = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000"
).replace(/\/+$/, "");;

const menuItems = [
  { id: "dashboard", icon: "▦", label: "Dashboard" },
  { id: "url", icon: "↗", label: "URL Scanner" },
  { id: "email", icon: "✉", label: "Email Scanner" },
  { id: "file", icon: "▣", label: "File Scanner" },
  { id: "password", icon: "◉", label: "Password Checker" },
  { id: "privacy", icon: "◇", label: "Privacy Analyzer" },
  { id: "threat", icon: "⌁", label: "Threat Intelligence" },
  { id: "system", icon: "⌘", label: "System Monitor" },
  { id: "reports", icon: "▤", label: "Reports" }
];

function getLoggedInUser() {
  try {
    const user = localStorage.getItem("cybershield_user");

    if (!user) {
      return null;
    }

    const parsedUser = JSON.parse(user);

    if (!parsedUser?.id) {
      return null;
    }

    return parsedUser;
  } catch {
    return null;
  }
}

function App() {
  const navigate = useNavigate();

  const currentUser = getLoggedInUser();

  const displayName =
    currentUser?.name ||
    currentUser?.email ||
    "Guest User";

  const displayEmail =
    currentUser?.email ||
    "Guest session";

  const avatarText = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map(item => item[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "GU";

  const [active, setActive] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [url, setUrl] = useState("");
  const [urlResult, setUrlResult] = useState(null);
  const [urlLoading, setUrlLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [emailResult, setEmailResult] = useState(null);
  const [emailLoading, setEmailLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [fileResult, setFileResult] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);

  const [password, setPassword] = useState("");
  const [passwordResult, setPasswordResult] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [privacyUrl, setPrivacyUrl] = useState("");
  const [privacyResult, setPrivacyResult] = useState(null);
  const [privacyLoading, setPrivacyLoading] = useState(false);

  const [threatInput, setThreatInput] = useState("");
  const [threatResult, setThreatResult] = useState(null);
  const [threatLoading, setThreatLoading] = useState(false);
  const [threatRecent, setThreatRecent] = useState([]);

  const [systemStatus, setSystemStatus] = useState(null);
  const [systemLoading, setSystemLoading] = useState(false);

  const [reportSearch, setReportSearch] = useState("");
  const [reportType, setReportType] = useState("all");
  const [reportStatus, setReportStatus] = useState("all");
  const [reportSelected, setReportSelected] = useState(null);

  const [scans, setScans] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    safe: 0,
    suspicious: 0,
    malicious: 0
  });

  const getAuthHeaders = includeJson => {
    const user = getLoggedInUser();

    return {
      ...(includeJson
        ? {
            "Content-Type": "application/json"
          }
        : {}),
      ...(user?.id
        ? {
            "X-User-ID": String(user.id)
          }
        : {})
    };
  };

  const resetHistory = () => {
    setScans([]);

    setStats({
      total: 0,
      safe: 0,
      suspicious: 0,
      malicious: 0
    });
  };

  const loadHistory = async () => {
    const user = getLoggedInUser();

    if (!user?.id) {
      resetHistory();
      return;
    }

    try {
      const response = await fetch(
        `${API}/api/scans/recent?limit=100`,
        {
          method: "GET",
          headers: getAuthHeaders(false)
        }
      );

      if (!response.ok) {
        resetHistory();
        return;
      }

      const data = await response.json();
      const list = data.scans || [];

      setScans(list);

      setStats({
        total: list.length,

        safe: list.filter(
          item =>
            item.status === "safe" ||
            item.status === "strong" ||
            item.status === "very-strong" ||
            item.status === "private"
        ).length,

        suspicious: list.filter(
          item =>
            item.status === "suspicious" ||
            item.status === "medium"
        ).length,

        malicious: list.filter(
          item =>
            item.status === "malicious" ||
            item.status === "high-risk" ||
            item.status === "weak"
        ).length
      });
    } catch {
      resetHistory();
    }
  };

  const fetchSystemStatus = async () => {
    setSystemLoading(true);

    try {
      const response = await fetch(
        `${API}/api/system/status`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "System status check failed"
        );
      }

      setSystemStatus(data);
    } catch (error) {
      console.error(error);

      setSystemStatus({
        status: "unknown",
        protection_score: 0,
        system_protected: false,
        error: error.message
      });
    } finally {
      setSystemLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();

    const handleStorageChange = event => {
      if (event.key === "cybershield_user") {
        loadHistory();
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("cybershield_user");

    resetHistory();

    setActive("dashboard");

    navigate("/");

    window.location.reload();
  };

  const scanUrl = async () => {
    if (!url.trim()) return;

    setUrlLoading(true);
    setUrlResult(null);

    try {
      const response = await fetch(
        `${API}/api/url/scan`,
        {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            url
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "URL scan failed"
        );
      }

      setUrlResult(data);

      await loadHistory();
    } catch (error) {
      setUrlResult({
        status: "error",
        risk_score: 100,
        message: error.message,
        indicators: []
      });
    } finally {
      setUrlLoading(false);
    }
  };

  const scanEmail = async () => {
    if (!email.trim()) return;

    setEmailLoading(true);
    setEmailResult(null);

    try {
      const response = await fetch(
        `${API}/api/email/scan`,
        {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            email
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Email scan failed"
        );
      }

      setEmailResult(data);

      await loadHistory();
    } catch (error) {
      setEmailResult({
        status: "error",
        risk_score: 100,
        message: error.message,
        indicators: []
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const scanFile = async () => {
    if (!file) return;

    setFileLoading(true);
    setFileResult(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API}/api/media/scan`,
        {
          method: "POST",
          headers: getAuthHeaders(false),
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "File scan failed"
        );
      }

      setFileResult(data);

      await loadHistory();
    } catch (error) {
      setFileResult({
        analysis: {
          status: "error",
          risk_score: 100,
          reason: error.message,
          indicators: []
        }
      });
    } finally {
      setFileLoading(false);
    }
  };

  const checkPasswordStrength = async () => {
    if (!password) return;

    setPasswordLoading(true);
    setPasswordResult(null);

    try {
      const response = await fetch(
        `${API}/api/password/check`,
        {
          method: "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Password check failed"
        );
      }

      setPasswordResult(data);

      setPassword("");

      await loadHistory();
    } catch (error) {
      setPasswordResult({
        status: "error",
        strength: "Unknown",
        score: 0,
        message: error.message,
        indicators: []
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const analyzePrivacy = async () => {
    if (!privacyUrl.trim()) return;

    setPrivacyLoading(true);
    setPrivacyResult(null);

    try {
      let input = privacyUrl.trim();

      if (
        !input.startsWith("http://") &&
        !input.startsWith("https://")
      ) {
        input = `https://${input}`;
      }

      const parsed = new URL(input);

      const findings = [];
      let risk = 0;

      const protocol = parsed.protocol;

      if (protocol !== "https:") {
        risk += 25;

        findings.push({
          type: "danger",
          title: "No HTTPS protection",
          description:
            "This URL does not use HTTPS. Data exchanged with the website may have weaker transport protection."
        });
      } else {
        findings.push({
          type: "safe",
          title: "HTTPS enabled",
          description:
            "The URL uses HTTPS for encrypted transport."
        });
      }

      const trackingParameters = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "fbclid",
        "gclid",
        "msclkid",
        "dclid",
        "mc_cid",
        "mc_eid"
      ];

      const foundTrackingParameters =
        trackingParameters.filter(
          parameter =>
            parsed.searchParams.has(parameter)
        );

      if (foundTrackingParameters.length > 0) {
        risk += Math.min(
          30,
          foundTrackingParameters.length * 6
        );

        findings.push({
          type: "warning",
          title: "Tracking parameters detected",
          description:
            "The URL contains marketing or attribution parameters that may be used for tracking.",
          details:
            foundTrackingParameters.join(", ")
        });
      } else {
        findings.push({
          type: "safe",
          title: "No common tracking parameters",
          description:
            "No common advertising or attribution parameters were detected in the URL."
        });
      }

      const suspiciousParameters = [
        "token",
        "session",
        "sessionid",
        "auth",
        "apikey",
        "api_key",
        "password",
        "passwd",
        "email",
        "phone"
      ];

      const sensitiveParameters =
        suspiciousParameters.filter(
          parameter =>
            parsed.searchParams.has(parameter)
        );

      if (sensitiveParameters.length > 0) {
        risk += Math.min(
          30,
          sensitiveParameters.length * 8
        );

        findings.push({
          type: "danger",
          title: "Sensitive URL parameters",
          description:
            "The URL contains parameters that may expose sensitive information.",
          details:
            sensitiveParameters.join(", ")
        });
      } else {
        findings.push({
          type: "safe",
          title: "No obvious sensitive parameters",
          description:
            "No common password, token or authentication parameters were detected."
        });
      }

      if (parsed.username || parsed.password) {
        risk += 25;

        findings.push({
          type: "danger",
          title: "Credentials embedded in URL",
          description:
            "The URL contains username or password information."
        });
      }

      if (parsed.hostname.includes("xn--")) {
        risk += 20;

        findings.push({
          type: "warning",
          title: "Internationalized domain detected",
          description:
            "The domain uses punycode. Verify the website identity carefully before entering sensitive information."
        });
      }

      const hostnameParts =
        parsed.hostname
          .split(".")
          .filter(Boolean);

      if (hostnameParts.length >= 4) {
        risk += 10;

        findings.push({
          type: "warning",
          title: "Large subdomain structure",
          description:
            "The hostname contains multiple subdomain levels. Review the domain carefully."
        });
      }

      if (parsed.hostname.length > 45) {
        risk += 10;

        findings.push({
          type: "warning",
          title: "Long domain name",
          description:
            "The domain name is unusually long and should be reviewed carefully."
        });
      }

      if (risk > 100) {
        risk = 100;
      }

      let status = "private";

      if (risk >= 60) {
        status = "high-risk";
      } else if (risk >= 30) {
        status = "medium";
      }

      setPrivacyResult({
        url: parsed.href,
        hostname: parsed.hostname,
        protocol,
        risk_score: risk,
        status,
        findings,
        tracking_parameters:
          foundTrackingParameters,
        sensitive_parameters:
          sensitiveParameters,
        analyzed_at:
          new Date().toISOString()
      });
    } catch {
      setPrivacyResult({
        status: "error",
        risk_score: 100,
        findings: [
          {
            type: "danger",
            title: "Invalid URL",
            description:
              "Please enter a valid website URL."
          }
        ]
      });
    } finally {
      setPrivacyLoading(false);
    }
  };

  const detectThreatType = value => {
    const input = value.trim();

    if (
      /^https?:\/\//i.test(input)
    ) {
      return "URL";
    }

    if (
      /^(?:\d{1,3}\.){3}\d{1,3}$/.test(input)
    ) {
      return "IP";
    }

    if (/^[a-fA-F0-9]{32}$/.test(input)) {
      return "MD5";
    }

    if (/^[a-fA-F0-9]{40}$/.test(input)) {
      return "SHA-1";
    }

    if (/^[a-fA-F0-9]{64}$/.test(input)) {
      return "SHA-256";
    }

    if (
      /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input)
    ) {
      return "DOMAIN";
    }

    return "INDICATOR";
  };

  const analyzeThreat = async () => {
    if (!threatInput.trim()) return;

    setThreatLoading(true);

    const input = threatInput.trim();
    const type = detectThreatType(input);

    let score = 8;
    const indicators = [];
    const categories = [];

    const lower = input.toLowerCase();

    if (
      lower.includes("login") ||
      lower.includes("verify") ||
      lower.includes("secure") ||
      lower.includes("account") ||
      lower.includes("update")
    ) {
      score += 28;

      indicators.push(
        "Suspicious security/account-related keyword detected"
      );

      categories.push("Phishing");
    }

    if (
      lower.includes("malware") ||
      lower.includes("payload") ||
      lower.includes("ransom")
    ) {
      score += 35;

      indicators.push(
        "Potential malware-related keyword detected"
      );

      categories.push("Malware");
    }

    if (
      lower.includes("bot") ||
      lower.includes("c2") ||
      lower.includes("command")
    ) {
      score += 25;

      indicators.push(
        "Potential command-and-control indicator"
      );

      categories.push("C2");
    }

    if (
      lower.includes("@") &&
      type === "URL"
    ) {
      score += 25;

      indicators.push(
        "URL contains an @ character"
      );

      categories.push("Phishing");
    }

    if (
      type === "URL" &&
      !lower.startsWith("https://")
    ) {
      score += 15;

      indicators.push(
        "URL does not use HTTPS"
      );
    }

    if (input.length > 100) {
      score += 12;

      indicators.push(
        "Unusually long indicator"
      );
    }

    if (type === "IP") {
      indicators.push(
        "Indicator identified as IPv4 address"
      );
    }

    if (
      type === "MD5" ||
      type === "SHA-1" ||
      type === "SHA-256"
    ) {
      indicators.push(
        `${type} file hash detected`
      );
    }

    score = Math.min(score, 100);

    let status = "Low Risk";

    if (score >= 70) {
      status = "High Risk";
    } else if (score >= 35) {
      status = "Medium Risk";
    }

    const uniqueCategories = [
      ...new Set(categories)
    ];

    if (
      uniqueCategories.length === 0
    ) {
      uniqueCategories.push("Unclassified");
    }

    const result = {
      target: input,
      type,
      score,
      status,
      confidence:
        score >= 70
          ? "High"
          : score >= 35
          ? "Medium"
          : "Low",
      firstSeen: "Not available",
      categories: uniqueCategories,
      indicators:
        indicators.length > 0
          ? indicators
          : [
              "No strong heuristic indicator detected"
            ],
      sources: [
        {
          name: "VirusTotal",
          status: "Not Connected"
        },
        {
          name: "AbuseIPDB",
          status: "Not Connected"
        },
        {
          name: "URLhaus",
          status: "Not Connected"
        },
        {
          name: "AlienVault OTX",
          status: "Not Connected"
        }
      ]
    };

    setThreatResult(result);

    setThreatRecent(previous => [
      {
        target: input,
        type,
        score,
        status
      },
      ...previous.filter(
        item => item.target !== input
      )
    ].slice(0, 6));

    setThreatLoading(false);
  };

  const statusClass = status => {
    if (
      status === "safe" ||
      status === "strong" ||
      status === "very-strong" ||
      status === "private"
    ) {
      return "safe";
    }

    if (
      status === "suspicious" ||
      status === "medium"
    ) {
      return "warning";
    }

    if (
      status === "malicious" ||
      status === "weak" ||
      status === "high-risk" ||
      status === "error"
    ) {
      return "danger";
    }

    return "neutral";
  };

  const formatDate = date => {
    if (!date) return "-";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };

  const renderResult = result => {
    if (!result) return null;

    const status =
      result.status ||
      result.analysis?.status ||
      "unknown";

    const score =
      result.risk_score ??
      result.analysis?.risk_score ??
      0;

    const indicators =
      result.indicators ||
      result.analysis?.indicators ||
      [];

    return (
      <div
        className={`scan-result ${statusClass(
          status
        )}`}
      >
        <div className="result-header">
          <div>
            <span className="result-label">
              SCAN RESULT
            </span>

            <h3>
              {String(status).toUpperCase()}
            </h3>
          </div>

          <div className="risk-score">
            <span>Risk Score</span>
            <strong>{score}</strong>
            <small>/100</small>
          </div>
        </div>

        <div className="result-message">
          {result.message ||
            result.analysis?.reason ||
            "Analysis completed"}
        </div>

        {indicators.length > 0 && (
          <div className="indicators">
            <span>
              Detected indicators
            </span>

            {indicators.map(
              (item, index) => (
                <div
                  className="indicator"
                  key={index}
                >
                  <b>•</b>
                  {item}
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const dashboard = (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            SECURITY OVERVIEW
          </div>

          <h1>Security Dashboard</h1>

          <p>
            Monitor and protect your digital
            environment.
          </p>
        </div>

        <div className="protection-badge">
          <span className="pulse" />
          Protection Active
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            ⌁
          </div>

          <div>
            <span>Total Scans</span>
            <strong>{stats.total}</strong>
          </div>

          <small>All security scans</small>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            ✓
          </div>

          <div>
            <span>Safe</span>
            <strong>{stats.safe}</strong>
          </div>

          <small>Threat-free results</small>
        </div>

        <div className="stat-card">
          <div className="stat-icon yellow">
            !
          </div>

          <div>
            <span>Suspicious</span>
            <strong>{stats.suspicious}</strong>
          </div>

          <small>Needs attention</small>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            ⚠
          </div>

          <div>
            <span>High Risk</span>
            <strong>{stats.malicious}</strong>
          </div>

          <small>Potential threats</small>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel quick-panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">
                SECURITY TOOLS
              </span>

              <h2>Quick Scanner</h2>
            </div>

            <span className="live-dot">
              LIVE
            </span>
          </div>

          <div className="quick-tools">
            <button
              onClick={() =>
                setActive("url")
              }
            >
              <span>↗</span>

              <div>
                <strong>URL Scanner</strong>
                <small>
                  Detect malicious links
                </small>
              </div>
            </button>

            <button
              onClick={() =>
                setActive("file")
              }
            >
              <span>▣</span>

              <div>
                <strong>File Scanner</strong>
                <small>
                  Analyze files securely
                </small>
              </div>
            </button>

            <button
              onClick={() =>
                setActive("email")
              }
            >
              <span>✉</span>

              <div>
                <strong>Email Scanner</strong>
                <small>
                  Check suspicious emails
                </small>
              </div>
            </button>

            <button
              onClick={() =>
                setActive("password")
              }
            >
              <span>◉</span>

              <div>
                <strong>
                  Password Checker
                </strong>

                <small>
                  Check password strength
                </small>
              </div>
            </button>

            <button
              onClick={() =>
                setActive("privacy")
              }
            >
              <span>◇</span>

              <div>
                <strong>
                  Privacy Analyzer
                </strong>

                <small>
                  Analyze privacy risks
                </small>
              </div>
            </button>
          </div>
        </div>

        <div className="panel protection-panel">
          <div className="panel-title">
            <div>
              <span className="eyebrow">
                SYSTEM STATUS
              </span>

              <h2>Protection Center</h2>
            </div>

            <span className="shield-symbol">
              ⬡
            </span>
          </div>

          <div className="protection-ring">
            <div>
              <strong>ACTIVE</strong>
              <span>CyberShield</span>
            </div>
          </div>

          <div className="protection-list">
            <div>
              <span>
                Real-time protection
              </span>

              <b>ON</b>
            </div>

            <div>
              <span>
                Threat monitoring
              </span>

              <b>ON</b>
            </div>

            <div>
              <span>
                Cloud analysis
              </span>

              <b>ON</b>
            </div>

            <div>
              <span>
                Privacy analysis
              </span>

              <b>ON</b>
            </div>
          </div>
        </div>
      </div>

      <div className="panel history-panel">
        <div className="panel-title">
          <div>
            <span className="eyebrow">
              ACTIVITY
            </span>

            <h2>
              Recent Security Scans
            </h2>
          </div>

          <button
            className="text-button"
            onClick={loadHistory}
          >
            Refresh ↻
          </button>
        </div>

        <ScanTable
          scans={scans.slice(0, 8)}
          statusClass={statusClass}
          formatDate={formatDate}
        />
      </div>
    </>
  );

  const urlScanner = (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            THREAT DETECTION
          </div>

          <h1>URL Scanner</h1>

          <p>
            Analyze suspicious links before you
            open them.
          </p>
        </div>
      </div>

      <div className="scanner-layout">
        <div className="panel scanner-panel">
          <div className="scanner-icon">
            ↗
          </div>

          <h2>Scan a URL</h2>

          <p className="scanner-description">
            Enter a website URL and CyberShield
            will analyze it for common suspicious
            indicators.
          </p>

          <div className="input-wrapper">
            <span>⌕</span>

            <input
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={event =>
                setUrl(event.target.value)
              }
              onKeyDown={event => {
                if (event.key === "Enter") {
                  scanUrl();
                }
              }}
            />
          </div>

          <button
            className="primary-button"
            onClick={scanUrl}
            disabled={urlLoading}
          >
            {urlLoading
              ? "Scanning..."
              : "Scan URL →"}
          </button>

          {renderResult(urlResult)}
        </div>

        <div className="panel info-panel">
          <span className="eyebrow">
            ANALYSIS ENGINE
          </span>

          <h2>What we check</h2>

          <div className="check-item">
            <span>01</span>

            <div>
              <strong>
                Domain Analysis
              </strong>

              <p>
                Checks suspicious domain patterns.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>02</span>

            <div>
              <strong>
                URL Structure
              </strong>

              <p>
                Detects risky URL characteristics.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>03</span>

            <div>
              <strong>
                Threat Indicators
              </strong>

              <p>
                Identifies suspicious keywords
                and patterns.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>04</span>

            <div>
              <strong>
                HTTPS Security
              </strong>

              <p>
                Checks secure connection usage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const emailScanner = (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            PHISHING DETECTION
          </div>

          <h1>Email Scanner</h1>

          <p>
            Analyze email content for phishing
            and suspicious activity.
          </p>
        </div>
      </div>

      <div className="scanner-layout">
        <div className="panel scanner-panel">
          <div className="scanner-icon">
            ✉
          </div>

          <h2>Scan an Email</h2>

          <p className="scanner-description">
            Paste an email message below.
            CyberShield will analyze suspicious
            phrases, links, urgency and financial
            requests.
          </p>

          <textarea
            className="email-input"
            placeholder="Enter email"
            value={email}
            onChange={event =>
              setEmail(event.target.value)
            }
          />

          <button
            className="primary-button"
            onClick={scanEmail}
            disabled={emailLoading}
          >
            {emailLoading
              ? "Analyzing..."
              : "Scan Email →"}
          </button>

          {emailResult &&
            renderResult(emailResult)}
        </div>

        <div className="panel info-panel">
          <span className="eyebrow">
            PHISHING ENGINE
          </span>

          <h2>What we detect</h2>

          <div className="check-item">
            <span>01</span>

            <div>
              <strong>
                Urgency Patterns
              </strong>

              <p>
                Detects pressure and urgent
                language.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>02</span>

            <div>
              <strong>
                Suspicious Links
              </strong>

              <p>
                Identifies potentially risky links.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>03</span>

            <div>
              <strong>
                Financial Requests
              </strong>

              <p>
                Detects common payment-related
                phishing patterns.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>04</span>

            <div>
              <strong>
                Phishing Indicators
              </strong>

              <p>
                Combines multiple suspicious
                indicators.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const fileScanner = (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            MEDIA SECURITY
          </div>

          <h1>File Scanner</h1>

          <p>
            Analyze files before storing or
            sharing them.
          </p>
        </div>
      </div>

      <div className="scanner-layout">
        <div className="panel scanner-panel">
          <div className="scanner-icon">
            ▣
          </div>

          <h2>Scan a File</h2>

          <p className="scanner-description">
            Upload an image, video, PDF or
            supported document for preliminary
            security analysis.
          </p>

          <label className="file-upload">
            <input
              type="file"
              onChange={event =>
                setFile(
                  event.target.files?.[0] ||
                    null
                )
              }
            />

            <span>
              {file
                ? file.name
                : "Choose a file"}
            </span>
          </label>

          <button
            className="primary-button"
            onClick={scanFile}
            disabled={
              fileLoading || !file
            }
          >
            {fileLoading
              ? "Analyzing..."
              : "Scan File →"}
          </button>

          {fileResult &&
            renderResult(fileResult)}
        </div>

        <div className="panel info-panel">
          <span className="eyebrow">
            MEDIA ENGINE
          </span>

          <h2>Security checks</h2>

          <div className="check-item">
            <span>01</span>

            <div>
              <strong>
                File Type
              </strong>

              <p>
                Checks supported file extensions.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>02</span>

            <div>
              <strong>
                File Size
              </strong>

              <p>
                Validates the maximum supported
                upload size.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>03</span>

            <div>
              <strong>
                SHA-256 Hash
              </strong>

              <p>
                Generates a file fingerprint.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>04</span>

            <div>
              <strong>
                Cloudinary
              </strong>

              <p>
                Safe media can be uploaded to
                Cloudinary.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const passwordChecker = (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            ACCOUNT SECURITY
          </div>

          <h1>Password Checker</h1>

          <p>
            Check password strength without
            storing the password.
          </p>
        </div>
      </div>

      <div className="scanner-layout">
        <div className="panel scanner-panel">
          <div className="scanner-icon">
            ◉
          </div>

          <h2>Check Password Strength</h2>

          <p className="scanner-description">
            Enter a password to evaluate its
            strength. The password is never stored
            by CyberShield.
          </p>

          <div className="input-wrapper password-wrapper">
            <span>●</span>

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Enter password"
              value={password}
              onChange={event =>
                setPassword(
                  event.target.value
                )
              }
            />

            <button
              type="button"
              className="password-eye-button"
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
              {showPassword
                ? "◉"
                : "◌"}
            </button>
          </div>

          <button
            className="primary-button"
            onClick={
              checkPasswordStrength
            }
            disabled={passwordLoading}
          >
            {passwordLoading
              ? "Checking..."
              : "Check Password →"}
          </button>

          {passwordResult &&
            renderResult(
              {
                ...passwordResult,
                risk_score:
                  100 -
                  Number(
                    passwordResult.score ||
                      0
                  )
              }
            )}
        </div>

        <div className="panel info-panel">
          <span className="eyebrow">
            PASSWORD ENGINE
          </span>

          <h2>What we check</h2>

          <div className="check-item">
            <span>01</span>

            <div>
              <strong>
                Password Length
              </strong>

              <p>
                Checks the overall password length.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>02</span>

            <div>
              <strong>
                Character Variety
              </strong>

              <p>
                Looks for multiple character
                classes.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>03</span>

            <div>
              <strong>
                Weak Patterns
              </strong>

              <p>
                Detects common password weaknesses.
              </p>
            </div>
          </div>

          <div className="check-item">
            <span>04</span>

            <div>
              <strong>
                No Plaintext Storage
              </strong>

              <p>
                Password values are not saved in
                scan history.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const privacyAnalyzer = (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            PRIVACY INTELLIGENCE
          </div>

          <h1>Privacy Analyzer</h1>

          <p>
            Analyze a URL for privacy and data
            exposure risks.
          </p>
        </div>
      </div>

      <div className="privacy-layout">
        <div className="panel privacy-main">
          <div className="privacy-hero-icon">
            ◇
          </div>

          <h2>
            Analyze Website Privacy
          </h2>

          <p>
            Enter a URL to check HTTPS,
            tracking parameters, sensitive
            parameters and domain structure.
          </p>

          <div className="privacy-input-wrapper">
            <span>⌕</span>

            <input
              type="text"
              placeholder="https://example.com"
              value={privacyUrl}
              onChange={event =>
                setPrivacyUrl(
                  event.target.value
                )
              }
              onKeyDown={event => {
                if (event.key === "Enter") {
                  analyzePrivacy();
                }
              }}
            />
          </div>

          <button
            className="primary-button"
            onClick={analyzePrivacy}
            disabled={privacyLoading}
          >
            {privacyLoading
              ? "Analyzing..."
              : "Analyze Privacy →"}
          </button>

          {privacyResult && (
            <div className="privacy-result">
              <div className="privacy-score-box">
                <span>Privacy Risk</span>

                <strong>
                  {privacyResult.risk_score}
                </strong>

                <small>/100</small>

                <div
                  className={`privacy-score-status ${statusClass(
                    privacyResult.status
                  )}`}
                >
                  {String(
                    privacyResult.status ||
                      "unknown"
                  ).toUpperCase()}
                </div>
              </div>

              <div className="privacy-meta">
                <div>
                  <span>Domain</span>

                  <strong>
                    {privacyResult.hostname ||
                      "-"}
                  </strong>
                </div>

                <div>
                  <span>Protocol</span>

                  <strong>
                    {privacyResult.protocol ===
                    "https:"
                      ? "HTTPS"
                      : "HTTP"}
                  </strong>
                </div>

                <div>
                  <span>
                    Tracking Params
                  </span>

                  <strong>
                    {
                      privacyResult
                        .tracking_parameters
                        ?.length
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Sensitive Params
                  </span>

                  <strong>
                    {
                      privacyResult
                        .sensitive_parameters
                        ?.length
                    }
                  </strong>
                </div>
              </div>

              <div className="privacy-findings">
                <div className="privacy-findings-title">
                  <span>
                    SECURITY FINDINGS
                  </span>

                  <small>
                    {
                      privacyResult
                        .findings?.length
                    }{" "}
                    checks
                  </small>
                </div>

                {privacyResult.findings?.map(
                  (finding, index) => (
                    <div
                      className={`privacy-finding ${finding.type}`}
                      key={index}
                    >
                      <div className="finding-icon">
                        {finding.type ===
                        "safe"
                          ? "✓"
                          : finding.type ===
                            "warning"
                          ? "!"
                          : "×"}
                      </div>

                      <div className="finding-content">
                        <strong>
                          {finding.title}
                        </strong>

                        <p>
                          {finding.description}
                        </p>

                        {finding.details && (
                          <small>
                            {finding.details}
                          </small>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        <div className="panel privacy-info">
          <span className="eyebrow">
            PRIVACY ENGINE
          </span>

          <h2>
            What we analyze
          </h2>

          <div className="privacy-check-card">
            <div className="privacy-check-number">
              01
            </div>

            <div>
              <strong>
                HTTPS Security
              </strong>

              <p>
                Checks whether the website uses
                encrypted HTTPS transport.
              </p>
            </div>
          </div>

          <div className="privacy-check-card">
            <div className="privacy-check-number">
              02
            </div>

            <div>
              <strong>
                Tracking Parameters
              </strong>

              <p>
                Detects common UTM, Facebook,
                Google and marketing identifiers.
              </p>
            </div>
          </div>

          <div className="privacy-check-card">
            <div className="privacy-check-number">
              03
            </div>

            <div>
              <strong>
                Sensitive Data
              </strong>

              <p>
                Looks for tokens, session IDs,
                passwords and authentication
                parameters in the URL.
              </p>
            </div>
          </div>

          <div className="privacy-check-card">
            <div className="privacy-check-number">
              04
            </div>

            <div>
              <strong>
                Domain Intelligence
              </strong>

              <p>
                Reviews domain structure, punycode
                and unusually complex hostnames.
              </p>
            </div>
          </div>

          <div className="privacy-note">
            <span>◇</span>

            <div>
              <strong>
                Privacy-first analysis
              </strong>

              <p>
                This analyzer evaluates the URL
                itself. It does not automatically
                access your private browser data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const threatIntelligence = (
    <div className="threat-page">

      <div className="threat-page-header">
        <div>
          <div className="threat-eyebrow">
            THREAT INTELLIGENCE
          </div>

          <h1>
            Threat Intelligence
          </h1>

          <p>
            Investigate URLs, domains, IP addresses
            and file hashes for security indicators.
          </p>
        </div>

        <div className="threat-mode-card">
          <div className="threat-mode-icon">
            ⌁
          </div>

          <div>
            <strong>
              Local Intelligence Engine
            </strong>

            <span>
              Heuristic analysis mode
            </span>
          </div>

          <b className="demo-badge">
            DEMO
          </b>
        </div>
      </div>

      <div className="threat-lookup-card">
        <div className="lookup-heading">
          <div className="lookup-icon">
            ⌕
          </div>

          <div>
            <h2>
              Investigate an Indicator
            </h2>

            <p>
              Enter an IP, domain, URL or file hash.
            </p>
          </div>
        </div>

        <div className="lookup-input-row">
          <div className="lookup-input-wrapper">
            <span>⌁</span>

            <input
              type="text"
              placeholder="example.com, 8.8.8.8, URL or SHA-256 hash"
              value={threatInput}
              onChange={event =>
                setThreatInput(
                  event.target.value
                )
              }
              onKeyDown={event => {
                if (event.key === "Enter") {
                  analyzeThreat();
                }
              }}
            />

            {threatInput && (
              <button
                className="clear-threat-input"
                onClick={() =>
                  setThreatInput("")
                }
              >
                ×
              </button>
            )}
          </div>

          <button
            className="analyze-threat-button"
            onClick={analyzeThreat}
            disabled={threatLoading}
          >
            <span>⌁</span>

            {threatLoading
              ? "Analyzing..."
              : "Analyze"}
          </button>
        </div>

        <div className="threat-type-buttons">
          {[
            "8.8.8.8",
            "example.com",
            "https://example.com",
            "d41d8cd98f00b204e9800998ecf8427e"
          ].map(example => (
            <button
              key={example}
              className="threat-type-button"
              onClick={() =>
                setThreatInput(example)
              }
            >
              {detectThreatType(example)}
              <span>
                {example.length > 30
                  ? `${example.slice(
                      0,
                      28
                    )}...`
                  : example}
              </span>
            </button>
          ))}
        </div>
      </div>

      {!threatResult ? (
        <div className="threat-empty-state">
          <div className="empty-threat-icon">
            ⌁
          </div>

          <h2>
            Start an intelligence lookup
          </h2>

          <p>
            Enter a threat indicator above to
            view risk scoring, categories and
            detected indicators.
          </p>

          <div className="empty-example-list">
            <span>IPv4</span>
            <span>DOMAIN</span>
            <span>URL</span>
            <span>MD5</span>
            <span>SHA-1</span>
            <span>SHA-256</span>
          </div>
        </div>
      ) : (
        <>
          <div className="threat-main-grid">

            <div className="threat-card score-card">
              <div className="card-title">
                <div className="card-title-icon danger">
                  ⚠
                </div>

                <h3>
                  Threat Score
                </h3>
              </div>

              <div
                className={`score-circle ${
                  threatResult.score >= 70
                    ? "high"
                    : threatResult.score >= 35
                    ? "medium"
                    : "low"
                }`}
              >
                <strong className="score-value">
                  {threatResult.score}
                </strong>

                <span className="score-total">
                  / 100
                </span>

                <span className="score-status">
                  {threatResult.status}
                </span>
              </div>

              <div className="score-meta-grid">
                <div className="score-meta">
                  <span className="meta-icon">
                    ◇
                  </span>

                  <div>
                    <small>
                      Type
                    </small>

                    <strong>
                      {threatResult.type}
                    </strong>
                  </div>
                </div>

                <div className="score-meta">
                  <span className="meta-icon">
                    ◉
                  </span>

                  <div>
                    <small>
                      Confidence
                    </small>

                    <strong>
                      {threatResult.confidence}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="threat-card">
              <div className="card-title">
                <div className="card-title-icon purple">
                  ◇
                </div>

                <h3>
                  Target Information
                </h3>
              </div>

              <div className="target-list">
                <div>
                  <span>
                    Indicator
                  </span>

                  <strong>
                    {threatResult.target}
                  </strong>
                </div>

                <div>
                  <span>
                    Type
                  </span>

                  <strong>
                    {threatResult.type}
                  </strong>
                </div>

                <div>
                  <span>
                    First Seen
                  </span>

                  <strong>
                    {threatResult.firstSeen}
                  </strong>
                </div>

                <div>
                  <span>
                    Confidence
                  </span>

                  <strong>
                    {threatResult.confidence}
                  </strong>
                </div>
              </div>
            </div>

            <div className="threat-card categories-card">
              <div className="card-title">
                <div className="card-title-icon purple">
                  ⌁
                </div>

                <h3>
                  Threat Categories
                </h3>
              </div>

              <div className="category-list">
                {threatResult.categories.map(
                  (category, index) => (
                    <div
                      className="category-row"
                      key={category}
                    >
                      <div className="category-name">
                        <span
                          className={`category-dot ${
                            threatResult.score >=
                            70
                              ? "high"
                              : threatResult.score >=
                                35
                              ? "medium"
                              : "low"
                          }`}
                        >
                          ●
                        </span>

                        {category}
                      </div>

                      <div className="category-bar">
                        <span
                          style={{
                            width: `${Math.min(
                              100,
                              threatResult.score +
                                index * 4
                            )}%`
                          }}
                        />
                      </div>

                      <strong
                        className={`category-level ${
                          threatResult.score >=
                          70
                            ? "high"
                            : threatResult.score >=
                              35
                            ? "medium"
                            : "low"
                        }`}
                      >
                        {threatResult.score}%
                      </strong>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="threat-bottom-grid">

            <div className="threat-card">
              <div className="card-title">
                <div className="card-title-icon red">
                  ⚠
                </div>

                <h3>
                  Threat Indicators
                </h3>
              </div>

              <div className="indicator-list">
                {threatResult.indicators.map(
                  (indicator, index) => (
                    <div
                      className={`indicator-item ${
                        threatResult.score >=
                        70
                          ? "danger"
                          : threatResult.score >=
                            35
                          ? "warning"
                          : "info"
                      }`}
                      key={index}
                    >
                      <span>●</span>

                      <p>
                        {indicator}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="threat-card">
              <div className="card-title">
                <div className="card-title-icon purple">
                  ◈
                </div>

                <h3>
                  Intelligence Sources
                </h3>
              </div>

              <div className="source-list">
                {threatResult.sources.map(
                  source => (
                    <div
                      className="source-row"
                      key={source.name}
                    >
                      <div className="source-logo">
                        {source.name
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <strong>
                        {source.name}
                      </strong>

                      <span className="source-status neutral">
                        {source.status}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="demo-source-note">
                External intelligence providers are
                not connected yet. Results shown here
                use the local heuristic analysis engine.
              </div>
            </div>

            <div className="threat-card recent-card">
              <div className="recent-header">
                <div className="card-title">
                  <div className="card-title-icon purple">
                    ◷
                  </div>

                  <h3>
                    Recent Lookups
                  </h3>
                </div>

                <button
                  onClick={() =>
                    setThreatRecent([])
                  }
                >
                  Clear
                </button>
              </div>

              <div className="recent-list">
                {threatRecent.length === 0 ? (
                  <div className="no-scans">
                    <span>⌁</span>

                    <strong>
                      No lookups yet
                    </strong>
                  </div>
                ) : (
                  threatRecent.map(
                    item => (
                      <div
                        className="recent-row"
                        key={`${item.target}-${item.type}`}
                      >
                        <div className="recent-type">
                          ⌁
                        </div>

                        <div className="recent-value">
                          <strong>
                            {item.target}
                          </strong>

                          <small>
                            {item.type}
                          </small>
                        </div>

                        <span
                          className={`recent-status ${
                            item.score >= 70
                              ? "high"
                              : item.score >=
                                35
                              ? "medium"
                              : "low"
                          }`}
                        >
                          {item.score}
                        </span>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const reportsData = scans.filter(scan => {
    const search =
      reportSearch.trim().toLowerCase();

    const target =
      String(
        scan.target || ""
      ).toLowerCase();

    const type =
      String(
        scan.scan_type || ""
      ).toLowerCase();

    const status =
      String(
        scan.status || ""
      ).toLowerCase();

    const matchesSearch =
      !search ||
      target.includes(search) ||
      type.includes(search) ||
      status.includes(search) ||
      String(scan.id || "").includes(
        search
      );

    const matchesType =
      reportType === "all" ||
      type === reportType;

    const matchesStatus =
      reportStatus === "all" ||
      status === reportStatus;

    return (
      matchesSearch &&
      matchesType &&
      matchesStatus
    );
  });

  const reportsPage = (
    <div className="reports-page">

      <div className="reports-header">
        <div>
          <span className="reports-eyebrow">
            SECURITY ANALYTICS
          </span>

          <h1>
            Security Reports
          </h1>

          <p>
            Review your security scan activity,
            risk levels and detailed findings
            from CyberShield AI.
          </p>
        </div>

        <button
          className="reports-refresh-button"
          onClick={loadHistory}
        >
          ↻ Refresh Reports
        </button>
      </div>

      <div className="reports-stat-grid">

        <div className="report-stat-card total">
          <div className="report-stat-icon">
            ◉
          </div>

          <div>
            <span>Total Scans</span>
            <strong>{stats.total}</strong>
            <small>
              Security checks
            </small>
          </div>
        </div>

        <div className="report-stat-card safe">
          <div className="report-stat-icon">
            ✓
          </div>

          <div>
            <span>Safe Results</span>
            <strong>{stats.safe}</strong>
            <small>
              Low risk findings
            </small>
          </div>
        </div>

        <div className="report-stat-card suspicious">
          <div className="report-stat-icon">
            !
          </div>

          <div>
            <span>Suspicious</span>
            <strong>
              {stats.suspicious}
            </strong>
            <small>
              Needs attention
            </small>
          </div>
        </div>

        <div className="report-stat-card danger">
          <div className="report-stat-icon">
            ⚠
          </div>

          <div>
            <span>High Risk</span>
            <strong>
              {stats.malicious}
            </strong>
            <small>
              Critical findings
            </small>
          </div>
        </div>

      </div>

      <div className="reports-overview-grid">

        <div className="reports-chart-card">

          <div className="reports-card-header">
            <div>
              <span>
                ACTIVITY
              </span>

              <h2>
                Scan Activity Overview
              </h2>
            </div>

            <div className="reports-period">
              Last 7 groups
            </div>
          </div>

          <div className="activity-chart">

            {Array.from({
              length: 7
            }).map((_, index) => {

              const total =
                scans.length;

              const start =
                Math.floor(
                  (index * total) /
                    7
                );

              const end =
                Math.floor(
                  ((index + 1) *
                    total) /
                    7
                );

              const value =
                scans.slice(
                  start,
                  end
                ).length;

              const maxValue =
                Math.max(
                  ...Array.from(
                    { length: 7 },
                    (_, itemIndex) => {
                      const itemStart =
                        Math.floor(
                          (itemIndex *
                            total) /
                            7
                        );

                      const itemEnd =
                        Math.floor(
                          ((itemIndex +
                            1) *
                            total) /
                            7
                        );

                      return scans.slice(
                        itemStart,
                        itemEnd
                      ).length;
                    }
                  ),
                  1
                );

              const height =
                total === 0
                  ? 8
                  : Math.max(
                      10,
                      (value /
                        maxValue) *
                        100
                    );

              return (
                <div
                  className="activity-column"
                  key={index}
                >
                  <div className="activity-value">
                    {value}
                  </div>

                  <div className="activity-bar-area">
                    <div
                      className="activity-bar"
                      style={{
                        height: `${height}%`
                      }}
                    />
                  </div>

                  <span>
                    {[
                      "01",
                      "02",
                      "03",
                      "04",
                      "05",
                      "06",
                      "07"
                    ][index]}
                  </span>
                </div>
              );
            })}

          </div>
        </div>

        <div className="reports-distribution-card">

          <div className="reports-card-header">
            <div>
              <span>
                RISK ANALYSIS
              </span>

              <h2>
                Threat Distribution
              </h2>
            </div>
          </div>

          <div className="threat-distribution">

            <div
              className="distribution-ring"
              style={{
                "--safe":
                  stats.total
                    ? `${
                        (stats.safe /
                          stats.total) *
                        100
                      }%`
                    : "0%",
                "--suspicious":
                  stats.total
                    ? `${
                        (stats.suspicious /
                          stats.total) *
                        100
                      }%`
                    : "0%"
              }}
            >
              <div>
                <strong>
                  {stats.total}
                </strong>

                <span>
                  Total
                </span>
              </div>
            </div>

            <div className="distribution-legend">

              <div>
                <i className="legend-dot safe-dot" />
                <span>Safe</span>
                <strong>
                  {stats.safe}
                </strong>
              </div>

              <div>
                <i className="legend-dot suspicious-dot" />
                <span>
                  Suspicious
                </span>
                <strong>
                  {stats.suspicious}
                </strong>
              </div>

              <div>
                <i className="legend-dot danger-dot" />
                <span>
                  High Risk
                </span>
                <strong>
                  {stats.malicious}
                </strong>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="reports-table-card">

        <div className="reports-table-header">

          <div>
            <span>
              SCAN HISTORY
            </span>

            <h2>
              Recent Security Reports
            </h2>
          </div>

          <div className="reports-count">
            {reportsData.length} reports
          </div>

        </div>

        <div className="reports-filters">

          <div className="reports-search">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search reports..."
              value={reportSearch}
              onChange={event =>
                setReportSearch(
                  event.target.value
                )
              }
            />
          </div>

          <select
            value={reportType}
            onChange={event =>
              setReportType(
                event.target.value
              )
            }
          >
            <option value="all">
              All Types
            </option>

            <option value="url">
              URL
            </option>

            <option value="email">
              Email
            </option>

            <option value="file">
              File
            </option>

            <option value="password">
              Password
            </option>
          </select>

          <select
            value={reportStatus}
            onChange={event =>
              setReportStatus(
                event.target.value
              )
            }
          >
            <option value="all">
              All Status
            </option>

            <option value="safe">
              Safe
            </option>

            <option value="suspicious">
              Suspicious
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high-risk">
              High Risk
            </option>

            <option value="malicious">
              Malicious
            </option>

            <option value="weak">
              Weak
            </option>
          </select>

        </div>

        {reportsData.length === 0 ? (

          <div className="reports-empty">

            <div className="reports-empty-icon">
              ▤
            </div>

            <h3>
              No security reports found
            </h3>

            <p>
              Run a URL, email, file or
              password scan to generate
              your security reports.
            </p>

            <button
              onClick={() =>
                setActive("url")
              }
            >
              Start a Scan
            </button>

          </div>

        ) : (

          <div className="reports-table-wrapper">

            <table className="reports-table">

              <thead>
                <tr>
                  <th>
                    REPORT
                  </th>

                  <th>
                    TYPE
                  </th>

                  <th>
                    TARGET
                  </th>

                  <th>
                    STATUS
                  </th>

                  <th>
                    RISK SCORE
                  </th>

                  <th>
                    DATE
                  </th>

                  <th>
                    ACTION
                  </th>
                </tr>
              </thead>

              <tbody>

                {reportsData.map(
                  (scan, index) => {

                    const status =
                      String(
                        scan.status ||
                          "unknown"
                      ).toLowerCase();

                    const risk =
                      Number(
                        scan.risk_score ||
                          0
                      );

                    let statusType =
                      "safe";

                    if (
                      status ===
                        "suspicious" ||
                      status === "medium"
                    ) {
                      statusType =
                        "suspicious";
                    }

                    if (
                      status ===
                        "malicious" ||
                      status ===
                        "high-risk" ||
                      status === "weak"
                    ) {
                      statusType =
                        "danger";
                    }

                    if (risk >= 60) {
                      statusType =
                        "danger";
                    } else if (
                      risk >= 30
                    ) {
                      statusType =
                        "suspicious";
                    }

                    const type =
                      String(
                        scan.scan_type ||
                          "scan"
                      ).toUpperCase();

                    const target =
                      scan.target ||
                      "Unknown target";

                    return (
                      <tr
                        key={
                          scan.id ||
                          index
                        }
                      >

                        <td>
                          <span className="report-id">
                            #
                            {String(
                              scan.id ||
                                index +
                                  1
                            ).padStart(
                              4,
                              "0"
                            )}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`report-type ${type.toLowerCase()}`}
                          >
                            {type}
                          </span>
                        </td>

                        <td>
                          <div className="report-target">
                            {target}
                          </div>
                        </td>

                        <td>
                          <span
                            className={`report-status ${statusType}`}
                          >
                            <i />
                            {status
                              .replace(
                                "-",
                                " "
                              )
                              .toUpperCase()}
                          </span>
                        </td>

                        <td>
                          <div className="report-risk">

                            <div className="risk-progress">
                              <span
                                style={{
                                  width: `${Math.min(
                                    Math.max(
                                      risk,
                                      0
                                    ),
                                    100
                                  )}%`
                                }}
                              />
                            </div>

                            <strong>
                              {risk}/100
                            </strong>

                          </div>
                        </td>

                        <td>
                          <span className="report-date">
                            {formatDate(
                              scan.created_at
                            )}
                          </span>
                        </td>

                        <td>
                          <button
                            className="report-view-button"
                            onClick={() =>
                              setReportSelected(
                                scan
                              )
                            }
                          >
                            View
                          </button>
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>
          </div>
        )}

      </div>

      {reportSelected && (
        <div
          className="report-modal-overlay"
          onClick={() =>
            setReportSelected(null)
          }
        >
          <div
            className="report-modal"
            onClick={event =>
              event.stopPropagation()
            }
          >

            <div className="report-modal-header">
              <div>
                <span>
                  SECURITY REPORT
                </span>

                <h2>
                  Report #
                  {reportSelected.id}
                </h2>
              </div>

              <button
                onClick={() =>
                  setReportSelected(null)
                }
              >
                ×
              </button>
            </div>

            <div className="report-detail-grid">

              <div>
                <span>
                  Scan Type
                </span>

                <strong>
                  {String(
                    reportSelected.scan_type ||
                      "-"
                  ).toUpperCase()}
                </strong>
              </div>

              <div>
                <span>
                  Status
                </span>

                <strong>
                  {String(
                    reportSelected.status ||
                      "-"
                  ).toUpperCase()}
                </strong>
              </div>

              <div>
                <span>
                  Risk Score
                </span>

                <strong>
                  {reportSelected.risk_score ||
                    0}
                  /100
                </strong>
              </div>

              <div>
                <span>
                  Date
                </span>

                <strong>
                  {formatDate(
                    reportSelected.created_at
                  )}
                </strong>
              </div>

            </div>

            <div className="report-detail-target">
              <span>
                Target
              </span>

              <strong>
                {reportSelected.target ||
                  "-"}
              </strong>
            </div>

            <div className="report-detail-target">
              <span>
                Indicators
              </span>

              <strong>
                {reportSelected.indicators ||
                  "No indicators recorded"}
              </strong>
            </div>

            {reportSelected.file_hash && (
              <div className="report-detail-target">
                <span>
                  SHA-256
                </span>

                <strong>
                  {reportSelected.file_hash}
                </strong>
              </div>
            )}

            {reportSelected.cloudinary_url && (
              <div className="report-detail-target">
                <span>
                  Cloudinary Media
                </span>

                <a
                  href={
                    reportSelected.cloudinary_url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Media
                </a>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );

  const settingsPage = (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            ACCOUNT & SECURITY
          </div>

          <h1>Settings</h1>

          <p>
            Manage your CyberShield account
            and session.
          </p>
        </div>
      </div>

      <div className="settings-grid">

        <div className="panel settings-profile">

          <div className="settings-profile-header">

            <div className="settings-avatar">
              {avatarText}
            </div>

            <div>
              <span className="eyebrow">
                CURRENT SESSION
              </span>

              <h2>
                {currentUser
                  ? currentUser.name ||
                    "Cyber User"
                  : "Guest User"}
              </h2>

              <p>
                {currentUser?.email ||
                  "You are browsing as a guest."}
              </p>
            </div>
          </div>

          <div className="account-status">
            <span className="account-status-dot" />

            {currentUser
              ? "Authenticated session"
              : "Guest session"}
          </div>
        </div>

        <div className="panel account-panel">

          <span className="eyebrow">
            ACCOUNT ACCESS
          </span>

          <h2>
            {currentUser
              ? "Account Management"
              : "Sign in to CyberShield"}
          </h2>

          <p className="settings-description">
            {currentUser
              ? "Manage your current CyberShield session."
              : "Login to keep your scan activity available after refreshing the page."}
          </p>

          {!currentUser ? (
            <div className="settings-actions">

              <button
                className="settings-action primary"
                onClick={() =>
                  navigate("/login")
                }
              >
                <span className="action-icon">
                  ⇥
                </span>

                <div>
                  <strong>
                    Login
                  </strong>

                  <small>
                    Sign in to your account
                  </small>
                </div>

                <b>→</b>
              </button>

              <button
                className="settings-action"
                onClick={() =>
                  navigate("/signup")
                }
              >
                <span className="action-icon">
                  +
                </span>

                <div>
                  <strong>
                    Create Account
                  </strong>

                  <small>
                    Register a new account
                  </small>
                </div>

                <b>→</b>
              </button>

            </div>
          ) : (
            <div className="settings-actions">

              <button
                className="settings-action logout"
                onClick={handleLogout}
              >
                <span className="action-icon">
                  ⇥
                </span>

                <div>
                  <strong>
                    Logout
                  </strong>

                  <small>
                    End your current session
                  </small>
                </div>

                <b>→</b>
              </button>

            </div>
          )}
        </div>

        <div className="panel settings-info">

          <span className="eyebrow">
            ACTIVITY STORAGE
          </span>

          <h2>
            Scan History
          </h2>

          <div className="settings-info-row">
            <span>
              Guest
            </span>

            <strong>
              Temporary
            </strong>
          </div>

          <div className="settings-info-row">
            <span>
              Logged in
            </span>

            <strong>
              Saved
            </strong>
          </div>

          <div className="settings-info-row">
            <span>
              Password
            </span>

            <strong>
              Never stored
            </strong>
          </div>

          <p>
            Guest scans are not stored in the
            CyberShield database. Logged-in users
            can access their own scan history after
            refreshing the application.
          </p>
        </div>
      </div>
    </>
  );

  const placeholder = (
    <div className="empty-module">

      <div className="empty-icon">
        {
          menuItems.find(
            item => item.id === active
          )?.icon
        }
      </div>

      <span className="eyebrow">
        CYBERSHIELD MODULE
      </span>

      <h1>
        {
          menuItems.find(
            item => item.id === active
          )?.label
        }
      </h1>

      <p>
        This security module is ready
        for integration.
      </p>

      <div className="coming-soon">
        MODULE IN DEVELOPMENT
      </div>
    </div>
  );

  const renderPage = () => {
    if (active === "dashboard") {
      return dashboard;
    }

    if (active === "url") {
      return urlScanner;
    }

    if (active === "email") {
      return emailScanner;
    }

    if (active === "file") {
      return fileScanner;
    }

    if (active === "password") {
      return passwordChecker;
    }

    if (active === "privacy") {
      return privacyAnalyzer;
    }

    if (active === "threat") {
      return threatIntelligence;
    }

    if (active === "reports") {
      return reportsPage;
    }

    const systemMonitor = (
        <div className="system-page">
          <div className="system-header">
            <div>
              <div className="system-eyebrow">
                SYSTEM SECURITY
              </div>

              <h1>System Monitor</h1>

              <p>
                Monitor your Windows security protection status in real time.
              </p>
            </div>

            <button
              className="system-refresh-button"
              onClick={fetchSystemStatus}
              disabled={systemLoading}
            >
              {systemLoading ? "Checking..." : "Refresh Status"}
            </button>
          </div>

          {!systemStatus ? (
            <div className="system-start-card">
              <div className="system-start-icon">⌘</div>

              <h2>Check System Protection</h2>

              <p>
                CyberShield will check Windows Defender and Firewall
                protection status on this device.
              </p>

              <button
                className="system-check-button"
                onClick={fetchSystemStatus}
                disabled={systemLoading}
              >
                {systemLoading ? "Checking System..." : "Check System"}
              </button>
            </div>
          ) : (
            <>
              {systemStatus?.status === "protected" ? (
                <div className="system-protection-banner protected">
                  <div className="system-protection-icon">
                    ✓
                  </div>

                  <div className="system-protection-content">
                    <span>SECURITY STATUS</span>
                    <h2>System Protected</h2>
                    <p>
                      Windows security protections are active.
                    </p>
                  </div>

                  <div className="system-score">
                    <strong>
                      {systemStatus.protection_score}%
                    </strong>
                    <span>Protection</span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={fetchSystemStatus}
                >
                  {systemLoading ? "Checking..." : "Check System"}
                </button>
              )}

              <div className="system-security-grid">
                <div className="system-security-card">
                  <div className="system-card-top">
                    <div className="system-card-icon defender">
                      🛡
                    </div>

                    <span
                      className={
                        systemStatus.defender?.real_time_protection
                          ? "system-status-badge active"
                          : "system-status-badge inactive"
                      }
                    >
                      {systemStatus.defender?.real_time_protection
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <h3>Windows Defender</h3>

                  <p>
                    Microsoft Defender Antivirus protection
                  </p>

                  <div className="system-check-list">
                    <div>
                      <span>Antivirus</span>
                      <strong>
                        {systemStatus.defender?.antivirus_enabled
                          ? "Enabled"
                          : "Disabled"}
                      </strong>
                    </div>

                    <div>
                      <span>Real-time Protection</span>
                      <strong>
                        {systemStatus.defender?.real_time_protection
                          ? "Enabled"
                          : "Disabled"}
                      </strong>
                    </div>

                    <div>
                      <span>On-access Protection</span>
                      <strong>
                        {systemStatus.defender?.on_access_protection
                          ? "Enabled"
                          : "Disabled"}
                      </strong>
                    </div>

                    <div>
                      <span>Behavior Monitor</span>
                      <strong>
                        {systemStatus.defender?.behavior_monitor
                          ? "Enabled"
                          : "Disabled"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="system-security-card">
                  <div className="system-card-top">
                    <div className="system-card-icon firewall">
                      ◈
                    </div>

                    <span
                      className={
                        systemStatus.firewall?.enabled
                          ? "system-status-badge active"
                          : "system-status-badge inactive"
                      }
                    >
                      {systemStatus.firewall?.enabled
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  <h3>Windows Firewall</h3>

                  <p>
                    Network firewall protection
                  </p>

                  <div className="system-check-list">
                    {systemStatus.firewall?.profiles?.map(profile => (
                      <div key={profile.name}>
                        <span>{profile.name} Profile</span>

                        <strong>
                          {profile.enabled
                            ? "Enabled"
                            : "Disabled"}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="system-info-card">
                <div>
                  <span>Protection Engine</span>
                  <strong>
                    {systemStatus.defender?.service_enabled
                      ? "Running"
                      : "Stopped"}
                  </strong>
                </div>

                <div>
                  <span>IOAV Protection</span>
                  <strong>
                    {systemStatus.defender?.ioav_protection
                      ? "Enabled"
                      : "Disabled"}
                  </strong>
                </div>

                <div>
                  <span>Network Inspection</span>
                  <strong>
                    {systemStatus.defender?.nis_protection
                      ? "Enabled"
                      : "Disabled"}
                  </strong>
                </div>

                <div>
                  <span>Last Signature Update</span>
                  <strong>
                    {systemStatus.defender?.signature_last_updated
                      ? new Date(
                          systemStatus.defender.signature_last_updated
                        ).toLocaleString()
                      : "Unavailable"}
                  </strong>
                </div>
              </div>
            </>
          )}
        </div>
      );

    if (active === "system") {
      return systemMonitor;
    }

    if (active === "settings") {
      return settingsPage;
    }

    return placeholder;
  };

  return (
    <div
      className={`app ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >

      {mobileSidebarOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        id="app-sidebar"
        className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${
          mobileSidebarOpen ? "mobile-open" : ""
        }`}
      >

        <div className="brand">

          <div className="brand-mark">
            <span>⬡</span>
          </div>

          <div>
            <strong>
              CyberShield
            </strong>

            <small>
              AI SECURITY
            </small>
          </div>

          <button
            className="sidebar-toggle"
            type="button"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!sidebarCollapsed}
            aria-controls="app-sidebar"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed(collapsed => !collapsed)}
          >
            {sidebarCollapsed ? "›" : "‹"}
          </button>

        </div>

        <div className="sidebar-section">

          <span className="sidebar-label">
            MAIN MENU
          </span>

          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${
                active === item.id
                  ? "active"
                  : ""
              }`}
              aria-label={item.label}
              title={item.label}
              onClick={() => {
                setActive(item.id);
                setMobileSidebarOpen(false);
              }}
            >
              <span className="nav-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>

              {active === item.id && (
                <span className="nav-arrow">
                  ›
                </span>
              )}
            </button>
          ))}

        </div>

        <div className="sidebar-bottom">

          <div className="security-mini" title="System Protected">

            <div className="mini-shield">
              ⬡
            </div>

            <div>
              <strong>
                System Protected
              </strong>

              <span>
                All systems operational
              </span>
            </div>

            <i />
          </div>

          <button
            className="settings-button"
            type="button"
            aria-label="Settings"
            title="Settings"
            onClick={() => {
              setActive("settings");
              setMobileSidebarOpen(false);
            }}
          >
            ⚙
            <span>
              Settings
            </span>
          </button>

          <div
            className="user-card"
            title={`${displayName} - ${displayEmail}`}
          >

            <div className="avatar">
              {avatarText}
            </div>

            <div>
              <strong>
                {displayName}
              </strong>

              <span>
                {displayEmail}
              </span>
            </div>

          </div>

        </div>
      </aside>

      <main className="main">

        <header className="topbar">

          <button
            className="mobile-menu-button"
            type="button"
            aria-label={mobileSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileSidebarOpen}
            aria-controls="app-sidebar"
            title={mobileSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMobileSidebarOpen(open => !open)}
          >
            ☰
          </button>

          <div className="mobile-brand">
            <span>⬡</span>
            CyberShield
          </div>

          <div className="topbar-status">
            <span className="status-dot" />
            Security systems operational
          </div>

          <div className="topbar-actions">

            <button title="Notifications">
              ♢
            </button>

            <button
              title="Settings"
              onClick={() =>
                setActive("settings")
              }
            >
              ⚙
            </button>

          </div>
        </header>

        <section className="content">
          {renderPage()}
        </section>

      </main>
    </div>
  );
}

function ScanTable({
  scans,
  statusClass,
  formatDate
}) {
  if (!scans.length) {
    return (
      <div className="no-scans">

        <span>⌁</span>

        <strong>
          No scans yet
        </strong>

        <p>
          Start a URL, email, file or password
          check and your activity will appear here.
        </p>

      </div>
    );
  }

  return (
    <div className="table-wrapper">

      <table>

        <thead>
          <tr>
            <th>TYPE</th>
            <th>TARGET</th>
            <th>STATUS</th>
            <th>RISK</th>
            <th>DATE</th>
          </tr>
        </thead>

        <tbody>

          {scans.map(scan => (
            <tr key={scan.id}>

              <td>

                <span className="type-badge">

                  {scan.scan_type === "url"
                    ? "↗"
                    : scan.scan_type ===
                      "email"
                    ? "✉"
                    : scan.scan_type ===
                      "password"
                    ? "◉"
                    : "▣"}

                  {scan.scan_type}
                </span>

              </td>

              <td className="target-cell">
                {scan.target}
              </td>

              <td>

                <span
                  className={`status-badge ${statusClass(
                    scan.status
                  )}`}
                >
                  <i />
                  {scan.status}
                </span>

              </td>

              <td>

                <strong className="risk-number">
                  {scan.risk_score}
                </strong>

                <span className="risk-max">
                  /100
                </span>

              </td>

              <td className="date-cell">
                {formatDate(
                  scan.created_at
                )}
              </td>

            </tr>
          ))}

        </tbody>
      </table>

    </div>
  );
}

export default App;