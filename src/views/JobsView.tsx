import { useState } from "react";
import { useApp } from "../appContext";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import { ClientLink } from "../components/JobCells";
import JobMenu from "../components/JobMenu";
import PaymentBadge, { StatusBadge, stageClass } from "../components/PaymentBadge";
import { formatDate, formatTime } from "../data/dates";
import { PAYMENT_STAGES, clientTotals, jobBalance, jobStatus, paymentStage } from "../data/money";
import type { Job, JobStatus, PaymentStage } from "../data/types";

type GroupBy = "None" | "Client" | "Worker" | "Status";
type SortBy = "date-desc" | "date-asc" | "client" | "balance";

const STATUS_ORDER: JobStatus[] = ["In progress", "Scheduled", "Completed"];

function JobsView() {
  const { store, visibleJobs, client, worker, money, openJob, openClient, newJob, jobMatchesSearch, search } = useApp();
  const [groupBy, setGroupBy] = useState<GroupBy>("Client");
  const [sortBy, setSortBy] = useState<SortBy>("date-desc");
  const [clientFilter, setClientFilter] = useState("");
  const [stages, setStages] = useState<PaymentStage[]>([]);
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const clientName = (job: Job) => client(job.clientId)?.name ?? "";
  const filtered = visibleJobs
    .filter((job) => jobMatchesSearch(job) && (!clientFilter || job.clientId === clientFilter) && (stages.length === 0 || stages.includes(paymentStage(job))))
    .sort((a, b) => {
      if (sortBy === "client") return clientName(a).localeCompare(clientName(b)) || b.date.localeCompare(a.date);
      if (sortBy === "balance") return jobBalance(b) - jobBalance(a);
      const order = `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
      return sortBy === "date-asc" ? order : -order;
    });

  const groups = new Map<string, { label: string; clientId?: string; jobs: Job[] }>();
  for (const job of filtered) {
    const key = groupBy === "Client" ? job.clientId : groupBy === "Worker" ? job.workerId : groupBy === "Status" ? jobStatus(job) : "all";
    const label = groupBy === "Client" ? clientName(job) || "Unknown client" : groupBy === "Worker" ? (worker(job.workerId)?.name ?? "Unassigned") : key;
    if (!groups.has(key)) groups.set(key, { label, clientId: groupBy === "Client" ? job.clientId : undefined, jobs: [] });
    groups.get(key)!.jobs.push(job);
  }
  const groupList = [...groups.entries()].sort(([keyA, a], [keyB, b]) =>
    groupBy === "Status" ? STATUS_ORDER.indexOf(keyA as JobStatus) - STATUS_ORDER.indexOf(keyB as JobStatus) : a.label.localeCompare(b.label),
  );

  const toggleStage = (stage: PaymentStage) => setStages((current) => (current.includes(stage) ? current.filter((item) => item !== stage) : [...current, stage]));
  const toggleGroup = (key: string) => setCollapsed((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>All jobs</h2>
          <p>{filtered.length} of {visibleJobs.length} jobs{search ? ` matching “${search}”` : ""}</p>
        </div>
        <button className="primary-button" onClick={() => newJob(clientFilter || undefined)}><Icon name="plus" size={16} />New job</button>
      </div>

      <div className="toolbar">
        <label>Group by
          <span className="segmented">
            {(["None", "Client", "Worker", "Status"] as GroupBy[]).map((option) => <button key={option} className={groupBy === option ? "selected" : ""} onClick={() => setGroupBy(option)}>{option}</button>)}
          </span>
        </label>
        <label>Sort
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortBy)}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="client">Client A–Z</option>
            <option value="balance">Balance owed</option>
          </select>
        </label>
        <label>Client
          <select value={clientFilter} onChange={(event) => setClientFilter(event.target.value)}>
            <option value="">All clients</option>
            {[...store.state.clients].sort((a, b) => a.name.localeCompare(b.name)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <div className="chip-row" aria-label="Filter by payment">
          {PAYMENT_STAGES.map((stage) => (
            <button key={stage} className={`chip ${stages.includes(stage) ? `${stageClass(stage)} selected` : ""}`} aria-pressed={stages.includes(stage)} onClick={() => toggleStage(stage)}>{stage}</button>
          ))}
          {(stages.length > 0 || clientFilter) && <button className="inline-link" onClick={() => { setStages([]); setClientFilter(""); }}>Clear</button>}
        </div>
      </div>

      <div className="job-table-wrap">
        <table>
          <thead>
            <tr><th>Job</th><th>Client</th><th>Date</th><th>Assigned to</th><th>Status</th><th>Payment</th><th>Quote</th><th>Balance</th><th /></tr>
          </thead>
          {groupList.map(([key, group]) => {
            const isCollapsed = collapsed.includes(key);
            return (
              <tbody key={key}>
                {groupBy !== "None" && (
                  <tr className="group-row">
                    <td colSpan={9}>
                      <button className="group-toggle" aria-expanded={!isCollapsed} onClick={() => toggleGroup(key)}>
                        <Icon name={isCollapsed ? "chevronRight" : "chevronDown"} size={14} />
                        <strong>{group.label}</strong>
                        <span>{group.jobs.length} {group.jobs.length === 1 ? "job" : "jobs"}</span>
                        <span>{money(clientTotals(group.jobs).outstanding)} outstanding</span>
                      </button>
                      {group.clientId && <button className="inline-link" onClick={() => openClient(group.clientId!)}>Open client file</button>}
                    </td>
                  </tr>
                )}
                {!isCollapsed && group.jobs.map((job) => {
                  const assignee = worker(job.workerId);
                  return (
                    <tr key={job.id} className="clickable" onClick={() => openJob(job.id)}>
                      <td><strong>{job.title}</strong><small>{job.id}</small></td>
                      <td><ClientLink clientId={job.clientId} /><small><Icon name="pin" size={12} />{job.address}</small></td>
                      <td><strong>{formatDate(job.date)}</strong><small>{formatTime(job.time)}</small></td>
                      <td><span className="worker-cell"><Avatar worker={assignee} />{assignee?.name ?? "Unassigned"}</span></td>
                      <td><StatusBadge job={job} /></td>
                      <td><PaymentBadge job={job} /></td>
                      <td>{job.quote.amount ? money(job.quote.amount) : "—"}</td>
                      <td><strong>{jobBalance(job) ? money(jobBalance(job)) : "—"}</strong></td>
                      <td><JobMenu job={job} /></td>
                    </tr>
                  );
                })}
              </tbody>
            );
          })}
        </table>
        {filtered.length === 0 && <div className="empty-state">No jobs match these filters.</div>}
      </div>
    </section>
  );
}

export default JobsView;
