// express/server.js
// Local runner for development only. This file intentionally does NOT run
// on import; it only starts the server when invoked directly. This keeps
// the module safe to require in serverless environments while allowing a
// convenient local startup with basic logging of startup errors.
//
// NOTE: As of now, this file does not start an Express HTTP server for local development.
// To prevent accidental runs and to remove custom servers (the project uses Next App Router),
// the runner has been neutralized. Start the Next dev server with `npm run dev` instead.

const logger = require('../lib/logger')

try {
	// Defer require so that importing this file does not trigger app init.
	const app = require('./app')

	// Only start the server when this file is executed directly.
	if (require.main === module) {
		const port = process.env.PORT || 3001
		const server = app.listen(port, () => {
			logger.info(`Express local server listening on ${port}`)
		})

		server.on('error', (err) => {
			logger.error('Failed to start local Express server', { message: err && err.message })
			process.exit(1)
		})
	}
} catch (err) {
	// If initialization fails, log the failure. If we were invoked directly
	// exit with non-zero so local runs surface the error.
	logger.error('Failed to initialize Express app in local runner', { message: err && err.message })
	if (require.main === module) process.exit(1)
}
