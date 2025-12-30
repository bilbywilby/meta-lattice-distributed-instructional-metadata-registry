import { DurableObject } from "cloudflare:workers";
export class GlobalDurableObject extends DurableObject {
  async getHealth(): Promise<boolean> {
    return true;
  }
}