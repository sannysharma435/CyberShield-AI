import { useRef, useState } from "react";
import "./PrivacyAnalyzer.css";

function PrivacyAnalyzer() {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = file => {
    if (!file) return;

    const maxSize = 25 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("File size must be less than 25 MB.");
      return;
    }

    setSelectedFile(file);
    setResult(null);
  };

  const handleInputChange = event => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = event => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    handleFile(file);
  };

  const analyzeFile = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);

    try {
      const user = JSON.parse(
        localStorage.getItem("cybershield_user") || "null"
      );

      const formData = new FormData();

      formData.append("file", selectedFile);

      const headers = {};

      if (user?.id) {
        headers["X-User-ID"] = user.id;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/api/privacy/analyze",
        {
          method: "POST",
          headers,
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("Privacy analysis failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);

      setResult({
        privacy_score: 0,
        risk_level: "unknown",
        issues_found: 0,
        findings: [],
        error:
          "Privacy analyzer backend is not connected yet."
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const resetAnalyzer = () => {
    setSelectedFile(null);
    setResult(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getRiskClass = level => {
    const value = String(level || "").toLowerCase();

    if (
      value.includes("high") ||
      value.includes("critical")
    ) {
      return "privacy-high";
    }

    if (
      value.includes("medium") ||
      value.includes("moderate")
    ) {
      return "privacy-medium";
    }

    if (value.includes("low") ||
      value.includes("safe")
    ) {
      return "privacy-low";
    }

    return "privacy-unknown";
  };

  const getRiskLabel = level => {
    const value = String(level || "").toLowerCase();

    if (value.includes("high")) return "HIGH RISK";
    if (value.includes("medium")) return "MODERATE RISK";
    if (value.includes("moderate")) return "MODERATE RISK";
    if (value.includes("low")) return "LOW RISK";
    if (value.includes("safe")) return "SAFE";

    return "NOT ANALYZED";
  };

  const formatBytes = bytes => {
    if (!bytes) return "0 Bytes";

    const sizes = [
      "Bytes",
      "KB",
      "MB",
      "GB"
    ];

    const index = Math.floor(
      Math.log(bytes) / Math.log(1024)
    );

    return `${(
      bytes /
      Math.pow(1024, index)
    ).toFixed(1)} ${sizes[index]}`;
  };

  const getFindingIcon = type => {
    const value = String(type || "").toLowerCase();

    if (value.includes("location")) return "⌖";
    if (value.includes("gps")) return "⌖";
    if (value.includes("email")) return "✉";
    if (value.includes("phone")) return "☎";
    if (value.includes("metadata")) return "◈";
    if (value.includes("exif")) return "◉";
    if (value.includes("author")) return "◌";
    if (value.includes("personal")) return "◎";

    return "!";
  };

  const score = result?.privacy_score ?? 0;

  const scoreClass =
    score >= 80
      ? "score-safe"
      : score >= 50
      ? "score-medium"
      : "score-high";

  return (
    <div className="privacy-page">

      <div className="privacy-page-header">
        <div>
          <div className="privacy-title-row">
            <div className="privacy-title-icon">
              ◈
            </div>

            <div>
              <h1>
                Privacy Analyzer
              </h1>

              <p>
                Detect exposed personal information,
                metadata and privacy risks in your files.
              </p>
            </div>
          </div>
        </div>

        {result && (
          <button
            className="privacy-reset-button"
            onClick={resetAnalyzer}
          >
            ↻ New Analysis
          </button>
        )}
      </div>

      {!result && (
        <>
          <div className="privacy-main-grid">

            <div className="privacy-upload-card">

              <div className="privacy-card-label">
                SECURE FILE ANALYSIS
              </div>

              <div
                className={`privacy-drop-zone ${
                  dragActive
                    ? "privacy-drag-active"
                    : ""
                } ${
                  selectedFile
                    ? "privacy-file-selected"
                    : ""
                }`}
                onDragOver={event => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() =>
                  setDragActive(false)
                }
                onDrop={handleDrop}
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="
                    image/jpeg,
                    image/png,
                    image/webp,
                    image/gif,
                    application/pdf,
                    text/plain,
                    application/msword,
                    application/vnd.openxmlformats-officedocument.wordprocessingml.document
                  "
                  onChange={handleInputChange}
                />

                {!selectedFile ? (
                  <>
                    <div className="privacy-upload-icon">
                      ↑
                    </div>

                    <h2>
                      Analyze Your File
                    </h2>

                    <p>
                      Drag & drop your file here
                    </p>

                    <span className="privacy-or">
                      or
                    </span>

                    <button
                      type="button"
                      className="privacy-browse-button"
                      onClick={event => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Browse Files
                    </button>

                    <div className="privacy-file-types">
                      JPG
                      <span>•</span>
                      PNG
                      <span>•</span>
                      WEBP
                      <span>•</span>
                      PDF
                      <span>•</span>
                      DOCX
                    </div>

                    <small>
                      Maximum file size: 25 MB
                    </small>
                  </>
                ) : (
                  <>
                    <div className="privacy-selected-icon">
                      ✓
                    </div>

                    <h2>
                      File Selected
                    </h2>

                    <div className="privacy-selected-name">
                      {selectedFile.name}
                    </div>

                    <div className="privacy-selected-size">
                      {formatBytes(
                        selectedFile.size
                      )}
                    </div>

                    <button
                      type="button"
                      className="privacy-change-button"
                      onClick={event => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Change File
                    </button>
                  </>
                )}

              </div>

              {selectedFile && (
                <button
                  className="privacy-analyze-button"
                  onClick={analyzeFile}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <>
                      <span className="privacy-spinner"></span>
                      Analyzing Privacy...
                    </>
                  ) : (
                    <>
                      Analyze Privacy
                      <b>→</b>
                    </>
                  )}
                </button>
              )}

            </div>

            <div className="privacy-info-card">

              <div className="privacy-card-label">
                WHAT WE CHECK
              </div>

              <h2>
                Protect your
                <span> private data.</span>
              </h2>

              <p>
                CyberShield checks your file for
                information that could accidentally
                expose your identity or location.
              </p>

              <div className="privacy-check-list">

                <div className="privacy-check">
                  <div>✓</div>
                  <span>
                    Personal Information
                  </span>
                </div>

                <div className="privacy-check">
                  <div>✓</div>
                  <span>
                    EXIF & Location Metadata
                  </span>
                </div>

                <div className="privacy-check">
                  <div>✓</div>
                  <span>
                    Document Metadata
                  </span>
                </div>

                <div className="privacy-check">
                  <div>✓</div>
                  <span>
                    Device Information
                  </span>
                </div>

              </div>

            </div>

          </div>

          <div className="privacy-feature-row">

            <div className="privacy-feature-card">
              <div className="privacy-feature-icon">
                ◎
              </div>

              <div>
                <strong>
                  PII Detection
                </strong>

                <span>
                  Find exposed personal information
                </span>
              </div>
            </div>

            <div className="privacy-feature-card">
              <div className="privacy-feature-icon">
                ⌖
              </div>

              <div>
                <strong>
                  Location Data
                </strong>

                <span>
                  Detect GPS and location metadata
                </span>
              </div>
            </div>

            <div className="privacy-feature-card">
              <div className="privacy-feature-icon">
                ◈
              </div>

              <div>
                <strong>
                  File Metadata
                </strong>

                <span>
                  Inspect hidden file information
                </span>
              </div>
            </div>

          </div>
        </>
      )}

      {result && (
        <div className="privacy-results">

          <div className="privacy-result-top">

            <div className="privacy-score-card">

              <div className="privacy-card-label">
                PRIVACY SCORE
              </div>

              <div
                className={`privacy-score-ring ${scoreClass}`}
              >
                <div className="privacy-score-inner">
                  <strong>
                    {score}
                  </strong>

                  <span>
                    / 100
                  </span>
                </div>
              </div>

              <div
                className={`privacy-risk-badge ${getRiskClass(
                  result.risk_level
                )}`}
              >
                {getRiskLabel(
                  result.risk_level
                )}
              </div>

              <p>
                {result.issues_found || 0} privacy
                issue
                {result.issues_found === 1
                  ? ""
                  : "s"} detected
              </p>

            </div>

            <div className="privacy-summary-card">

              <div className="privacy-card-label">
                ANALYSIS SUMMARY
              </div>

              <div className="privacy-summary-file">
                <div className="privacy-file-icon">
                  ◈
                </div>

                <div>
                  <strong>
                    {selectedFile?.name ||
                      result.filename ||
                      "Analyzed File"}
                  </strong>

                  <span>
                    Privacy analysis completed
                  </span>
                </div>
              </div>

              <div className="privacy-summary-grid">

                <div>
                  <span>
                    File Type
                  </span>

                  <strong>
                    {selectedFile?.type ||
                      result.content_type ||
                      "Unknown"}
                  </strong>
                </div>

                <div>
                  <span>
                    File Size
                  </span>

                  <strong>
                    {selectedFile
                      ? formatBytes(
                          selectedFile.size
                        )
                      : "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Issues
                  </span>

                  <strong>
                    {result.issues_found || 0}
                  </strong>
                </div>

                <div>
                  <span>
                    Status
                  </span>

                  <strong>
                    Analyzed
                  </strong>
                </div>

              </div>

            </div>

          </div>

          {result.error ? (
            <div className="privacy-backend-error">
              <span>!</span>

              <div>
                <strong>
                  Analyzer backend unavailable
                </strong>

                <p>
                  {result.error}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="privacy-findings-card">

                <div className="privacy-section-heading">
                  <div>
                    <span>
                      DETECTED PRIVACY INFORMATION
                    </span>

                    <h2>
                      Privacy Findings
                    </h2>
                  </div>

                  <div className="privacy-findings-count">
                    {result.issues_found || 0}
                  </div>
                </div>

                {result.findings?.length > 0 ? (
                  <div className="privacy-findings-list">

                    {result.findings.map(
                      (finding, index) => (
                        <div
                          className="privacy-finding"
                          key={index}
                        >

                          <div className="privacy-finding-icon">
                            {getFindingIcon(
                              finding.type
                            )}
                          </div>

                          <div className="privacy-finding-content">

                            <strong>
                              {finding.type ||
                                "Privacy Finding"}
                            </strong>

                            <p>
                              {finding.message ||
                                "Sensitive information detected."}
                            </p>

                          </div>

                          <div
                            className={`privacy-severity ${getRiskClass(
                              finding.severity
                            )}`}
                          >
                            {String(
                              finding.severity ||
                                "unknown"
                            ).toUpperCase()}
                          </div>

                        </div>
                      )
                    )}

                  </div>
                ) : (
                  <div className="privacy-clean-state">

                    <div>
                      ✓
                    </div>

                    <strong>
                      No privacy issues detected
                    </strong>

                    <p>
                      No exposed sensitive information
                      was found during this analysis.
                    </p>

                  </div>
                )}

              </div>

              <div className="privacy-actions-card">

                <div>
                  <span className="privacy-card-label">
                    RECOMMENDED ACTIONS
                  </span>

                  <h2>
                    Keep your data private.
                  </h2>

                  <p>
                    Review the detected information
                    before sharing this file publicly.
                  </p>
                </div>

                <div className="privacy-actions">

                  <button
                    className="privacy-secondary-button"
                    onClick={resetAnalyzer}
                  >
                    Analyze Another File
                  </button>

                  <button
                    className="privacy-primary-button"
                    onClick={() =>
                      alert(
                        "Privacy-safe file generation will be connected next."
                      )
                    }
                  >
                    Create Privacy-Safe Copy
                    <b>→</b>
                  </button>

                </div>

              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
}

export default PrivacyAnalyzer;