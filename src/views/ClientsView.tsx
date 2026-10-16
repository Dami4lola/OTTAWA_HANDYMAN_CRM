import { useApp } from "../appContext";
import Icon from "../components/Icon";
import { formatDate } from "../data/dates";
import { clientTotals } from "../data/money";
import { initials } from "../data/text";

function ClientsView({ onNewClient }: { onNewClient: () => void }) {
  const { store, money, openClient, search } = useApp();
  const query = search.toLowerCase().trim();

  const rows = store.state.clients
    .filter((client) => !query || `${client.name} ${client.phone} ${client.email} ${client.address}`.toLowerCase().includes(query))
    .map((client) => {
      const jobs = store.state.jobs.filter((job) => job.clientId === client.id);
      const lastJob = jobs.map((job) => job.date).sort().pop();
      return { client, jobs, totals: clientTotals(jobs), lastJob };
    })
    .sort((a, b) => a.client.name.localeCompare(b.client.name));

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Clients</h2>
          <p>{store.state.clients.length} clients · open a file to see their jobs and payments.</p>
        </div>
        <button className="primary-button" onClick={onNewClient}><Icon name="plus" size={16} />New client</button>
      </div>
      <div className="job-table-wrap">
        <table>
          <thead><tr><th>Client</th><th>Contact</th><th>Jobs</th><th>Collected</th><th>Outstanding</th><th>Last job</th><th /></tr></thead>
          <tbody>
            {rows.map(({ client, jobs, totals, lastJob }) => (
              <tr key={client.id} className="clickable" onClick={() => openClient(client.id)}>
                <td>
                  <span className="worker-cell">
                    <span className="avatar avatar-client">{initials(client.name)}</span>
                    <span><strong>{client.name}</strong><small><Icon name="pin" size={12} />{client.address || "No address"}</small></span>
                  </span>
                </td>
                <td><strong>{client.phone || "—"}</strong><small>{client.email}</small></td>
                <td>{jobs.length}</td>
                <td>{money(totals.collected)}</td>
                <td>{totals.outstanding ? <strong className="owed">{money(totals.outstanding)}</strong> : "—"}</td>
                <td>{lastJob ? formatDate(lastJob, { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
                <td><button className="table-menu" aria-label={`Open ${client.name}'s file`}><Icon name="chevronRight" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <div className="empty-state">{query ? `No clients match “${search}”` : "No clients yet. Add your first one."}</div>}
      </div>
    </section>
  );
}

export default ClientsView;
