export function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function toISO(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromISO(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function todayISO() {
  return toISO(new Date());
}

export function addDays(iso: string, days: number) {
  const date = fromISO(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

export function startOfWeek(iso: string) {
  const date = fromISO(iso);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return toISO(date);
}

export function formatDate(iso: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return fromISO(iso).toLocaleDateString("en-US", options);
}

export function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${pad(minutes)} ${hours >= 12 ? "PM" : "AM"}`;
}

export function timeToHours(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours + minutes / 60;
}

export function formatWeekRange(startIso: string, endIso: string) {
  const start = fromISO(startIso);
  const end = fromISO(endIso);
  const startLabel = formatDate(startIso);
  const endLabel = start.getMonth() === end.getMonth() ? String(end.getDate()) : formatDate(endIso);
  return `${startLabel} – ${endLabel}, ${end.getFullYear()}`;
}
