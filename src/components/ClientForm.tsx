import { useState } from "react";
import type { ClientInput } from "../data/store";
import type { Client } from "../data/types";

type Props = {
  client?: Client;
  onSave: (input: ClientInput) => void;
  onCancel: () => void;
};

function ClientForm({ client, onSave, onCancel }: Props) {
  const [form, setForm] = useState<ClientInput>({
    name: client?.name ?? "",
    phone: client?.phone ?? "",
    email: client?.email ?? "",
    address: client?.address ?? "",
    notes: client?.notes ?? "",
  });
  const field = (key: keyof ClientInput) => ({
    value: form[key],
    onChange: (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value })),
  });

  return (
    <div className="modal-backdrop modal-top" onMouseDown={onCancel}>
      <form
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onSave({ ...form, name: form.name.trim() });
        }}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{client ? "CLIENT FILE" : "NEW CLIENT"}</p>
            <h2>{client ? "Edit client" : "Add a client"}</h2>
          </div>
          <button type="button" aria-label="Close" onClick={onCancel}>×</button>
        </div>
        <label>Full name<input required autoFocus placeholder="e.g. Olivia Martin" {...field("name")} /></label>
        <div className="form-row">
          <label>Phone<input type="tel" placeholder="(555) 000-0000" {...field("phone")} /></label>
          <label>Email<input type="email" placeholder="name@example.com" {...field("email")} /></label>
        </div>
        <label>Address<input placeholder="Street address" {...field("address")} /></label>
        <label>Notes<textarea rows={3} placeholder="Access codes, preferences, pets..." {...field("notes")} /></label>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>Cancel</button>
          <button className="primary-button">{client ? "Save client" : "Add client"}</button>
        </div>
      </form>
    </div>
  );
}

export default ClientForm;
