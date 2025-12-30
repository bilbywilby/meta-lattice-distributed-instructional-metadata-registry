import { DurableObject } from "cloudflare:workers";
import { Report } from "@shared/types";
export class GlobalDurableObject extends DurableObject {
  private STORAGE_KEY = "registry_reports";
  async getHealth(): Promise<boolean> {
    return true;
  }
  async saveReport(report: Report): Promise<void> {
    const reports = await this.ctx.storage.get<Record<string, Report>>(this.STORAGE_KEY) ?? {};
    reports[report.id] = {
      ...report,
      status: 'SENT' 
    };
    await this.ctx.storage.put(this.STORAGE_KEY, reports);
  }
  async getReports(): Promise<Report[]> {
    const reports = await this.ctx.storage.get<Record<string, Report>>(this.STORAGE_KEY) ?? {};
    return Object.values(reports).sort((a, b) => b.createdAt - a.createdAt);
  }
  async getRegistryStats(): Promise<{ total: number; clusters: number }> {
    const reports = await this.getReports();
    const geohashes = new Set(reports.map(r => r.geohash));
    return {
      total: reports.length,
      clusters: geohashes.size
    };
  }
}