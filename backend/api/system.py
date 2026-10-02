import subprocess
import json
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/api/system",
    tags=["System Monitor"]
)


def run_powershell(command):
    try:
        result = subprocess.run(
            [
                "powershell.exe",
                "-NoProfile",
                "-NonInteractive",
                "-ExecutionPolicy",
                "Bypass",
                "-Command",
                command
            ],
            capture_output=True,
            text=True,
            timeout=15
        )

        if result.returncode != 0:
            return None

        return result.stdout.strip()

    except Exception:
        return None


@router.get("/status")
def system_status():
    defender_command = """
    Get-MpComputerStatus |
    Select-Object AMServiceEnabled,
    AntispywareEnabled,
    AntivirusEnabled,
    BehaviorMonitorEnabled,
    IoavProtectionEnabled,
    RealTimeProtectionEnabled,
    OnAccessProtectionEnabled,
    AntivirusSignatureLastUpdated,
    QuickScanAge,
    FullScanAge,
    NISProtectionEnabled |
    ConvertTo-Json -Compress
    """

    firewall_command = """
    Get-NetFirewallProfile |
    Select-Object Name, Enabled |
    ConvertTo-Json -Compress
    """

    defender_output = run_powershell(defender_command)
    firewall_output = run_powershell(firewall_command)

    defender = {}
    firewall = []

    if defender_output:
        try:
            defender = json.loads(defender_output)
        except Exception:
            defender = {}

    if firewall_output:
        try:
            firewall = json.loads(firewall_output)

            if isinstance(firewall, dict):
                firewall = [firewall]

        except Exception:
            firewall = []

    defender_active = all([
        defender.get("AMServiceEnabled") is True,
        defender.get("AntivirusEnabled") is True,
        defender.get("RealTimeProtectionEnabled") is True,
        defender.get("OnAccessProtectionEnabled") is True
    ])

    firewall_active = (
    len(firewall) > 0 and
    all(bool(profile.get("Enabled")) for profile in firewall)
)
    protection_checks = [
        defender.get("AMServiceEnabled") is True,
        defender.get("AntivirusEnabled") is True,
        defender.get("RealTimeProtectionEnabled") is True,
        defender.get("OnAccessProtectionEnabled") is True,
        firewall_active
    ]

    protected_count = sum(protection_checks)

    if protected_count == len(protection_checks):
        overall_status = "protected"
    elif protected_count >= 3:
        overall_status = "warning"
    else:
        overall_status = "at_risk"

    return {
        "status": overall_status,
        "system_protected": overall_status == "protected",
        "protection_score": round(
            (protected_count / len(protection_checks)) * 100
        ),
        "defender": {
            "service_enabled": defender.get("AMServiceEnabled", False),
            "antivirus_enabled": defender.get("AntivirusEnabled", False),
            "real_time_protection": defender.get(
                "RealTimeProtectionEnabled",
                False
            ),
            "on_access_protection": defender.get(
                "OnAccessProtectionEnabled",
                False
            ),
            "behavior_monitor": defender.get(
                "BehaviorMonitorEnabled",
                False
            ),
            "ioav_protection": defender.get(
                "IoavProtectionEnabled",
                False
            ),
            "nis_protection": defender.get(
                "NISProtectionEnabled",
                False
            ),
            "signature_last_updated": defender.get(
                "AntivirusSignatureLastUpdated"
            ),
            "quick_scan_age": defender.get("QuickScanAge"),
            "full_scan_age": defender.get("FullScanAge")
        },
        "firewall": {
            "enabled": firewall_active,
            "profiles": [
                {
                    "name": profile.get("Name"),
                    "enabled": bool(profile.get("Enabled", False))
                }
                for profile in firewall
            ]
        }
    }