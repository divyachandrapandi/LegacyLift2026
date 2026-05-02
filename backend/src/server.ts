import 'dotenv/config';
import app from './app';

const PORT = process.env.PORT || 3000;

/**
 * Starts the LegacyLift backend HTTP server.
 *
 * Description:
 * - Boots the Express app on configured port for API access.
 * - Exists as the runtime entrypoint used in local and deployed environments.
 *
 * Example input:
 * - `PORT=3000` in environment.
 *
 * Example output:
 * - Console log: `LegacyLift backend running on port 3000`.
 *
 * Usage in project:
 * - Invoked by backend start scripts to serve `/health` and `/api/analyze`.
 */
app.listen(PORT, () => {
  console.log(`🚀 LegacyLift backend running on port ${PORT}`);
});