from urllib.parse import urlparse
import ipaddress
import re

SUSPICIOUS_KEYWORDS = [
    "login",
    "verify",
    "verification",
    "secure",
    "account",
    "update",
    "confirm",
    "password",
    "bank",
    "wallet",
    "free",
    "claim",
    "reward"
]

SHORTENER_DOMAINS = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "is.gd",
    "cutt.ly",
    "shorturl.at"
]


def scan_url(url: str):
    original_url = url.strip()

    if not original_url:
        return {
            "status": "invalid",
            "risk_score": 100,
            "message": "URL is empty",
            "indicators": []
        }

    if not re.match(r"^https?://", original_url, re.IGNORECASE):
        normalized_url = "http://" + original_url
    else:
        normalized_url = original_url

    try:
        parsed = urlparse(normalized_url)
        domain = parsed.hostname

        if not domain:
            return {
                "url": original_url,
                "status": "invalid",
                "risk_score": 100,
                "message": "Invalid URL",
                "indicators": []
            }

        risk_score = 0
        indicators = []

        try:
            ipaddress.ip_address(domain)
            risk_score += 25
            indicators.append("URL uses an IP address")
        except ValueError:
            pass

        if "@" in normalized_url:
            risk_score += 30
            indicators.append("URL contains @ symbol")

        if len(normalized_url) > 100:
            risk_score += 10
            indicators.append("Unusually long URL")

        if domain.lower() in SHORTENER_DOMAINS:
            risk_score += 20
            indicators.append("URL shortener detected")

        if len(domain.split(".")) > 4:
            risk_score += 15
            indicators.append("Too many subdomains")

        matched_keywords = [
            keyword
            for keyword in SUSPICIOUS_KEYWORDS
            if keyword in normalized_url.lower()
        ]

        if matched_keywords:
            risk_score += min(len(matched_keywords) * 5, 25)
            indicators.append(
                "Suspicious keywords: " + ", ".join(matched_keywords)
            )

        if parsed.scheme.lower() != "https":
            risk_score += 10
            indicators.append("Connection is not HTTPS")

        risk_score = min(risk_score, 100)

        if risk_score >= 60:
            status = "malicious"
        elif risk_score >= 30:
            status = "suspicious"
        else:
            status = "safe"

        return {
            "url": original_url,
            "domain": domain,
            "status": status,
            "risk_score": risk_score,
            "indicators": indicators,
            "message": f"URL classified as {status}"
        }

    except Exception as error:
        return {
            "url": original_url,
            "status": "error",
            "risk_score": 100,
            "message": str(error),
            "indicators": []
        }