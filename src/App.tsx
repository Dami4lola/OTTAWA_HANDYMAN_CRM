import { useRef, useState } from "react";
import { AppContext, type AppContextValue } from "./appContext";
import ClientForm from "./components/ClientForm";
import Icon from "./components/Icon";
import JobDrawer from "./components/JobDrawer";
import JobForm from "./components/JobForm";
import ProfileMenu, { ADMIN_NAME } from "./components/ProfileMenu";
import Sidebar, { type NavItem } from "./components/Sidebar";
import { todayISO } from "./data/dates";
import { formatMoney, jobBalance, jobStatus, nextProgress } from "./data/money";
import { useCrmStore } from "./data/store";
import type { Role } from "./data/types";
import ClientFile from "./views/ClientFile";
import ClientsView from "./views/ClientsView";
import JobsView from "./views/JobsView";
import MyJobsView from "./views/MyJobsView";
import ReportsView from "./views/ReportsView";
import ScheduleView from "./views/ScheduleView";
import SettingsView from "./views/SettingsView";
import TeamView from "./views/TeamView";

function greeting() {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function App() {
  const store = useCrmStore();
  const { workers, clients, jobs, role, currency } = store.state;
  const currentWorker = role.kind === "worker" ? workers.find((person) => person.id === role.workerId) : undefined;
  const isAdmin = !currentWorker;
  const visibleJobs = currentWorker ? jobs.filter((job) => job.workerId === currentWorker.id) : jobs;

  const [activeNav, setActiveNav] = useState(isAdmin ? "Schedule" : "My jobs");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [openJobId, setOpenJobId] = useState<string | null>(null);
  const [openClientId, setOpenClientId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState<{ jobId?: string; clientId?: string } | null>(null);
  const [clientForm, setClientForm] = useState<{ clientId?: string } | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const openCount = visibleJobs.filter((job) => jobStatus(job) !== "Completed").length;
  const navItems: NavItem[] = isAdmin
    ? [
        { label: "Schedule", icon: "calendar" },
        { label: "Jobs", icon: "briefcase", count: openCount },
        { label: "Clients", icon: "users" },
        { label: "Team", icon: "user" },
        { label: "Reports", icon: "chart" },
      ]
    : [
        { label: "My jobs", icon: "briefcase", count: openCount },
        { label: "Schedule", icon: "calendar" },
      ];
  const allowed = navItems.some((item) => item.label === activeNav) || (isAdmin && activeNav === "Settings");
  const page = allowed ? activeNav : navItems[0].label;

  function notify(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2400);
  }

  function selectSection(label: string) {
    setActiveNav(label);
    setOpenClientId(null);
  }

  function switchRole(next: Role) {
    store.setRole(next);
    setActiveNav(next.kind === "admin" ? "Schedule" : "My jobs");
    setOpenJobId(null);
    setOpenClientId(null);
    setSearch("");
    const name = next.kind === "worker" ? workers.find((person) => person.id === next.workerId)?.name : ADMIN_NAME;
    notify(`Now viewing as ${name}`);
  }

  const context: AppContextValue = {
    store,
    search,
    isAdmin,
    currentWorkerId: currentWorker?.id ?? null,
    visibleJobs,
    notify,
    money: (amount) => formatMoney(amount, currency),
    client: (id) => clients.find((item) => item.id === id),
    worker: (id) => workers.find((item) => item.id === id),
    jobMatchesSearch(job) {
      const query = search.toLowerCase().trim();
      if (!query) return true;
      const owner = clients.find((item) => item.id === job.clientId);
      const contact = isAdmin ? `${owner?.phone ?? ""} ${owner?.email ?? ""}` : "";
      return `${job.title} ${job.id} ${job.address} ${owner?.name ?? ""} ${contact}`.toLowerCase().includes(query);
    },
    openJob: (id) => setOpenJobId(id),
    openClient(id) {
      if (!isAdmin) return;
      setActiveNav("Clients");
      setOpenClientId(id);
      setOpenJobId(null);
    },
    newJob: (clientId) => setJobForm({ clientId }),
    editJob: (id) => setJobForm({ jobId: id }),
    removeJob(id) {
      const job = jobs.find((item) => item.id === id);
      if (!job || !window.confirm(`Delete ${job.id} · ${job.title}?`)) return;
      store.deleteJob(id);
      if (openJobId === id) setOpenJobId(null);
      notify("Job deleted");
    },
    advanceJob(id) {
      const job = jobs.find((item) => item.id === id);
      if (!job || job.progress >= 100) return;
      const next = nextProgress(job.progress);
      store.setProgress(id, next);
      notify(next === 100 ? "Job marked complete" : `Progress updated to ${next}%`);
    },
  };

  const drawerJob = visibleJobs.find((job) => job.id === openJobId);
  const editingJob = jobs.find((job) => job.id === jobForm?.jobId);
  const editingClient = clients.find((client) => client.id === clientForm?.clientId);
  const awaitingPayment = jobs.filter((job) => jobStatus(job) === "Completed" && jobBalance(job) > 0).length;
  const firstName = (currentWorker?.name ?? ADMIN_NAME).split(" ")[0];
  const title = page === "Schedule" || page === "My jobs" ? `${greeting()}, ${firstName}` : page === "Clients" && openClientId ? "Client file" : page;

  let content;
  if (page === "My jobs") content = <MyJobsView />;
  else if (page === "Jobs") content = <JobsView />;
  else if (page === "Clients") content = openClientId ? <ClientFile clientId={openClientId} onBack={() => setOpenClientId(null)} onEdit={() => setClientForm({ clientId: openClientId })} /> : <ClientsView onNewClient={() => setClientForm({})} />;
  else if (page === "Team") content = <TeamView onViewAs={(workerId) => switchRole({ kind: "worker", workerId })} />;
  else if (page === "Reports") content = <ReportsView />;
  else if (page === "Settings") content = <SettingsView />;
  else content = <ScheduleView onViewAll={() => selectSection(isAdmin ? "Jobs" : "My jobs")} />;

  return (
    <AppContext.Provider value={context}>
      <div className="app-shell">
        <Sidebar items={navItems} active={page} role={isAdmin ? { kind: "admin" } : role} workers={workers} onSelect={selectSection} onSwitchRole={switchRole} onSupport={() => notify("Support request started")} />

        <main className="workspace">
          <header className="topbar">
            <div>
              <p className="eyebrow">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}</p>
              <h1>{title}</h1>
            </div>
            <div className="top-actions">
              <label className="search-box">
                <Icon name="search" size={17} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isAdmin ? "Search jobs, clients..." : "Search my jobs..."} />
                {search && <button className="clear-search" aria-label="Clear search" onClick={() => setSearch("")}><Icon name="close" size={14} /></button>}
              </label>
              <button
                className="icon-button notification"
                aria-label="Notifications"
                onClick={() => notify(isAdmin ? `${awaitingPayment} completed ${awaitingPayment === 1 ? "job is" : "jobs are"} awaiting payment` : `You have ${visibleJobs.filter((job) => job.date === todayISO()).length} jobs today`)}
              >
                <Icon name="bell" />{(isAdmin ? awaitingPayment : 0) > 0 && <span />}
              </button>
              <span className="mobile-only">
                <ProfileMenu role={isAdmin ? { kind: "admin" } : role} workers={workers} onSwitch={switchRole} onSettings={() => selectSection("Settings")} placement="down" compact />
              </span>
              {isAdmin && <button className="primary-button" onClick={() => setJobForm({})}><Icon name="plus" size={17} /><span>Schedule job</span></button>}
            </div>
          </header>

          <section className="content">{content}</section>
        </main>

        {drawerJob && <JobDrawer key={drawerJob.id} job={drawerJob} onClose={() => setOpenJobId(null)} />}

        {jobForm && isAdmin && (
          <JobForm
            job={editingJob}
            presetClientId={jobForm.clientId}
            clients={clients}
            workers={workers}
            onCancel={() => setJobForm(null)}
            onCreateClient={(input) => {
              const id = store.addClient(input);
              notify(`${input.name} added to clients`);
              return id;
            }}
            onSave={(input) => {
              if (editingJob) store.updateJob(editingJob.id, input);
              else store.addJob(input);
              setJobForm(null);
              notify(editingJob ? "Job updated" : "New job added to the schedule");
            }}
          />
        )}

        {clientForm && isAdmin && (
          <ClientForm
            client={editingClient}
            onCancel={() => setClientForm(null)}
            onSave={(input) => {
              if (editingClient) {
                store.updateClient(editingClient.id, input);
              } else {
                context.openClient(store.addClient(input));
              }
              setClientForm(null);
              notify(editingClient ? "Client updated" : `${input.name} added to clients`);
            }}
          />
        )}

        {toast && <div className="toast" role="status"><Icon name="check" size={17} />{toast}</div>}
      </div>
    </AppContext.Provider>
  );
}

export default App;
