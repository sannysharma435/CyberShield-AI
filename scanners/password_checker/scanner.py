import re

COMMON_PASSWORDS = {
    "password",
    "password123",
    "123456",
    "12345678",
    "123456789",
    "qwerty",
    "qwerty123",
    "admin",
    "admin123",
    "welcome",
    "letmein",
    "iloveyou",
    "abc123"
}


def check_password(password: str):
    if not password:
        return {
            "status": "weak",
            "strength": "Very Weak",
            "score": 0,
            "message": "Password is empty",
            "indicators": ["Password is empty"]
        }

    score = 0
    indicators = []

    length = len(password)

    if length >= 16:
        score += 35
    elif length >= 12:
        score += 28
    elif length >= 8:
        score += 18
    elif length >= 6:
        score += 8
    else:
        indicators.append("Password is too short")

    if re.search(r"[a-z]", password):
        score += 10
    else:
        indicators.append("Missing lowercase letters")

    if re.search(r"[A-Z]", password):
        score += 10
    else:
        indicators.append("Missing uppercase letters")

    if re.search(r"\d", password):
        score += 10
    else:
        indicators.append("Missing numbers")

    if re.search(r"[^A-Za-z0-9]", password):
        score += 15
    else:
        indicators.append("Missing special characters")

    if password.lower() in COMMON_PASSWORDS:
        score = 5
        indicators.append("Commonly used password")

    if re.search(r"(.)\1\1", password):
        score -= 10
        indicators.append(
            "Repeated characters detected"
        )

    if re.search(
        r"(12345|23456|34567|45678|56789|qwerty)",
        password.lower()
    ):
        score -= 15
        indicators.append(
            "Predictable sequence detected"
        )

    score = max(0, min(score, 100))

    if score < 30:
        status = "weak"
        strength = "Very Weak"
    elif score < 55:
        status = "medium"
        strength = "Medium"
    elif score < 75:
        status = "strong"
        strength = "Strong"
    else:
        status = "very-strong"
        strength = "Very Strong"

    if not indicators:
        message = "Password follows strong security characteristics"
    else:
        message = "Password analysis completed"

    return {
        "status": status,
        "strength": strength,
        "score": score,
        "length": length,
        "message": message,
        "indicators": indicators
    }