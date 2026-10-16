import { useState, type ReactNode } from "react";
import { useApp } from "../appContext";
import { formatDate, formatTime } from "../data/dates";
import { jobBalance, jobStatus } from "../data/money";
import type { PaymentStep } from "../data/store";
import type { Job } from "../data/types";
import Avatar from "./Avatar";
import Icon from "./Icon";
import PaymentBadge, { StatusBadge } from "./PaymentBadge";

function Step({ index, title, done, children }: { index: number; title: string; done: boolean; children: ReactNode }) {
  return (
    <div className={done ? "payment-step done" : "payment-step"}>
      <span className="step-dot">{done ? <Icon name="check" size={13} /> : index}</span>
      <div className="step-body">
        <strong>{title}</strong>
        {children}
      </div>
    </div>
  );
}

function JobDrawer({ job, onClose }: { job: Job; onClose: () => void }) {
  const { isAdmin, store, money, client, worker, notify, openClient, editJob, removeJob, advanceJob } = useApp();
  const [quoteInput, setQuoteInput] = useState(job.quote.amount ? String(job.quote.amount) : "");
  const [depositInput, setDepositInput] = useState(job.deposit.amount ? String(job.deposit.amount) : "");
  const owner = client(job.clientId);
  const assignee = worker(job.workerId);
  const balance = jobBalance(job);

  function undo(step: PaymentStep, message: string) {
    store.undoPayment(job.id, step);
    notify(message);
  }

  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside className="drawer" role="dialog" aria-label={job.title} onMouseDown={(event) => event.stopPropagation()}>
        <header className="drawer-header">
          <div>
            <p className="eyebrow">{job.id}</p>
            <h2>{job.title}</h2>
            <div className="badge-row"><StatusBadge job={job} />{isAdmin && <PaymentBadge job={job} />}</div>
          </div>
          <button className="icon-button" aria-label="Close" onClick={onClose}><Icon name="close" size={16} /></button>
        </header>

        <div className="drawer-body">
          <dl className="detail-list">
            <div>
              <dt>Client</dt>
              <dd>{isAdmin && owner ? <button className="link-button" onClick={() => openClient(owner.id)}>{owner.name}</button> : (owner?.name ?? "Unknown client")}</dd>
            </div>
            <div><dt>Address</dt><dd>{job.address}</dd></div>
            <div><dt>When</dt><dd>{formatDate(job.date, { weekday: "short", month: "short", day: "numeric" })} · {formatTime(job.time)} · {job.duration} h</dd></div>
            <div><dt>Worker</dt><dd className="worker-cell"><Avatar worker={assignee} small />{assignee?.name ?? "Unassigned"}</dd></div>
            {job.notes && <div><dt>Notes</dt><dd>{job.notes}</dd></div>}
          </dl>

          <section className="drawer-section">
            <h3>Progress</h3>
            <button className="progress-button wide" onClick={() => advanceJob(job.id)} disabled={job.progress >= 100} title="Advance progress by 25%">
              <span className="progress-track"><span style={{ width: `${job.progress}%` }} /></span>
              <small>{jobStatus(job) === "Completed" ? "Complete" : `${job.progress}% · tap to advance`}</small>
            </button>
          </section>

          {isAdmin && (
            <section className="drawer-section">
              <h3>Client payment</h3>
              <Step index={1} title="Quote" done={Boolean(job.quote.sentAt)}>
                {job.quote.sentAt ? (
                  <p>Quoted {money(job.quote.amount)} on {formatDate(job.quote.sentAt)} <button className="inline-link" onClick={() => undo("quote", "Quote marked as not sent")}>Undo</button></p>
                ) : (
                  <form className="step-action" onSubmit={(event) => { event.preventDefault(); store.markQuoted(job.id, Number(quoteInput) || 0); notify(`Quote sent to ${owner?.name ?? "client"}`); }}>
                    <input type="number" min="0" step="0.01" required placeholder="Quote amount" aria-label="Quote amount" value={quoteInput} onChange={(event) => setQuoteInput(event.target.value)} />
                    <button className="secondary-button">Mark quote sent</button>
                  </form>
                )}
                {!job.quote.sentAt && <p className="muted">Not quoted yet</p>}
              </Step>
              <Step index={2} title="Deposit" done={Boolean(job.deposit.receivedAt)}>
                {job.deposit.receivedAt ? (
                  <p>Deposit of {money(job.deposit.amount)} received {formatDate(job.deposit.receivedAt)} <button className="inline-link" onClick={() => undo("deposit", "Deposit removed")}>Undo</button></p>
                ) : (
                  <form className="step-action" onSubmit={(event) => { event.preventDefault(); store.recordDeposit(job.id, Number(depositInput) || 0); notify("Deposit recorded"); }}>
                    <input type="number" min="0" step="0.01" required placeholder="Deposit amount" aria-label="Deposit amount" value={depositInput} onChange={(event) => setDepositInput(event.target.value)} />
                    <button className="secondary-button">Record deposit</button>
                  </form>
                )}
                {!job.deposit.receivedAt && <p className="muted">No deposit received</p>}
              </Step>
              <Step index={3} title="Paid in full" done={Boolean(job.paidAt)}>
                {job.paidAt ? (
                  <p>Client paid on {formatDate(job.paidAt)} <button className="inline-link" onClick={() => undo("paid", "Payment confirmation removed")}>Undo</button></p>
                ) : (
                  <>
                    <p>Balance due <strong>{money(job.quote.sentAt || job.deposit.receivedAt ? balance : job.quote.amount)}</strong></p>
                    <button className="primary-button" onClick={() => { store.markPaid(job.id); notify(`${owner?.name ?? "Client"} marked as paid`); }}><Icon name="check" size={15} />Confirm client paid</button>
                  </>
                )}
              </Step>
            </section>
          )}

          <section className="drawer-section">
            <h3>{isAdmin ? "Worker pay" : "Your pay"}</h3>
            <div className="pay-summary">
              <strong>{money(job.workerPay)}</strong>
              {job.workerPaidAt ? <span className="pay pay-paid">Paid {formatDate(job.workerPaidAt)}</span> : <span className="pay pay-quoted">Not paid yet</span>}
            </div>
            {isAdmin && (
              <button className="text-button" onClick={() => { store.setWorkerPaid(job.id, !job.workerPaidAt); notify(job.workerPaidAt ? "Worker payment undone" : `${assignee?.name ?? "Worker"} marked as paid`); }}>
                {job.workerPaidAt ? "Undo worker payment" : "Mark worker paid"}
              </button>
            )}
          </section>
        </div>

        {isAdmin && (
          <footer className="drawer-footer">
            <button className="secondary-button danger-text" onClick={() => removeJob(job.id)}><Icon name="trash" size={15} />Delete</button>
            <button className="primary-button" onClick={() => editJob(job.id)}><Icon name="edit" size={15} />Edit job</button>
          </footer>
        )}
      </aside>
    </div>
  );
}

export default JobDrawer;
