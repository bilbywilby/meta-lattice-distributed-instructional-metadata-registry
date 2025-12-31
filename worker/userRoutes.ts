import { Hono } from "hono";
import { Env } from './core-utils';
import { ApiResponse, InstructionalUnit, NewsItem } from '@shared/types';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import rawSchema from '../shared/schemas/instructional-unit.schema.json';
const schema = rawSchema as any;
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate: any = ajv.compile(schema);
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/health', (c) => {
    return c.json({
      success: true,
      data: { status: 'operational', system: 'META_LATTICE_V1.0_PROD' }
    } as ApiResponse<any>);
  });
  app.get('/api/v1/feed', async (c) => {
    try {
      const region = c.req.query('region');
      const biasMax = parseFloat(c.req.query('bias_max') || '1.0');
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const items = await stub.getNewsFeed(region, biasMax);
      return c.json({ success: true, data: items } as ApiResponse<NewsItem[]>);
    } catch (err) {
      return c.json({ success: false, error: "Feed retrieval failure" } as ApiResponse<any>, 500);
    }
  });
  app.post('/api/v1/consensus/trigger', async (c) => {
    try {
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const count = await stub.processConsensus();
      return c.json({ success: true, data: { processed: count } } as ApiResponse<any>);
    } catch (err) {
      return c.json({ success: false, error: "Consensus engine failure" } as ApiResponse<any>, 500);
    }
  });
  app.post('/api/v1/news/raw', async (c) => {
    try {
      const body = await c.req.json() as NewsItem;
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      await stub.saveNewsRaw(body);
      return c.json({ success: true, data: { id: body.id, status: 'RAW_INGESTED' } } as ApiResponse<any>);
    } catch (err) {
      return c.json({ success: false, error: "News raw ingest failure" } as ApiResponse<any>, 500);
    }
  });
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
      const unit = body as InstructionalUnit;
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      await stub.saveInstructionalUnit(unit);
      return c.json({
        success: true,
        data: { id: unit.id, status: 'ACCEPTED' }
      } as ApiResponse<any>, 201);
    } catch (err) {
      return c.json({ success: false, error: "Internal Registry Ingress Failure" } as ApiResponse<any>, 500);
    }
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