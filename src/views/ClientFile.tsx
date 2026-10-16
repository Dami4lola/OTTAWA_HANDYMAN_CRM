import { useApp } from "../appContext";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import JobMenu from "../components/JobMenu";
import PaymentBadge, { StatusBadge } from "../components/PaymentBadge";
import { formatDate, formatTime } from "../data/dates";
import { clientTotals, jobBalance, jobStatus } from "../data/money";
import { initials, plural } from "../data/text";

type Props = { clientId: string; onBack: () => void; onEdit: () => void };

function ClientFile({ clientId, onBack, onEdit }: Props) {
  const { store, client, worker, money, notify, openJob, newJob } = useApp();
  const record = client(clientId);

  if (!record) {
    return (
      <section className="panel">
        <div className="empty-state">This client no longer exists. <button className="inline-link" onClick={onBack}>Back to clients</button></div>
      </section>
    );
  }

  const jobs = store.state.jobs.filter((job) => job.clientId === clientId).sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
  const totals = clientTotals(jobs);
  const completed = jobs.filter((job) => jobStatus(job) === "Completed").length;

  function remove() {
    if (jobs.length > 0) {
      notify("Delete or move this client's jobs first");
      return;
    }
    if (window.confirm(`Delete ${record!.name}? This can't be undone.`)) {
      store.deleteClient(clientId);
      notify("Client deleted");
      onBack();
    }
  }

  return (
    <>
      <button className="back-link" onClick={onBack}><Icon name="chevronLeft" size={16} />All clients</button>

      <section className="panel client-card">
        <span className="avatar avatar-client avatar-large">{initials(record.name)}</span>
        <div className="client-info">
          <p className="eyebrow">CLIENT FILE · SINCE {formatDate(record.createdAt, { month: "short", year: "numeric" }).toUpperCase()}</p>
          <h2>{record.name}</h2>
          <div className="contact-row">
            {record.phone && <a href={`tel:${record.phone}`}><Icon name="phone" size={14} />{record.phone}</a>}
            {record.email && <a href={`mailto:${record.email}`}><Icon name="mail" size={14} />{record.email}</a>}
            {record.address && <span><Icon name="pin" size={14} />{record.address}</span>}
          </div>
          {record.notes && <p className="client-notes">{record.notes}</p>}
        </div>
        <div className="client-actions">
          <button className="secondary-button" onClick={onEdit}><Icon name="edit" size={15} />Edit</button>
          <button className="secondary-button danger-text" onClick={remove} aria-label="Delete client"><Icon name="trash" size={15} /></button>
          <button className="primary-button" onClick={() => newJob(clientId)}><Icon name="plus" size={16} />Schedule job</button>
        </div>
      </section>

      <div className="metrics">
        <article className="metric-card"><span className="metric-icon blue"><Icon name="briefcase" /></span><span><small>Jobs</small><strong>{jobs.length}</strong></span><em>{completed} completed</em></article>
        <article className="metric-card"><span className="metric-icon orange"><Icon name="file" /></span><span><small>Quoted</small><strong>{money(totals.quoted)}</strong></span><em>{plural(jobs.filter((job) => job.quote.sentAt).length, "quote")} sent</em></article>
        <article className="metric-card"><span className="metric-icon green"><Icon name="check" /></span><span><small>Collected</small><strong>{money(totals.collected)}</strong></span><em className="positive">{plural(jobs.filter((job) => job.paidAt).length, "job")} paid in full</em></article>
        <article className="metric-card"><span className="metric-icon purple"><Icon name="dollar" /></span><span><small>Outstanding</small><strong>{money(totals.outstanding)}</strong></span><em>{plural(jobs.filter((job) => jobBalance(job) > 0).length, "job")} awaiting payment</em></article>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Job history</h2>
            <p>Every job for {record.name}, newest first.</p>
          </div>
        </div>
        <div className="job-table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Job</th><th>Worker</th><th>Status</th><th>Payment</th><th>Quote</th><th>Deposit</th><th>Balance</th><th /></tr></thead>
            <tbody>
              {jobs.map((job) => {
                const assignee = worker(job.workerId);
                return (
                  <tr key={job.id} className="clickable" onClick={() => openJob(job.id)}>
                    <td><strong>{formatDate(job.date, { month: "short", day: "numeric", year: "numeric" })}</strong><small>{formatTime(job.time)}</small></td>
                    <td><strong>{job.title}</strong><small>{job.id}</small></td>
                    <td><span className="worker-cell"><Avatar worker={assignee} small />{assignee?.name ?? "Unassigned"}</span></td>
                    <td><StatusBadge job={job} /></td>
                    <td><PaymentBadge job={job} /></td>
                    <td>{job.quote.sentAt ? money(job.quote.amount) : "—"}</td>
                    <td>{job.deposit.receivedAt ? money(job.deposit.amount) : "—"}</td>
                    <td><strong>{jobBalance(job) ? money(jobBalance(job)) : "—"}</strong></td>
                    <td><JobMenu job={job} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {jobs.length === 0 && <div className="empty-state">No jobs yet. <button className="inline-link" onClick={() => newJob(clientId)}>Schedule the first one</button></div>}
        </div>
      </section>
    </>
  );
}

export default ClientFile;
