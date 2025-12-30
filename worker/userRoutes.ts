import { Hono } from "hono";
import { Env } from './core-utils';
import { ApiResponse, InstructionalUnit, Report } from '@shared/types';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import rawSchema from '../shared/schemas/instructional-unit.schema.json';
// Simplify type for AJV to prevent deep instantiation errors
const schema = rawSchema as any;
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/health', (c) => {
    return c.json({
      success: true,
      data: { status: 'operational', system: 'META_LATTICE_V1.0_PROD' }
    } as ApiResponse<any>);
  });
  // Instructional Unit Ingress
  app.post('/api/publish', async (c) => {
    try {
      const body = await c.req.json();
      const isValid = validate(body);
      if (!isValid) {
        return c.json({
          success: false,
          error: "Schema Validation Failed",
          detail: ajv.errorsText(validate.errors)
        } as ApiResponse<any>, 400);
      }
      const unit = body as unknown as InstructionalUnit;
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      await stub.saveInstructionalUnit(unit);
      return c.json({
        success: true,
        data: { id: unit.id, status: 'ACCEPTED' }
      } as ApiResponse<any>, 201);
    } catch (err) {
      console.error(`[PUBLISH_ERROR] ${err}`);
      return c.json({ success: false, error: "Internal Registry Ingress Failure" } as ApiResponse<any>, 500);
    }
  });
  // Sentinel Report Ingress (Regional Observations)
  app.get('/api/v1/reports', async (c) => {
    try {
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const reports = await stub.getReports();
      return c.json({ success: true, data: reports } as ApiResponse<any>);
    } catch (err) {
      return c.json({ success: false, error: "Report retrieval failure" } as ApiResponse<any>, 500);
    }
  });
  app.post('/api/v1/reports', async (c) => {
    try {
      const body = await c.req.json() as Report;
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      await stub.saveReport(body);
      return c.json({ success: true, data: { id: body.id, status: 'COMMITTED' } } as ApiResponse<any>);
    } catch (err) {
      return c.json({ success: false, error: "Report persistence failure" } as ApiResponse<any>, 500);
    }
  });
  // Ledger Access
  app.get('/api/v1/ledger', async (c) => {
    try {
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const units = await stub.getInstructionalUnits();
      return c.json({ success: true, data: units } as ApiResponse<any>);
    } catch (err) {
      return c.json({ success: false, error: "Ledger access denied" } as ApiResponse<any>, 500);
    }
  });
  // RSS Regional Proxy Mock
  app.get('/api/v1/rss/regional', (c) => {
    return c.json({
      success: true,
      data: [
        { id: 'rss_1', source: 'Lattice_Net', title: 'Registry Consensus Reached', content: 'Global nodes have verified the latest metadata batch.', fetchedAt: Date.now(), contentHash: 'abc1' },
        { id: 'rss_2', source: 'Grid_Watch', title: 'Power Mesh Stability', content: 'Renewable energy clusters in Lehigh Valley showing 98% uptime.', fetchedAt: Date.now(), contentHash: 'abc2' }
      ]
    } as ApiResponse<any>);
  });
  app.get('/api/v1/stats', async (c) => {
    try {
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const stats = await stub.getRegistryStats();
      return c.json({ success: true, data: stats } as ApiResponse<any>);
    } catch (err) {
      return c.json({ success: false, error: "Stats retrieval failure" } as ApiResponse<any>, 500);
    }
  });
}