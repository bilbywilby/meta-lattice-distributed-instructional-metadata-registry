import { Hono } from "hono";
import { Env } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/health', (c) => {
    return c.json({ 
      success: true, 
      data: { status: 'operational', system: 'TheValleyHub_V5' } 
    });
  });
  app.get('/api/ping', (c) => c.json({ success: true }));
}