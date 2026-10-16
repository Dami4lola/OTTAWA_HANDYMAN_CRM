import { useEffect, useMemo, useState } from "react";
import { todayISO } from "./dates";
import { createSeed } from "./seed";
import type { Client, CrmState, Job, Role } from "./types";

const STORAGE_KEY = "workbench-crm-v1";

export type ClientInput = Omit<Client, "id" | "createdAt">;

export type JobInput = Pick<Job, "title" | "clientId" | "address" | "date" | "time" | "duration" | "workerId" | "workerPay" | "notes"> & {
  quoteAmount: number;
};

export type PaymentStep = "quote" | "deposit" | "paid";

export function isCrmState(value: unknown): value is CrmState {
  const state = value as CrmState;
  return Boolean(state) && Array.isArray(state.workers) && Array.isArray(state.clients) && Array.isArray(state.jobs) && Boolean(state.role) && typeof state.currency === "string";
}

function load(): CrmState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isCrmState(parsed)) return parsed;
    }
  } catch {
    // Storage unavailable or corrupt: fall back to demo data.
  }
  return createSeed();
}

function nextJobId(jobs: Job[]) {
  const highest = jobs.reduce((max, job) => Math.max(max, Number(job.id.replace(/\D/g, "")) || 0), 2000);
  return `JB-${highest + 1}`;
}

export function useCrmStore() {
  const [state, setState] = useState<CrmState>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable: keep working in memory.
    }
  }, [state]);

  const actions = useMemo(() => {
    const patchJob = (id: string, change: (job: Job) => Job) =>
      setState((current) => ({ ...current, jobs: current.jobs.map((job) => (job.id === id ? change(job) : job)) }));

    return {
      addClient(input: ClientInput) {
        const id = `CL-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
        setState((current) => ({ ...current, clients: [...current.clients, { ...input, id, createdAt: todayISO() }] }));
        return id;
      },
      updateClient(id: string, input: ClientInput) {
        setState((current) => ({ ...current, clients: current.clients.map((client) => (client.id === id ? { ...client, ...input } : client)) }));
      },
      deleteClient(id: string) {
        setState((current) => (current.jobs.some((job) => job.clientId === id) ? current : { ...current, clients: current.clients.filter((client) => client.id !== id) }));
      },
      addJob(input: JobInput) {
        const { quoteAmount, ...fields } = input;
        setState((current) => ({
          ...current,
          jobs: [
            ...current.jobs,
            { ...fields, id: nextJobId(current.jobs), progress: 0, quote: { amount: quoteAmount, sentAt: null }, deposit: { amount: 0, receivedAt: null }, paidAt: null, workerPaidAt: null },
          ],
        }));
      },
      updateJob(id: string, input: JobInput) {
        const { quoteAmount, ...fields } = input;
        patchJob(id, (job) => ({ ...job, ...fields, quote: { ...job.quote, amount: quoteAmount } }));
      },
      deleteJob(id: string) {
        setState((current) => ({ ...current, jobs: current.jobs.filter((job) => job.id !== id) }));
      },
      setProgress(id: string, progress: number) {
        patchJob(id, (job) => ({ ...job, progress }));
      },
      markQuoted(id: string, amount: number) {
        patchJob(id, (job) => ({ ...job, quote: { amount, sentAt: todayISO() } }));
      },
      recordDeposit(id: string, amount: number) {
        patchJob(id, (job) => ({ ...job, deposit: { amount, receivedAt: todayISO() } }));
      },
      markPaid(id: string) {
        patchJob(id, (job) => ({ ...job, paidAt: todayISO() }));
      },
      undoPayment(id: string, step: PaymentStep) {
        patchJob(id, (job) => {
          if (step === "quote") return { ...job, quote: { ...job.quote, sentAt: null } };
          if (step === "deposit") return { ...job, deposit: { ...job.deposit, receivedAt: null } };
          return { ...job, paidAt: null };
        });
      },
      setWorkerPaid(id: string, paid: boolean) {
        patchJob(id, (job) => ({ ...job, workerPaidAt: paid ? todayISO() : null }));
      },
      setRole(role: Role) {
        setState((current) => ({ ...current, role }));
      },
      setCurrency(currency: string) {
        setState((current) => ({ ...current, currency }));
      },
      resetData() {
        setState(createSeed());
      },
      importData(data: unknown) {
        if (!isCrmState(data)) return false;
        setState(data);
        return true;
      },
    };
  }, []);

  return { state, ...actions };
}

export type CrmStore = ReturnType<typeof useCrmStore>;
