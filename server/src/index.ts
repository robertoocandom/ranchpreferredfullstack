import app from './app';
import { config } from './config';
import { startOdooScheduler } from './odoo/scheduler';

app.listen(config.port, () => {
  console.log(`Ranch Preferred API listening on http://localhost:${config.port}`);
  startOdooScheduler();
});
