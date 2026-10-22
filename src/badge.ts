import type { Report, Status } from "./types.ts";

const COLORS: Record<Status, string> = {
  match: "#287a35",
  drift: "#b62324",
  incomplete: "#8a5700",
  unavailable: "#62666b",
};

/** A point-in-time status badge, never an audit or safety claim. */
export function renderBadge(report: Report): string {
  const status = report.overall;
  const title = `ContractAtlas: ${status} (recorded observation)`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="230" height="24" role="img" aria-label="${title}"><title>${title}</title><rect width="126" height="24" fill="#34373b"/><rect x="126" width="104" height="24" fill="${COLORS[status]}"/><g fill="#fff" font-family="Verdana,sans-serif" font-size="11" text-anchor="middle"><text x="63" y="16">ContractAtlas</text><text x="178" y="16">${status}</text></g></svg>\n`;
}
