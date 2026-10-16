import { useState } from "react";
import { useApp } from "../appContext";
import Icon from "../components/Icon";
import { ProgressButton } from "../components/JobCells";
import { StatusBadge } from "../components/PaymentBadge";
import { addDays, formatDate, formatTime, startOfWeek, todayISO } from "../data/dates";
import { jobStatus, workerPayOwed } from "../data/money";

type Filter = "Upcoming" | "Completed" | "All";

function MyJobsView() {
  const { visibleJobs, client, money, openJob, jobMatchesSearch, search } = useApp();
  const [filter, setFilter] = useState<Filter>("Upcoming");
  const weekStart = startOfWeek(todayISO());
  const weekEnd = addDays(weekStart, 6);

  const thisWeek = visibleJobs.filter((job) => job.date >= weekStart && job.date <= weekEnd);
  const earnedThisWeek = thisWeek.filter((job) => jobStatus(job) === "Completed").reduce((sum, job) => sum + job.workerPay, 0);
  const paidToDate = visibleJobs.filter((job) => job.workerPaidAt).reduce((sum, job) => sum + job.workerPay, 0);

  const rows = visibleJobs
    .filter((job) => jobMatchesSearch(job) && (filter === "All" || (filter === "Completed") === (jobStatus(job) === "Completed")))
    .sort((a, b) => {
      const order = `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);
      return filter === "Upcoming" ? order : -order;
    });

  return (
    <>
      <div className="metrics">
        <article className="metric-card"><span className="metric-icon blue"><Icon name="briefcase" /></span><span><small>Jobs this week</small><strong>{thisWeek.length}</strong></span><em>{thisWeek.filter((job) => jobStatus(job) !== "Completed").length} still to do</em></article>
        <article className="metric-card"><span className="metric-icon green"><Icon name="check" /></span><span><small>Earned this week</small><strong>{money(earnedThisWeek)}</strong></span><em className="positive">from completed jobs</em></article>
        <article className="metric-card"><span className="metric-icon orange"><Icon name="clock" /></span><span><small>Pay pending</small><strong>{money(workerPayOwed(visibleJobs))}</strong></span><em>completed, not yet paid</em></article>
        <article className="metric-card"><span className="metric-icon purple"><Icon name="dollar" /></span><span><small>Paid to you</small><strong>{money(paidToDate)}</strong></span><em>all time</em></article>
      </div>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>My jobs</h2>
            <p>Only your jobs and your pay are shown here.</p>
          </div>
          <div className="segmented">
            {(["Upcoming", "Completed", "All"] as Filter[]).map((option) => <button key={option} className={filter === option ? "selected" : ""} onClick={() => setFilter(option)}>{option}</button>)}
          </div>
        </div>
        <div className="job-table-wrap">
          <table>
            <thead><tr><th>Date</th><th>Job</th><th>Where</th><th>Status</th><th>Progress</th><th>Your pay</th></tr></thead>
            <tbody>
              {rows.map((job) => (
                <tr key={job.id} className="clickable" onClick={() => openJob(job.id)}>
                  <td><strong>{formatDate(job.date, { weekday: "short", month: "short", day: "numeric" })}</strong><small>{formatTime(job.time)} · {job.duration} h</small></td>
                  <td><strong>{job.title}</strong><small>{job.id}</small></td>
                  <td><strong>{client(job.clientId)?.name ?? "—"}</strong><small><Icon name="pin" size={12} />{job.address}</small></td>
                  <td><StatusBadge job={job} /></td>
                  <td><ProgressButton job={job} /></td>
                  <td>
                    <strong>{money(job.workerPay)}</strong>
                    <small>{job.workerPaidAt ? `✓ Paid to you ${formatDate(job.workerPaidAt)}` : jobStatus(job) === "Completed" ? "Pending payout" : "On completion"}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <div className="empty-state">{search ? `No jobs match “${search}”` : `No ${filter === "All" ? "" : filter.toLowerCase() + " "}jobs.`}</div>}
        </div>
      </section>
    </>
  );
}

export default MyJobsView;
