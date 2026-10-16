import type { Role, Worker } from "../data/types";
import Icon, { type IconName } from "./Icon";
import ProfileMenu from "./ProfileMenu";

export type NavItem = { label: string; icon: IconName; count?: number };

type Props = {
  items: NavItem[];
  active: string;
  role: Role;
  workers: Worker[];
  onSelect: (label: string) => void;
  onSwitchRole: (role: Role) => void;
  onSupport: () => void;
};

function Sidebar({ items, active, role, workers, onSelect, onSwitchRole, onSupport }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark"><Icon name="briefcase" size={19} /></span>
        <span>Work<span>Bench</span></span>
      </div>
      <nav className="main-nav" aria-label="Main navigation">
        {items.map((item) => (
          <button key={item.label} className={active === item.label ? "nav-item active" : "nav-item"} aria-label={item.label} title={item.label} aria-current={active === item.label ? "page" : undefined} onClick={() => onSelect(item.label)}>
            <Icon name={item.icon} /><span>{item.label}</span>
            {item.count ? <span className="nav-count">{item.count}</span> : null}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {role.kind === "admin" && (
          <button className={active === "Settings" ? "nav-item active" : "nav-item"} aria-label="Settings" title="Settings" onClick={() => onSelect("Settings")}><Icon name="settings" /><span>Settings</span></button>
        )}
        <div className="help-card">
          <span className="help-icon">?</span>
          <strong>Need a hand?</strong>
          <p>Visit the help center or reach our support team.</p>
          <button onClick={onSupport}>Get support</button>
        </div>
        <ProfileMenu role={role} workers={workers} onSwitch={onSwitchRole} onSettings={() => onSelect("Settings")} placement="up" />
      </div>
    </aside>
  );
}

export default Sidebar;
