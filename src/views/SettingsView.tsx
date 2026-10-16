import { useRef } from "react";
import { useApp } from "../appContext";
import Icon from "../components/Icon";
import { todayISO } from "../data/dates";
import { CURRENCIES } from "../data/money";

function SettingsView() {
  const { store, notify } = useApp();
  const fileInput = useRef<HTMLInputElement>(null);

  function exportData() {
    const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `workbench-backup-${todayISO()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Backup downloaded");
  }

  async function importData(file: File) {
    try {
      const ok = store.importData(JSON.parse(await file.text()));
      notify(ok ? "Backup restored" : "That file isn't a WorkBench backup");
    } catch {
      notify("Couldn't read that file");
    }
  }

  return (
    <section className="panel settings-panel">
      <div className="panel-header"><div><h2>Settings</h2><p>Your data is saved in this browser only. Export a backup to move it to another device.</p></div></div>

      <div className="setting-row">
        <div><strong>Currency</strong><p>Used for quotes, deposits, balances and worker pay.</p></div>
        <select value={store.state.currency} onChange={(event) => store.setCurrency(event.target.value)}>
          {CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
        </select>
      </div>

      <div className="setting-row">
        <div><strong>Export backup</strong><p>Download every client, job and payment as a JSON file.</p></div>
        <button className="secondary-button" onClick={exportData}><Icon name="file" size={15} />Export</button>
      </div>

      <div className="setting-row">
        <div><strong>Import backup</strong><p>Replace the current data with a backup file.</p></div>
        <button className="secondary-button" onClick={() => fileInput.current?.click()}>Import…</button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file && window.confirm("Replace all current data with this backup?")) importData(file);
            event.target.value = "";
          }}
        />
      </div>

      <div className="setting-row">
        <div><strong>Reset demo data</strong><p>Delete everything and reload the sample clients and jobs.</p></div>
        <button
          className="secondary-button danger-text"
          onClick={() => {
            if (window.confirm("Delete all data and restore the demo data?")) {
              store.resetData();
              notify("Demo data restored");
            }
          }}
        >
          <Icon name="trash" size={15} />Reset
        </button>
      </div>
    </section>
  );
}

export default SettingsView;
