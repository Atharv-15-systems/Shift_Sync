import { Router, Request, Response } from 'express';
import { SqliteDb } from '../db/connection.js';
import { seedScenario, IndustryType, SCENARIO_CONFIGS } from '../db/scenarios.js';

export function createScenariosRouter(db: SqliteDb): Router {
  const router = Router();
  let currentIndustry: IndustryType = 'healthcare';

  // GET /api/scenarios/list
  router.get('/list', (_req: Request, res: Response) => {
    res.json({
      success: true,
      current: currentIndustry,
      scenarios: Object.values(SCENARIO_CONFIGS)
    });
  });

  // POST /api/scenarios/switch
  router.post('/switch', (req: Request, res: Response) => {
    const { industry } = req.body as { industry?: IndustryType };
    if (!industry || !SCENARIO_CONFIGS[industry]) {
      return res.status(400).json({
        success: false,
        error: `Invalid industry. Supported values: ${Object.keys(SCENARIO_CONFIGS).join(', ')}`
      });
    }

    try {
      seedScenario(db, industry);
      currentIndustry = industry;

      // Return refreshed users and current workspace
      const users = db.prepare('SELECT * FROM users').all();
      const workspace = db.prepare('SELECT * FROM workspaces LIMIT 1').get();
      const channels = db.prepare('SELECT * FROM channels').all();

      return res.json({
        success: true,
        industry: currentIndustry,
        config: SCENARIO_CONFIGS[currentIndustry],
        users,
        workspace,
        channels
      });
    } catch (err: any) {
      console.error('Scenario switch failed:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  return router;
}
