import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, MetadataEntity, RegistryStats } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/registry/stats', async (c) => {
    const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
    const data = await stub.getRegistryStats();
    return c.json({ success: true, data } satisfies ApiResponse<RegistryStats>);
  });
  app.get('/api/registry/entities', async (c) => {
    const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
    const data = await stub.getEntities();
    return c.json({ success: true, data } satisfies ApiResponse<MetadataEntity[]>);
  });
  app.post('/api/registry/entities', async (c) => {
    const body = await c.req.json();
    const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
    const data = await stub.addEntity(body);
    return c.json({ success: true, data } satisfies ApiResponse<MetadataEntity>);
  });
  app.delete('/api/registry/entities/:id', async (c) => {
    const id = c.req.param('id');
    const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
    const data = await stub.deleteEntity(id);
    return c.json({ success: true, data } satisfies ApiResponse<boolean>);
  });
}