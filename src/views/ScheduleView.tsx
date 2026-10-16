import { useApp } from "../appContext";
import Avatar from "../components/Avatar";
import Icon, { type IconName } from "../components/Icon";
import { ClientLink, ProgressButton } from "../components/JobCells";
import JobMenu from "../components/JobMenu";
import PaymentBadge, { StatusBadge } from "../components/PaymentBadge";
import WeekCalendar from "../components/WeekCalendar";
import { addDays, formatDate, formatTime, startOfWeek, todayISO } from "../data/dates";
import { clientTotals, jobStatus, workerPayOwed } from "../data/money";
import type { Job } from "../data/types";

type Metric = { label: string; value: string | number; note: string; icon: IconName; tone: string; positive?: boolean };

const byDateTime = (a: Job, b: Job) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);

function ScheduleView({ onViewAll }: { onViewAll: () => void }) {
  const { store, isAdmin, visibleJobs, worker, money, openJob, jobMatchesSearch, search } = useApp();
  const today = todayISO();
  const weekStart = startOfWeek(today);
  const weekEnd = addDays(weekStart, 6);

  const todays = visibleJobs.filter((job) => job.date === today);
  const upcoming = visibleJobs.filter((job) => jobStatus(job) === "Scheduled" && job.date >= today).sort(byDateTime);
  const next = upcoming[0];
  const completedThisWeek = visibleJobs.filter((job) => jobStatus(job) === "Completed" && job.date >= weekStart && job.date <= weekEnd);
  const onDuty = new Set(todays.map((job) => job.workerId)).size;

  const metrics: Metric[] = [
    { label: isAdmin ? "Today's jobs" : "My jobs today", value: todays.length, note: `${todays.filter((job) => jobStatus(job) === "In progress").length} in progress`, icon: "briefcase", tone: "blue" },
    { label: "Awaiting start", value: upcoming.length, note: next ? `Next: ${next.date === today ? "today" : formatDate(next.date)} at ${formatTime(next.time)}` : "Nothing queued", icon: "clock", tone: "orange" },
    { label: "Completed", value: completedThisWeek.length, note: "this week", icon: "check", tone: "green", positive: completedThisWeek.length > 0 },
    isAdmin
      ? { label: "Outstanding", value: money(clientTotals(store.state.jobs).outstanding), note: `${onDuty} of ${store.state.workers.length} workers on duty today`, icon: "dollar", tone: "purple" }
      : { label: "Pay pending", value: money(workerPayOwed(visibleJobs)), note: "for completed jobs", icon: "dollar", tone: "purple" },
  ];

  const active = visibleJobs.filter((job) => jobStatus(job) !== "Completed" && jobMatchesSearch(job)).sort(byDateTime);

  return (
    <>
      <div className="metrics">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span className={`metric-icon ${metric.tone}`}><Icon name={metric.icon} /></span>
            <span><small>{metric.label}</small><strong>{metric.value}</strong></span>
            <em className={metric.positive ? "positive" : ""}>{metric.note}</em>
          </article>
        ))}
      </div>

      <WeekCalendar jobs={visibleJobs} />

      <section className="panel jobs-panel">
        <div className="panel-header">
          <div>
            <h2>Active jobs</h2>
            <p>{isAdmin ? "Track current work and keep customers updated." : "Jobs assigned to you that are still open."}</p>
          </div>
          <button className="text-button" onClick={onViewAll}>View all jobs <Icon name="chevronRight" size={16} /></button>
        </div>
        <div className="job-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job</th><th>Client</th><th>Date</th>
                {isAdmin ? <><th>Assigned to</th><th>Status</th><th>Payment</th></> : <><th>Status</th><th>Your pay</th></>}
                <th>Progress</th><th />
              </tr>
            </thead>
            <tbody>
              {active.slice(0, 6).map((job) => {
                const assignee = worker(job.workerId);
                return (
                  <tr key={job.id} className="clickable" onClick={() => openJob(job.id)}>
                    <td><strong>{job.title}</strong><small>{job.id}</small></td>
                    <td><ClientLink clientId={job.clientId} /><small><Icon name="pin" size={12} />{job.address}</small></td>
                    <td><strong>{formatDate(job.date, { weekday: "short", month: "short", day: "numeric" })}</strong><small>{formatTime(job.time)}</small></td>
                    {isAdmin ? (
                      <>
                        <td><span className="worker-cell"><Avatar worker={assignee} />{assignee?.name ?? "Unassigned"}</span></td>
                        <td><StatusBadge job={job} /></td>
                        <td><PaymentBadge job={job} /></td>
                      </>
                    ) : (
                      <>
                        <td><StatusBadge job={job} /></td>
                        <td><strong>{money(job.workerPay)}</strong></td>
                      </>
                    )}
                    <td><ProgressButton job={job} /></td>
                    <td><JobMenu job={job} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {active.length === 0 && <div className="empty-state">{search ? `No open jobs match “${search}”` : "No open jobs. Nice work!"}</div>}
        </div>
      </section>
    </>
  );
}

export default ScheduleView;
