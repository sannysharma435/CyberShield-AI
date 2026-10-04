import { useMemo, useState } from "react";
import "./ThreatIntelligence.css";

function detectType(value) {
  const input = value.trim();

  if (!input) return "Unknown";

  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(input)) {
    return "IPv4 Address";
  }

  if (/^[a-fA-F0-9]{32}$/.test(input)) {
    return "MD5 Hash";
  }

  if (/^[a-fA-F0-9]{40}$/.test(input)) {
    return "SHA-1 Hash";
  }

  if (/^[a-fA-F0-9]{64}$/.test(input)) {
    return "SHA-256 Hash";
  }

  if (/^https?:\/\//i.test(input)) {
    return "URL";
  }

  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input)) {
    return "Domain";
  }

  return "Unknown";
}

function getAnalysis(input, selectedType) {
  const type = selectedType === "Auto Detect"
    ? detectType(input)
    : selectedType;

  const value = input.toLowerCase();

  let score = 18;
  const indicators = [];
  const categories = [
    { name: "Phishing", level: "LOW", value: 18 },
    { name: "Malware", level: "LOW", value: 12 },
    { name: "Botnet", level: "LOW", value: 10 },
    { name: "Spam", level: "LOW", value: 15 },
    { name: "C2 / Exploit", level: "LOW", value: 8 }
  ];

  if (
    value.includes("login") ||
    value.includes("verify") ||
    value.includes("secure") ||
    value.includes("account") ||
    value.includes("update")
  ) {
    score += 28;
    indicators.push({
      type: "danger",
      text: "Contains keywords commonly associated with phishing activity"
    });
    categories[0] = {
      name: "Phishing",
      level: "HIGH",
      value: 78
    };
  }

  if (
    value.includes("malware") ||
    value.includes("payload") ||
    value.includes("exploit") ||
    value.includes("shell")
  ) {
    score += 32;
    indicators.push({
      type: "danger",
      text: "Suspicious malware or exploit-related pattern detected"
    });
    categories[1] = {
      name: "Malware",
      level: "HIGH",
      value: 82
    };
  }

  if (value.includes("@")) {
    score += 18;
    indicators.push({
      type: "warning",
      text: "Input contains an unusual @ pattern"
    });
  }

  if (input.length > 80) {
    score += 12;
    indicators.push({
      type: "warning",
      text: "Unusually long indicator detected"
    });
  }

  if (
    type === "URL" &&
    !value.startsWith("https://")
  ) {
    score += 15;
    indicators.push({
      type: "warning",
      text: "URL does not use HTTPS"
    });
  }

  if (
    type === "IPv4 Address" &&
    !(
      value === "8.8.8.8" ||
      value === "1.1.1.1" ||
      value === "127.0.0.1"
    )
  ) {
    score += 15;
    indicators.push({
      type: "info",
      text: "External IPv4 address requires reputation verification"
    });
  }

  if (
    type.includes("Hash")
  ) {
    indicators.push({
      type: "info",
      text: "Cryptographic hash detected; external reputation lookup is recommended"
    });
    score += 8;
  }

  score = Math.min(score, 100);

  if (score >= 70) {
    return {
      type,
      score,
      status: "HIGH RISK",
      reputation: "SUSPICIOUS",
      confidence: "HIGH",
      indicators,
      categories
    };
  }

  if (score >= 40) {
    return {
      type,
      score,
      status: "MEDIUM RISK",
      reputation: "SUSPICIOUS",
      confidence: "MEDIUM",
      indicators,
      categories
    };
  }

  return {
    type,
    score,
    status: "LOW RISK",
    reputation: "CLEAN",
    confidence: "LOW",
    indicators,
    categories
  };
}

