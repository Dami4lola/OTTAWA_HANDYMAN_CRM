import { useState } from "react";
import type { Role, Worker } from "../data/types";
import Avatar from "./Avatar";
import Icon from "./Icon";

type Props = {
  role: Role;
  workers: Worker[];
  onSwitch: (role: Role) => void;
  onSettings: () => void;
  placement: "up" | "down";
  compact?: boolean;
};

export const ADMIN_NAME = "Jordan Carter";

function ProfileMenu({ role, workers, onSwitch, onSettings, placement, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const current = role.kind === "worker" ? workers.find((person) => person.id === role.workerId) : undefined;

  function choose(next: Role) {
    setOpen(false);
    onSwitch(next);
  }

  return (
    <div className={`profile ${compact ? "profile-compact" : ""}`}>
      {current ? <Avatar worker={current} /> : <span className="profile-avatar">JC</span>}
      {!compact && <span><strong>{current?.name ?? ADMIN_NAME}</strong><small>{current ? "Worker view" : "Administrator"}</small></span>}
      <button className="profile-menu" aria-label="Switch role" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Icon name={compact ? "swap" : "dots"} />
      </button>
      {open && (
        <>
          <span className="menu-scrim" onClick={() => setOpen(false)} />
          <div className={`popover role-popover role-popover-${placement}`} role="menu">
            <p className="popover-label">View as</p>
            <button role="menuitem" className={role.kind === "admin" ? "current" : ""} onClick={() => choose({ kind: "admin" })}>
              <span className="profile-avatar tiny">JC</span>{ADMIN_NAME}<small>Admin</small>
            </button>
            {workers.map((person) => (
              <button role="menuitem" key={person.id} className={current?.id === person.id ? "current" : ""} onClick={() => choose({ kind: "worker", workerId: person.id })}>
                <Avatar worker={person} small />{person.name}<small>Worker</small>
              </button>
            ))}
            {role.kind === "admin" && (
              <>
                <hr />
                <button role="menuitem" onClick={() => { setOpen(false); onSettings(); }}><Icon name="settings" size={15} />Settings</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileMenu;
