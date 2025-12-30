import { Hono } from "hono";
import { Env } from './core-utils';
import { ApiResponse, InstructionalUnit, LatticeStatus } from '@shared/types';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../shared/schemas/instructional-unit.schema.json';
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Existing health check
  app.get('/api/health', (c) => {
    return c.json({
      success: true,
      data: { status: 'operational', system: 'META_LATTICE_V1.0_PROD' }
    });
  });
  // Production Publish Endpoint
  app.post('/api/publish', async (c) => {
    try {
      const body = await c.req.json();
      // AJV Validation
      const isValid = validate(body);
      if (!isValid) {
        return c.json({
          success: false,
          error: "Schema Validation Failed",
          detail: ajv.errorsText(validate.errors)
        }, 400);
      }
      const unit = body as InstructionalUnit;
      // Verification Stub (DID / Signature)
      const isAuthorized = true; // Placeholder for DID-based auth
      if (!isAuthorized) {
        return c.json({ success: false, error: "Unauthorized Node DID" }, 401);
      }
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      await stub.saveInstructionalUnit(unit);
      return c.json({
        success: true,
        data: { id: unit.id, status: 'ACCEPTED' }
      } satisfies ApiResponse, 201);
    } catch (err) {
      console.error(`[PUBLISH_ERROR] ${err}`);
      return c.json({ success: false, error: "Internal Registry Ingress Failure" }, 500);
    }
  });
  // Ledger Retrieval
  app.get('/api/v1/ledger', async (c) => {
    try {
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const units = await stub.getInstructionalUnits();
      return c.json({
        success: true,
        data: units
      } satisfies ApiResponse<InstructionalUnit[]>);
    } catch (err) {
      return c.json({ success: false, error: "Ledger access denied" }, 500);
    }
  });
  // Registry Stats
  app.get('/api/v1/stats', async (c) => {
    try {
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const stats = await stub.getRegistryStats();
      return c.json({
        success: true,
        data: stats
      } satisfies ApiResponse);
    } catch (err) {
      return c.json({ success: false, error: "Stats retrieval failure" }, 500);
    }
  });
}