function ThreatIntelligence() {
  const [input, setInput] = useState("");
  const [selectedType, setSelectedType] = useState("Auto Detect");
  const [analysis, setAnalysis] = useState(null);
  const [recentLookups, setRecentLookups] = useState([
    {
      value: "8.8.8.8",
      type: "IP",
      status: "HIGH",
      time: "2 minutes ago"
    },
    {
      value: "example.com",
      type: "Domain",
      status: "LOW",
      time: "12 minutes ago"
    },
    {
      value: "https://paypal.com",
      type: "URL",
      status: "MEDIUM",
      time: "1 hour ago"
    },
    {
      value: "a3f5d9e8c2b4...",
      type: "SHA-256",
      status: "HIGH",
      time: "3 hours ago"
    },
    {
      value: "1.1.1.1",
      type: "IP",
      status: "LOW",
      time: "5 hours ago"
    }
  ]);

  const typeButtons = [
    "Auto Detect",
    "IP Address",
    "Domain",
    "URL",
    "MD5",
    "SHA-1",
    "SHA-256"
  ];

  const handleAnalyze = () => {
    if (!input.trim()) return;

    const result = getAnalysis(input, selectedType);

    setAnalysis({
      ...result,
      input: input.trim()
    });

    setRecentLookups(previous => [
      {
        value: input.trim(),
        type:
          result.type === "IPv4 Address"
            ? "IP"
            : result.type.replace(" Hash", ""),
        status:
          result.score >= 70
            ? "HIGH"
            : result.score >= 40
              ? "MEDIUM"
              : "LOW",
        time: "Just now"
      },
      ...previous.filter(item => item.value !== input.trim())
    ].slice(0, 5));
  };

  const handleKeyDown = event => {
    if (event.key === "Enter") {
      handleAnalyze();
    }
  };

  const scoreColor = useMemo(() => {
    if (!analysis) return "low";

    if (analysis.score >= 70) return "high";
    if (analysis.score >= 40) return "medium";

    return "low";
  }, [analysis]);

  return (
    <div className="threat-page">

      <div className="threat-page-header">
        <div>
          <div className="threat-eyebrow">
            THREAT INTELLIGENCE
          </div>

          <h1>Global Threat Intelligence</h1>

          <p>
            Analyze IP addresses, domains, URLs, and file hashes
            for known threats using multiple intelligence sources.
          </p>
        </div>

        <div className="threat-mode-card">
          <div className="threat-mode-icon">
            ◉
          </div>

          <div>
            <strong>Real-time Threat Intelligence</strong>
            <span>Powered by multiple security databases</span>
          </div>

          <div className="demo-badge">
            DEMO MODE
          </div>
        </div>
      </div>

      <section className="threat-lookup-card">

        <div className="lookup-heading">
          <div className="lookup-icon">
            ⌕
          </div>

          <div>
            <h2>Threat Lookup</h2>
            <p>
              Enter an IP address, domain, URL or file hash to check
              its threat reputation.
            </p>
          </div>
        </div>

        <div className="lookup-input-row">

          <div className="lookup-input-wrapper">
            <span>↻</span>

            <input
              type="text"
              aria-label="Threat indicator to analyze"
              value={input}
              onChange={event => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 8.8.8.8, example.com, https://example.com, or file hash..."
            />

            {input && (
              <button
                type="button"
                aria-label="Clear threat indicator"
                onClick={() => {
                  setInput("");
                  setAnalysis(null);
                }}
                className="clear-threat-input"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="button"
            className="analyze-threat-button"
            onClick={handleAnalyze}
          >
            <span>⌕</span>
            Analyze
          </button>

        </div>

        <div className="threat-type-buttons">
          {typeButtons.map(type => (
            <button
              key={type}
              type="button"
              className={
                selectedType === type
                  ? "threat-type-button active"
                  : "threat-type-button"
              }
              aria-pressed={selectedType === type}
              onClick={() => setSelectedType(type)}
            >
              <span>
                {type === "Auto Detect" && "⚙"}
                {type === "IP Address" && "⌖"}
                {type === "Domain" && "◎"}
                {type === "URL" && "↗"}
                {type === "MD5" && "▣"}
                {type === "SHA-1" && "◈"}
                {type === "SHA-256" && "◈"}
              </span>

              {type}
            </button>
          ))}
        </div>

      </section>

      {analysis ? (
        <>
          <div className="threat-main-grid">

            <section className="threat-card score-card">

              <div className="card-title">
                <span className="card-title-icon danger">
                  ◉
                </span>
                <h3>Threat Score</h3>
              </div>

              <div className={`score-circle ${scoreColor}`}>
                <div className="score-value">
                  {analysis.score}
                </div>

                <div className="score-total">
                  / 100
                </div>

                <div className="score-status">
                  {analysis.status}
                </div>
              </div>

              <div className="score-meta-grid">

                <div className="score-meta">
                  <span className="meta-icon">
                    ⚑
                  </span>

                  <div>
                    <small>Reputation</small>
                    <strong>{analysis.reputation}</strong>
                  </div>
                </div>

                <div className="score-meta">
                  <span className="meta-icon">
                    ▥
                  </span>

                  <div>
                    <small>Confidence</small>
                    <strong>{analysis.confidence}</strong>
                  </div>
                </div>

              </div>

            </section>

            <section className="threat-card target-card">

              <div className="card-title">
                <span className="card-title-icon purple">
                  ♙
                </span>
                <h3>Target Information</h3>
              </div>

              <div className="target-list">

                <div>
                  <span>Input</span>
                  <strong>{analysis.input}</strong>
                </div>

                <div>
                  <span>Type</span>
                  <strong>{analysis.type}</strong>
                </div>

                <div>
                  <span>Organization</span>
                  <strong>Not available</strong>
                </div>

                <div>
                  <span>Country</span>
                  <strong>Not available</strong>
                </div>

                <div>
                  <span>First Seen</span>
                  <strong>Not available</strong>
                </div>

                <div>
                  <span>Last Seen</span>
                  <strong>Just now</strong>
                </div>

              </div>

            </section>

            <section className="threat-card categories-card">

              <div className="card-title">
                <span className="card-title-icon purple">
                  ▦
                </span>
                <h3>Threat Categories</h3>
              </div>

              <div className="category-list">

                {analysis.categories.map(category => (
                  <div
                    className="category-row"
                    key={category.name}
                  >
                    <div className="category-name">
                      <span className={`category-dot ${category.level.toLowerCase()}`}>
                        ●
                      </span>

                      {category.name}
                    </div>

                    <div className="category-bar">
                      <span
                        style={{
                          width: `${category.value}%`
                        }}
                      />
                    </div>

                    <span
                      className={`category-level ${category.level.toLowerCase()}`}
                    >
                      {category.level}
                    </span>
                  </div>
                ))}

              </div>

            </section>

          </div>

          <div className="threat-bottom-grid">

            <section className="threat-card indicators-card">

              <div className="card-title">
                <span className="card-title-icon red">
                  ⚠
                </span>
                <h3>Threat Indicators</h3>
              </div>

              <div className="indicator-list">

                {analysis.indicators.length > 0 ? (
                  analysis.indicators.map((indicator, index) => (
                    <div
                      className={`indicator-item ${indicator.type}`}
                      key={index}
                    >
                      <span>
                        {indicator.type === "danger" && "▲"}
                        {indicator.type === "warning" && "●"}
                        {indicator.type === "info" && "●"}
                      </span>

                      <p>{indicator.text}</p>
                    </div>
                  ))
                ) : (
                  <div className="indicator-item safe">
                    <span>✓</span>
                    <p>
                      No suspicious patterns detected by the local
                      analysis engine.
                    </p>
                  </div>
                )}

                <div className="indicator-item safe">
                  <span>✓</span>
                  <p>
                    No confirmed ransomware association in local analysis.
                  </p>
                </div>

              </div>

            </section>

            <section className="threat-card sources-card">

              <div className="card-title">
                <span className="card-title-icon purple">
                  ◉
                </span>

                <h3>Intelligence Sources (Demo)</h3>
              </div>

              <div className="source-list">

                <div className="source-row">
                  <span className="source-logo vt">V</span>
                  <strong>VirusTotal</strong>
                  <span className="source-status neutral">
                    Not Connected
                  </span>
                </div>

                <div className="source-row">
                  <span className="source-logo abuse">⊘</span>
                  <strong>AbuseIPDB</strong>
                  <span className="source-status neutral">
                    Not Connected
                  </span>
                </div>

                <div className="source-row">
                  <span className="source-logo urlhaus">U</span>
                  <strong>URLhaus</strong>
                  <span className="source-status neutral">
                    Not Connected
                  </span>
                </div>

                <div className="source-row">
                  <span className="source-logo otx">◉</span>
                  <strong>AlienVault OTX</strong>
                  <span className="source-status neutral">
                    Not Connected
                  </span>
                </div>

                <div className="source-row">
                  <span className="source-logo threatfox">◆</span>
                  <strong>ThreatFox</strong>
                  <span className="source-status neutral">
                    Not Connected
                  </span>
                </div>

              </div>

              <div className="demo-source-note">
                ⓘ This is demo data for presentation. Connect real APIs
                for live threat intelligence results.
              </div>

            </section>

            <section className="threat-card recent-card">

              <div className="recent-header">
                <div className="card-title">
                  <span className="card-title-icon purple">
                    ◷
                  </span>

                  <h3>Recent Lookups</h3>
                </div>

                <button type="button">
                  View All →
                </button>
              </div>

              <div className="recent-list">

                {recentLookups.map((item, index) => (
                  <div
                    className="recent-row"
                    key={`${item.value}-${index}`}
                  >
                    <span className="recent-type">
                      {item.type === "IP" && "◉"}
                      {item.type === "Domain" && "◎"}
                      {item.type === "URL" && "↗"}
                      {item.type === "SHA-256" && "◈"}
                    </span>

                    <div className="recent-value">
                      <strong>{item.value}</strong>
                      <small>{item.time}</small>
                    </div>

                    <span
                      className={`recent-status ${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}

              </div>

            </section>

          </div>

        </>
      ) : (
        <div className="threat-empty-state">

          <div className="empty-threat-icon">
            ⌕
          </div>

          <h2>Ready to Analyze</h2>

          <p>
            Enter an IP address, domain, URL or file hash above
            to start a threat intelligence lookup.
          </p>

          <div className="empty-example-list">
            <span>8.8.8.8</span>
            <span>example.com</span>
            <span>https://example.com</span>
            <span>SHA-256 hash</span>
          </div>

        </div>
      )}

    </div>
  );
}

export default ThreatIntelligence;