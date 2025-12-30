import { Hono } from "hono";
import { Env } from './core-utils';
import { ApiResponse, InstructionalUnit } from '@shared/types';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../shared/schemas/instructional-unit.schema.json';
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(schema);
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/health', (c) => {
    return c.json({
      success: true,
      data: { status: 'operational', system: 'META_LATTICE_V1.0_PROD' }
    } satisfies ApiResponse);
  });
  app.post('/api/publish', async (c) => {
    try {
      const body = await c.req.json();
      const isValid = validate(body);
      if (!isValid) {
        const errResponse: ApiResponse = {
          success: false,
          error: "Schema Validation Failed",
          detail: ajv.errorsText(validate.errors)
        };
        return c.json(errResponse, 400);
      }
      const unit = body as unknown as InstructionalUnit;
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      await stub.saveInstructionalUnit(unit);
      const successResponse: ApiResponse = {
        success: true,
        data: { id: unit.id, status: 'ACCEPTED' }
      };
      return c.json(successResponse, 201);
    } catch (err) {
      console.error(`[PUBLISH_ERROR] ${err}`);
      const failResponse: ApiResponse = { success: false, error: "Internal Registry Ingress Failure" };
      return c.json(failResponse, 500);
    }
  });
  app.get('/api/v1/ledger', async (c) => {
    try {
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const units = await stub.getInstructionalUnits();
      const response: ApiResponse<InstructionalUnit[]> = {
        success: true,
        data: units
      };
      return c.json(response);
    } catch (err) {
      const failResponse: ApiResponse = { success: false, error: "Ledger access denied" };
      return c.json(failResponse, 500);
    }
  });
  app.get('/api/v1/stats', async (c) => {
    try {
      const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
      const stats = await stub.getRegistryStats();
      const response: ApiResponse = {
        success: true,
        data: stats
      };
      return c.json(response);
    } catch (err) {
      const failResponse: ApiResponse = { success: false, error: "Stats retrieval failure" };
      return c.json(failResponse, 500);
    }
  });
}