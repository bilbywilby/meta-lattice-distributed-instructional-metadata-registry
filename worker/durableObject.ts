import { DurableObject } from "cloudflare:workers";
import { InstructionalUnit, Report } from "@shared/types";
export class GlobalDurableObject extends DurableObject {
  private UNITS_KEY = "lattice_units";
  private REPORTS_KEY = "sentinel_reports";
  private STATS_KEY = "lattice_stats";
  async saveInstructionalUnit(unit: InstructionalUnit): Promise<void> {
    const units = await this.ctx.storage.get<Record<string, InstructionalUnit>>(this.UNITS_KEY) ?? {};
    units[unit.id] = unit;
    await this.ctx.storage.put(this.UNITS_KEY, units);
    const stats: any = await this.ctx.storage.get(this.STATS_KEY) ?? { total_validations: 0 };
    stats.total_validations += 1;
    await this.ctx.storage.put(this.STATS_KEY, stats);
  }
  async getInstructionalUnits(): Promise<InstructionalUnit[]> {
    const units = await this.ctx.storage.get<Record<string, InstructionalUnit>>(this.UNITS_KEY) ?? {};
    return Object.values(units).sort((a, b) => b.id.localeCompare(a.id));
  }
  async saveReport(report: Report): Promise<void> {
    const reports = await this.ctx.storage.get<Record<string, Report>>(this.REPORTS_KEY) ?? {};
    reports[report.id] = report;
    await this.ctx.storage.put(this.REPORTS_KEY, reports);
  }
  async getReports(): Promise<Report[]> {
    const reports = await this.ctx.storage.get<Record<string, Report>>(this.REPORTS_KEY) ?? {};
    return Object.values(reports).sort((a, b) => b.createdAt - a.createdAt);
  }
  async getRegistryStats(): Promise<any> {
    const units = await this.getInstructionalUnits();
    const reports = await this.getReports();
    const stats: any = await this.ctx.storage.get(this.STATS_KEY) ?? { total_validations: 0 };
    // Simple DAG analytics stub: count provenance links
    const unitLinks = units.filter(u => u.provenance?.parentUnitId).length;
    return {
      total_units: units.length,
      total_reports: reports.length,
      dag_links: unitLinks,
      active_nodes: 12,
      throughput_24h: stats.total_validations,
      health_index: 0.999
    };
  }
}