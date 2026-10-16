import { createContext, useContext } from "react";
import type { CrmStore } from "./data/store";
import type { Client, Job, Worker } from "./data/types";

export type AppContextValue = {
  store: CrmStore;
  search: string;
  isAdmin: boolean;
  /** The worker being viewed as, or null for the admin role. */
  currentWorkerId: string | null;
  /** Jobs this role may see: everything for admin, own jobs for a worker. */
  visibleJobs: Job[];
  notify: (message: string) => void;
  money: (amount: number) => string;
  client: (id: string) => Client | undefined;
  worker: (id: string) => Worker | undefined;
  jobMatchesSearch: (job: Job) => boolean;
  openJob: (id: string) => void;
  openClient: (id: string) => void;
  newJob: (clientId?: string) => void;
  editJob: (id: string) => void;
  removeJob: (id: string) => void;
  advanceJob: (id: string) => void;
};

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppContext");
  return value;
}
