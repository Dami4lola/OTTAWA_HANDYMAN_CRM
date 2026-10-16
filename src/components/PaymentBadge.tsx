import { jobStatus, paymentStage } from "../data/money";
import type { Job, PaymentStage } from "../data/types";

export function stageClass(stage: PaymentStage) {
  return `pay pay-${stage.toLowerCase().replace(" ", "-")}`;
}

export function StatusBadge({ job }: { job: Job }) {
  const status = jobStatus(job);
  return <span className={`status status-${status.toLowerCase().replace(" ", "-")}`}>{status}</span>;
}

function PaymentBadge({ job }: { job: Job }) {
  const stage = paymentStage(job);
  return <span className={stageClass(stage)}>{stage}</span>;
}

export default PaymentBadge;
