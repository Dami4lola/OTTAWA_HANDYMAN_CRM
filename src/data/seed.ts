import { addDays, startOfWeek, todayISO } from "./dates";
import type { Client, CrmState, Job, Worker } from "./types";

const workers: Worker[] = [
  { id: "marcus", name: "Marcus Lee", initials: "ML", color: "blue", phone: "(555) 201-4410" },
  { id: "sam", name: "Sam Ortega", initials: "SO", color: "orange", phone: "(555) 201-8832" },
  { id: "devon", name: "Devon Kim", initials: "DK", color: "green", phone: "(555) 307-1129" },
  { id: "tony", name: "Tony Reed", initials: "TR", color: "purple", phone: "(555) 412-9087" },
];

type JobSeed = Omit<Job, "quote" | "deposit" | "paidAt" | "workerPaidAt" | "notes"> & {
  quote?: number;
  quotedOn?: string;
  deposit?: number;
  depositOn?: string;
  paidOn?: string;
  workerPaidOn?: string;
  notes?: string;
};

function job(seed: JobSeed): Job {
  const { quote = 0, quotedOn, deposit = 0, depositOn, paidOn, workerPaidOn, notes = "", ...rest } = seed;
  return {
    ...rest,
    quote: { amount: quote, sentAt: quotedOn ?? null },
    deposit: { amount: deposit, receivedAt: depositOn ?? null },
    paidAt: paidOn ?? null,
    workerPaidAt: workerPaidOn ?? null,
    notes,
  };
}

export function createSeed(): CrmState {
  const monday = startOfWeek(todayISO());
  const day = (offset: number) => addDays(monday, offset);

  const clients: Client[] = [
    { id: "olivia", name: "Olivia Martin", phone: "(555) 318-2240", email: "olivia.martin@example.com", address: "24 Maple Ave", notes: "Side gate code 4410. Has a dog.", createdAt: day(-60) },
    { id: "daniel", name: "Daniel Cho", phone: "(555) 610-7781", email: "dcho@example.com", address: "189 Cooper St", notes: "", createdAt: day(-30) },
    { id: "sophia", name: "Sophia Brown", phone: "(555) 902-1145", email: "sophia.brown@example.com", address: "7 Garden Lane", notes: "Prefers text messages.", createdAt: day(-12) },
    { id: "noah", name: "Noah Wilson", phone: "(555) 274-6603", email: "noah.w@example.com", address: "51 Birch Rd", notes: "", createdAt: day(-5) },
    { id: "emma", name: "Emma Davis", phone: "(555) 488-3017", email: "emma.davis@example.com", address: "302 King St", notes: "Repeat client. Pays by bank transfer.", createdAt: day(-45) },
    { id: "liam", name: "Liam Parker", phone: "(555) 733-5920", email: "liam.parker@example.com", address: "88 Franklin Ave", notes: "", createdAt: day(-8) },
  ];

  const jobs: Job[] = [
    job({ id: "JB-2031", title: "Garbage disposal install", clientId: "olivia", address: "24 Maple Ave", date: day(-19), time: "09:00", duration: 2, workerId: "marcus", progress: 100, quote: 280, quotedOn: day(-24), paidOn: day(-19), workerPay: 110, workerPaidOn: day(-17) }),
    job({ id: "JB-2036", title: "Gutter cleaning", clientId: "emma", address: "302 King St", date: day(-12), time: "13:00", duration: 3, workerId: "devon", progress: 100, quote: 220, quotedOn: day(-15), paidOn: day(-11), workerPay: 90, workerPaidOn: day(-10) }),
    job({ id: "JB-2039", title: "Window screen repair", clientId: "daniel", address: "189 Cooper St", date: day(-5), time: "10:00", duration: 1.5, workerId: "sam", progress: 100, quote: 140, quotedOn: day(-9), deposit: 50, depositOn: day(-8), workerPay: 55 }),
    job({ id: "JB-2043", title: "Front door alignment", clientId: "emma", address: "302 King St", date: day(3), time: "08:00", duration: 1, workerId: "marcus", progress: 100, quote: 150, quotedOn: day(-3), paidOn: day(3), workerPay: 60 }),
    job({ id: "JB-2046", title: "Deck railing repair", clientId: "sophia", address: "7 Garden Lane", date: day(1), time: "08:30", duration: 3, workerId: "devon", progress: 40, quote: 950, quotedOn: day(-6), deposit: 300, depositOn: day(-4), workerPay: 360, notes: "Pressure-treated lumber on site." }),
    job({ id: "JB-2048", title: "Kitchen faucet replacement", clientId: "olivia", address: "24 Maple Ave", date: day(0), time: "08:00", duration: 2, workerId: "marcus", progress: 65, quote: 320, quotedOn: day(-7), deposit: 100, depositOn: day(-5), workerPay: 120, notes: "Client supplied the faucet." }),
    job({ id: "JB-2051", title: "Drywall repair", clientId: "daniel", address: "189 Cooper St", date: day(0), time: "10:30", duration: 1.5, workerId: "sam", progress: 0, quote: 180, quotedOn: day(-2), workerPay: 70 }),
    job({ id: "JB-2054", title: "Ceiling fan install", clientId: "noah", address: "51 Birch Rd", date: day(2), time: "09:00", duration: 2, workerId: "tony", progress: 0, quote: 0, workerPay: 90, notes: "Needs a quote before the visit." }),
    job({ id: "JB-2057", title: "Bathroom tile repair", clientId: "liam", address: "88 Franklin Ave", date: day(4), time: "10:00", duration: 2.5, workerId: "sam", progress: 0, quote: 420, quotedOn: day(-1), workerPay: 160 }),
  ];

  return { workers, clients, jobs, role: { kind: "admin" }, currency: "USD" };
}
