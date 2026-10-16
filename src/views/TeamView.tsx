import { useApp } from "../appContext";
import Avatar from "../components/Avatar";
import Icon from "../components/Icon";
import { ClientLink } from "../components/JobCells";
import { addDays, formatDate, startOfWeek, todayISO } from "../data/dates";
import { jobStatus, workerPayOwed } from "../data/money";
import { plural } from "../data/text";

function TeamView({ onViewAs }: { onViewAs: (workerId: string) => void }) {
  const { store, worker, money, notify, openJob } = useApp();
  const { workers, jobs } = store.state;
  const weekStart = startOfWeek(todayISO());
  const weekEnd = addDays(weekStart, 6);
  const owed = jobs.filter((job) => jobStatus(job) === "Completed" && !job.workerPaidAt).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <div className="team-grid">
        {workers.map((person) => {
          const theirs = jobs.filter((job) => job.workerId === person.id);
          return (
            <article className="panel worker-card" key={person.id}>
              <div className="worker-card-head">
                <Avatar worker={person} />
                <span><strong>{person.name}</strong><small>{person.phone}</small></span>
              </div>
              <dl className="stat-list">
                <div><dt>This week</dt><dd>{plural(theirs.filter((job) => job.date >= weekStart && job.date <= weekEnd).length, "job")}</dd></div>
                <div><dt>Open jobs</dt><dd>{theirs.filter((job) => jobStatus(job) !== "Completed").length}</dd></div>
                <div><dt>Pay owed</dt><dd className={workerPayOwed(theirs) ? "owed" : ""}>{money(workerPayOwed(theirs))}</dd></div>
                <div><dt>Paid out</dt><dd>{money(theirs.filter((job) => job.workerPaidAt).reduce((sum, job) => sum + job.workerPay, 0))}</dd></div>
              </dl>
              <button className="text-button" onClick={() => onViewAs(person.id)}><Icon name="swap" size={14} />View as {person.name.split(" ")[0]}</button>
            </article>
          );
        })}
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Pay owed to workers</h2>
            <p>Completed jobs where the worker hasn't been paid yet.</p>
          </div>
          <strong className="owed">{money(workerPayOwed(jobs))}</strong>
        </div>
        <div className="job-table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Job</th><th>Client</th><th>Worker</th><th>Pay</th><th /></tr></thead>
            <tbody>
              {owed.map((job) => {
                const assignee = worker(job.workerId);
                return (
                  <tr key={job.id} className="clickable" onClick={() => openJob(job.id)}>
                    <td>{formatDate(job.date)}</td>
                    <td><strong>{job.title}</strong><small>{job.id}</small></td>
                    <td><ClientLink clientId={job.clientId} /></td>
                    <td><span className="worker-cell"><Avatar worker={assignee} small />{assignee?.name ?? "Unassigned"}</span></td>
                    <td><strong>{money(job.workerPay)}</strong></td>
                    <td>
                      <button className="secondary-button small" onClick={(event) => { event.stopPropagation(); store.setWorkerPaid(job.id, true); notify(`${assignee?.name ?? "Worker"} paid ${money(job.workerPay)}`); }}>
                        <Icon name="check" size={14} />Mark paid
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {owed.length === 0 && <div className="empty-state">Everyone is paid up.</div>}
        </div>
      </section>
    </>
  );
}

export default TeamView;
