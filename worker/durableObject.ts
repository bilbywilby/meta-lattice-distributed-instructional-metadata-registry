import { DurableObject } from "cloudflare:workers";
import { InstructionalUnit } from "@shared/types";
export class GlobalDurableObject extends DurableObject {
  private UNITS_KEY = "lattice_units";
  private NODES_KEY = "registry_nodes";
  async saveInstructionalUnit(unit: InstructionalUnit): Promise<void> {
    const units = await this.ctx.storage.get<Record<string, InstructionalUnit>>(this.UNITS_KEY) ?? {};
    units[unit.id] = unit;
    await this.ctx.storage.put(this.UNITS_KEY, units);
    // Increment node-specific validation counter (stub)
    const stats: any = await this.ctx.storage.get("lattice_stats") ?? { total_validations: 0 };
    stats.total_validations += 1;
    await this.ctx.storage.put("lattice_stats", stats);
  }
  async getInstructionalUnits(): Promise<InstructionalUnit[]> {
    const units = await this.ctx.storage.get<Record<string, InstructionalUnit>>(this.UNITS_KEY) ?? {};
    return Object.values(units).sort((a, b) => b.id.localeCompare(a.id));
  }
  async getRegistryStats(): Promise<any> {
    const units = await this.getInstructionalUnits();
    const stats: any = await this.ctx.storage.get("lattice_stats") ?? { total_validations: 0 };
    return {
      total_units: units.length,
      active_nodes: 12, // Mock peer count
      throughput_24h: stats.total_validations,
      health_index: 0.999
    };
  }
}