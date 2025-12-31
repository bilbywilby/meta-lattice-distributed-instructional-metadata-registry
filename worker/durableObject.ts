import { DurableObject } from "cloudflare:workers";
import { InstructionalUnit, Report, NewsItem, NewsStage } from "@shared/types";
export class GlobalDurableObject extends DurableObject {
  private UNITS_KEY = "lattice_units";
  private REPORTS_KEY = "sentinel_reports";
  private STATS_KEY = "lattice_stats";
  private NEWS_RAW_KEY = "lattice_news_raw";
  private NEWS_CONSENSUS_KEY = "lattice_news_consensus";
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
  async saveNewsRaw(item: NewsItem): Promise<void> {
    const news = await this.ctx.storage.get<Record<string, NewsItem>>(this.NEWS_RAW_KEY) ?? {};
    news[item.id] = { ...item, stage: NewsStage.RAW };
    await this.ctx.storage.put(this.NEWS_RAW_KEY, news);
  }
  async getNewsFeed(region?: string, biasMax: number = 1.0): Promise<NewsItem[]> {
    const consensus = await this.ctx.storage.get<Record<string, NewsItem>>(this.NEWS_CONSENSUS_KEY) ?? {};
    let items = Object.values(consensus);
    if (region) items = items.filter(i => i.region === region);
    items = items.filter(i => Math.abs(i.poliScore) <= biasMax);
    return items.sort((a, b) => b.timestamp - a.timestamp);
  }
  async processConsensus(): Promise<number> {
    const rawItems = await this.ctx.storage.get<Record<string, NewsItem>>(this.NEWS_RAW_KEY) ?? {};
    const consensus = await this.ctx.storage.get<Record<string, NewsItem>>(this.NEWS_CONSENSUS_KEY) ?? {};
    const processedIds: string[] = [];
    for (const [id, item] of Object.entries(rawItems)) {
      // Simulation of 3-agent analysis (Researcher, Checker, Bias)
      const researcherScore = Math.random() * 2 - 1;
      const checkerScore = Math.random() * 2 - 1;
      const biasScore = Math.random() * 2 - 1;
      const medianPoli = (researcherScore + checkerScore + biasScore) / 3;
      const reliability = 0.7 + Math.random() * 0.3;
      const consensusItem: NewsItem = {
        ...item,
        stage: NewsStage.CONSENSUS,
        poliScore: medianPoli,
        reliability,
        agentVotes: {
          "agent_researcher": { vote: "APPROVE", justification: "Verified via cross-platform secondary sources." },
          "agent_checker": { vote: "APPROVE", justification: "Statistical alignment with primary sensor data." },
          "agent_bias": { vote: "NEUTRAL", justification: "Detected minor regional linguistic lean." }
        }
      };
      consensus[id] = consensusItem;
      processedIds.push(id);
    }
    if (processedIds.length > 0) {
      await this.ctx.storage.put(this.NEWS_CONSENSUS_KEY, consensus);
      // Prune raw after promotion
      for (const id of processedIds) delete rawItems[id];
      await this.ctx.storage.put(this.NEWS_RAW_KEY, rawItems);
    }
    return processedIds.length;
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
    const news = await this.ctx.storage.get<Record<string, NewsItem>>(this.NEWS_CONSENSUS_KEY) ?? {};
    return {
      total_units: units.length,
      total_reports: reports.length,
      total_consensus_news: Object.keys(news).length,
      active_nodes: 12,
      throughput_24h: stats.total_validations,
      health_index: 0.999
    };
  }
}