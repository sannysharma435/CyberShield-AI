import Icon from "./Icon";
import BrandMark from "./BrandMark";

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

const menuGroups = [
  { label: "Overview", items: ["dashboard"] },
  { label: "Scanners", items: ["url", "email", "file"] },
  { label: "Tools", items: ["password", "privacy"] },
  { label: "Insights", items: ["threat", "system", "reports"] }
];

function Sidebar({
  active,
  setActive,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  displayName,
  displayEmail,
  avatarText
}) {
  return (
    <aside
      id="app-sidebar"
      className={`sidebar ${collapsed ? "collapsed" : ""} ${
        mobileOpen ? "mobile-open" : ""
      }`}
    >
      <div className="brand">
        <div className="brand-mark">
          <BrandMark />
        </div>

        <div>
          <strong className="brand-wordmark">
            <span className="brand-word-cyber">Cyber</span>
            <span className="brand-word-shield">Shield</span>
          </strong>
          <small>AI SECURITY</small>
        </div>

        <button
          className="sidebar-toggle"
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls="app-sidebar"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggleCollapse}
        >
          <Icon
            name="chevron"
            size={16}
            className={collapsed ? "chevron-expanded" : "chevron-collapsed"}
          />
        </button>
      </div>

      <div className="sidebar-section">
        {menuGroups.map(group => (
          <div className="sidebar-nav-group" key={group.label}>
            <span className="sidebar-label">{group.label}</span>
            {group.items.map(id => {
              const item = menuItems.find(menuItem => menuItem.id === id);

              return (
                <button
                  key={item.id}
                  className={`nav-item ${active === item.id ? "active" : ""}`}
                  type="button"
                  aria-current={active === item.id ? "page" : undefined}
                  aria-label={item.label}
                  title={item.label}
                  onClick={() => {
                    setActive(item.id);
                    onCloseMobile();
                  }}
                >
                  <span className="nav-icon">
                    <Icon name={item.icon} />
                  </span>
                  <span>{item.navLabel || item.label}</span>
                  {active === item.id && (
                    <span className="nav-arrow">
                      <Icon name="chevron" size={14} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button
          className="settings-button"
          type="button"
          aria-label="Settings"
          title="Settings"
          aria-current={active === "settings" ? "page" : undefined}
          onClick={() => {
            setActive("settings");
            onCloseMobile();
          }}
        >
          <Icon name="settings" size={17} />
          <span>Settings</span>
        </button>

        <div className="user-card" title={`${displayName} - ${displayEmail}`}>
          <div className="avatar">{avatarText}</div>
          <div>
            <strong>{displayName}</strong>
            <span>{displayEmail}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
