import { useApp } from "../appContext";
import type { Job } from "../data/types";

export function ClientLink({ clientId }: { clientId: string }) {
  const { isAdmin, client, openClient } = useApp();
  const name = client(clientId)?.name ?? "Unknown client";
  if (!isAdmin) return <strong>{name}</strong>;
  return (
    <button className="link-button" onClick={(event) => { event.stopPropagation(); openClient(clientId); }}>
      {name}
    </button>
  );
}

export function ProgressButton({ job }: { job: Job }) {
  const { advanceJob } = useApp();
  return (
    <button className="progress-button" disabled={job.progress >= 100} onClick={(event) => { event.stopPropagation(); advanceJob(job.id); }} title="Advance progress">
      <span className="progress-track"><span style={{ width: `${job.progress}%` }} /></span>
      <small>{job.progress}%</small>
    </button>
  );
}
