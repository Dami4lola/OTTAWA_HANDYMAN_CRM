import { useState } from "react";
import { todayISO } from "../data/dates";
import type { ClientInput, JobInput } from "../data/store";
import type { Client, Job, Worker } from "../data/types";
import ClientForm from "./ClientForm";
import Icon from "./Icon";

type Props = {
  job?: Job;
  presetClientId?: string;
  clients: Client[];
  workers: Worker[];
  onSave: (input: JobInput) => void;
  onCreateClient: (input: ClientInput) => string;
  onCancel: () => void;
};

type FormState = Omit<JobInput, "duration" | "workerPay" | "quoteAmount"> & { duration: string; workerPay: string; quoteAmount: string };

function JobForm({ job, presetClientId, clients, workers, onSave, onCreateClient, onCancel }: Props) {
  const initialClient = clients.find((client) => client.id === (job?.clientId ?? presetClientId));
  const [form, setForm] = useState<FormState>({
    title: job?.title ?? "",
    clientId: initialClient?.id ?? "",
    address: job?.address ?? initialClient?.address ?? "",
    date: job?.date ?? todayISO(),
    time: job?.time ?? "09:00",
    duration: String(job?.duration ?? 2),
    workerId: job?.workerId ?? workers[0]?.id ?? "",
    workerPay: job ? String(job.workerPay) : "",
    quoteAmount: job ? String(job.quote.amount) : "",
    notes: job?.notes ?? "",
  });
  const [addingClient, setAddingClient] = useState(false);

  const set = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const field = (key: keyof FormState) => ({ value: form[key], onChange: (event: { target: { value: string } }) => set(key, event.target.value) });

  function chooseClient(clientId: string) {
    const client = clients.find((item) => item.id === clientId);
    setForm((current) => ({ ...current, clientId, address: client?.address || current.address }));
  }

  return (
    <>
      <div className="modal-backdrop" onMouseDown={onCancel}>
        <form
          className="modal"
          onMouseDown={(event) => event.stopPropagation()}
          onSubmit={(event) => {
            event.preventDefault();
            onSave({
              ...form,
              title: form.title.trim(),
              duration: Math.max(0.5, Number(form.duration) || 1),
              workerPay: Number(form.workerPay) || 0,
              quoteAmount: Number(form.quoteAmount) || 0,
            });
          }}
        >
          <div className="modal-heading">
            <div>
              <p className="eyebrow">{job ? job.id : "NEW WORK ORDER"}</p>
              <h2>{job ? "Edit job" : "Schedule a job"}</h2>
            </div>
            <button type="button" aria-label="Close" onClick={onCancel}>×</button>
          </div>
          <label>Job title<input required autoFocus placeholder="e.g. Install bathroom vanity" {...field("title")} /></label>
          <div className="form-row">
            <label>
              <span className="label-row">Client<button type="button" className="inline-link" onClick={() => setAddingClient(true)}>+ New client</button></span>
              <select required value={form.clientId} onChange={(event) => chooseClient(event.target.value)}>
                <option value="" disabled>Select a client</option>
                {[...clients].sort((a, b) => a.name.localeCompare(b.name)).map((client) => <option value={client.id} key={client.id}>{client.name}</option>)}
              </select>
            </label>
            <label>Assigned worker<select {...field("workerId")}>{workers.map((person) => <option value={person.id} key={person.id}>{person.name}</option>)}</select></label>
          </div>
          <label>Job address<input required placeholder="Street address" {...field("address")} /></label>
          <div className="form-row form-row-3">
            <label>Date<input required type="date" {...field("date")} /></label>
            <label>Start time<input required type="time" {...field("time")} /></label>
            <label>Hours<input required type="number" min="0.5" step="0.5" {...field("duration")} /></label>
          </div>
          <div className="form-row">
            <label>Quote to client<input type="number" min="0" step="0.01" placeholder="0" {...field("quoteAmount")} /></label>
            <label>Worker pay<input type="number" min="0" step="0.01" placeholder="0" {...field("workerPay")} /></label>
          </div>
          <label>Notes<textarea rows={2} placeholder="Materials, access, special requests..." {...field("notes")} /></label>
          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>
            <button className="primary-button"><Icon name="calendar" size={16} />{job ? "Save changes" : "Add to schedule"}</button>
          </div>
        </form>
      </div>
      {addingClient && (
        <ClientForm
          onCancel={() => setAddingClient(false)}
          onSave={(input) => {
            const id = onCreateClient(input);
            setForm((current) => ({ ...current, clientId: id, address: input.address || current.address }));
            setAddingClient(false);
          }}
        />
      )}
    </>
  );
}

export default JobForm;
