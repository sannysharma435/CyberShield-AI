import re

SUSPICIOUS_KEYWORDS = [
    "verify your account",
    "verify account",
    "confirm your account",
    "account suspended",
    "account locked",
    "urgent action",
    "immediately",
    "click here",
    "reset your password",
    "password expires",
    "security alert",
    "unusual activity",
    "winner",
    "claim your reward",
    "free gift",
    "limited time",
    "payment failed",
    "update your payment",
    "bank account",
    "credit card"
]

URGENT_WORDS = [
    "urgent",
    "immediately",
    "now",
    "warning",
    "alert",
    "final notice",
    "last chance"
]

URL_PATTERN = re.compile(
    r"https?://[^\s]+",
    re.IGNORECASE
)


def scan_email(email_text: str):
    text = email_text.strip()

    if not text:
        return {
            "status": "invalid",
            "risk_score": 100,
            "message": "Email content is empty",
            "indicators": []
        }

    lower_text = text.lower()
    risk_score = 0
    indicators = []

    matched_keywords = [
        keyword
        for keyword in SUSPICIOUS_KEYWORDS
        if keyword in lower_text
    ]

    if matched_keywords:
        risk_score += min(len(matched_keywords) * 8, 40)
        indicators.append(
            "Suspicious phrases: " + ", ".join(matched_keywords[:5])
        )

    matched_urgent = [
        word
        for word in URGENT_WORDS
        if re.search(r"\b" + re.escape(word) + r"\b", lower_text)
    ]

    if matched_urgent:
        risk_score += min(len(matched_urgent) * 5, 20)
        indicators.append(
            "Urgent language detected: " + ", ".join(matched_urgent)
        )

    urls = URL_PATTERN.findall(text)

    if urls:
        risk_score += min(len(urls) * 8, 24)
        indicators.append(
            f"{len(urls)} URL(s) detected in email"
        )

    if "password" in lower_text and (
        "click" in lower_text
        or "verify" in lower_text
        or "confirm" in lower_text
    ):
        risk_score += 15
        indicators.append(
            "Email requests password/account action"
        )

    if any(
        phrase in lower_text
        for phrase in [
            "send money",
            "transfer money",
            "send payment",
            "gift card",
            "wire transfer"
        ]
    ):
        risk_score += 20
        indicators.append(
            "Financial request detected"
        )

    if "@" in text:
        email_addresses = re.findall(
            r"[\w.+-]+@[\w-]+\.[\w.-]+",
            text
        )

        if len(email_addresses) > 3:
            risk_score += 5
            indicators.append(
                "Multiple email addresses detected"
            )

    risk_score = min(risk_score, 100)

    if risk_score >= 60:
        status = "malicious"
    elif risk_score >= 30:
        status = "suspicious"
    else:
        status = "safe"

    return {
        "status": status,
        "risk_score": risk_score,
        "message": f"Email classified as {status}",
        "indicators": indicators,
        "urls_detected": urls
    }