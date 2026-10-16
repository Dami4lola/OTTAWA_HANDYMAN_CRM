import type { Worker } from "../data/types";

function Avatar({ worker, small = false }: { worker?: Worker; small?: boolean }) {
  if (!worker) return <span className={`avatar avatar-none ${small ? "avatar-small" : ""}`}>?</span>;
  return <span className={`avatar avatar-${worker.color} ${small ? "avatar-small" : ""}`}>{worker.initials}</span>;
}

export default Avatar;
