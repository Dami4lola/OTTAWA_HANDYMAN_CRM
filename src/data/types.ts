export type WorkerColor = "blue" | "orange" | "green" | "purple";

export type Worker = {
  id: string;
  name: string;
  initials: string;
  color: WorkerColor;
  phone?: string;
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
};

export type Job = {
  id: string;
  title: string;
  clientId: string;
  address: string;
  date: string;
  time: string;
  duration: number;
  workerId: string;
  progress: number;
  quote: { amount: number; sentAt: string | null };
  deposit: { amount: number; receivedAt: string | null };
  paidAt: string | null;
  workerPay: number;
  workerPaidAt: string | null;
  notes: string;
};

export type Role = { kind: "admin" } | { kind: "worker"; workerId: string };

export type JobStatus = "Scheduled" | "In progress" | "Completed";

export type PaymentStage = "Not quoted" | "Quoted" | "Deposit paid" | "Paid";

export type CrmState = {
  workers: Worker[];
  clients: Client[];
  jobs: Job[];
  role: Role;
  currency: string;
};
