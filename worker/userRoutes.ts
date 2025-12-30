import { Hono } from "hono";
import { Env } from './core-utils';
import { ApiResponse, Report } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/health', (c) => {
    return c.json({
      success: true,
      data: { status: 'operational', system: 'LV_HUB_REGIONAL_OS_V0.8.2' }
    });
  });
  app.get('/api/v1/sentinel/poll', async (c) => {
    const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
    const stats = await stub.getRegistryStats();
    return c.json({
      success: true,
      data: {
        active_nodes: 1244 + stats.total,
        network_health: 0.998,
        regional_alerts: stats.total > 10 ? ["HIGH_TRAFFIC_INGRESS"] : [],
        registry_total: stats.total,
        cluster_count: stats.clusters
      }
    } satisfies ApiResponse);
  });
  app.get('/api/v1/reports', async (c) => {
    try {
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const reports = await stub.getReports();
      return c.json({
        success: true,
        data: reports
      } satisfies ApiResponse<Report[]>);
    } catch (err) {
      return c.json({
        success: false,
        error: "Registry access denied"
      } satisfies ApiResponse, 500);
    }
  });
  app.get('/api/v1/rss/regional', (c) => {
    return c.json({
      success: true,
      data: [
        {
          id: '1',
          title: "ALLENTOWN_INFRASTRUCTURE_UPGRADE_BETA",
          link: "https://example.com/a",
          pubDate: new Date().toISOString(),
          content: "Major fiber optic backbone installation scheduled for Hamilton St corridor starting Monday.",
          source: "LV_OS_NEWS"
        },
        {
          id: '2',
          title: "BETHLEHEM_STEEL_REDEVELOPMENT_UPDATE",
          link: "https://example.com/b",
          pubDate: new Date().toISOString(),
          content: "New civic data center proposed for former blast furnace site to power regional SSI identity network.",
          source: "VALLEY_TECH_DAILY"
        }
      ]
    });
  });
  app.post('/api/v1/reports', async (c) => {
    const report = await c.req.json() as Report;
    const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
    await stub.saveReport(report);
    return c.json({
      success: true,
      data: { id: report.id }
    } satisfies ApiResponse);
  });
  app.get('/api/ping', (c) => c.json({ success: true }));
}