export function formatThroughput(n: number, unit: string): string {
  if (unit === "homes" || unit === "patients" || unit === "projects") {
    return Math.round(n).toLocaleString("en-GB");
  }
  return n.toFixed(1);
}
