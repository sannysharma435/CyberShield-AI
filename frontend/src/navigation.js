export const menuItems = [
  { id: "dashboard", icon: "dashboard", label: "Dashboard" },
  { id: "url", icon: "url", label: "URL Scanner", navLabel: "URL" },
  { id: "email", icon: "email", label: "Email Scanner", navLabel: "Email" },
  { id: "file", icon: "file", label: "File Scanner", navLabel: "File" },
  { id: "password", icon: "password", label: "Password Checker", navLabel: "Passwords" },
  { id: "privacy", icon: "privacy", label: "Privacy Analyzer", navLabel: "Privacy" },
  { id: "threat", icon: "threat", label: "Threat Intelligence", navLabel: "Threat intel" },
  { id: "system", icon: "system", label: "System Monitor", navLabel: "System monitor" },
  { id: "reports", icon: "reports", label: "Reports" }
];

export const menuGroups = [
  { label: "Overview", items: ["dashboard"] },
  { label: "Scanners", items: ["url", "email", "file"] },
  { label: "Tools", items: ["password", "privacy"] },
  { label: "Insights", items: ["threat", "system", "reports"] }
];
