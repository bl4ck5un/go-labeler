import fs from 'node:fs';

import { CURSOR_UPDATE_INTERVAL, DID, FIREHOSE_URL, HOST, METRICS_PORT, PORT, WANTED_COLLECTION } from './config.js';
import { label, labelerServer } from './label.js';
import logger from './logger.js';
import { startMetricsServer } from './metrics.js';

const metricsServer = startMetricsServer(METRICS_PORT);

import express from 'express';

const app = express();
const PORT = 12001;

app.use(express.json());

app.post('/label', (req, res) => {
  const { uri, val } = req.body;
  const neg = req.body.neg ?? false; // default to false if undefined

  if (!uri || !val) {
    return res.status(400).json({ error: 'Missing required fields: uri and val' });
  }

  console.log(`Received label request:`, { uri, val, neg });

  try {
    label(uri, val, neg);
    return res.status(200).json({ status: 'ok', received: { uri, val, neg } });
  } catch (err) {
    console.error('Error in label():', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Labeler API running at http://127.0.0.1:${PORT}`);
});

labelerServer.app.listen({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    logger.error('Error starting server: %s', error);
  } else {
    logger.info(`Labeler server listening on ${address}`);
  }
});

function shutdown() {
  try {
    logger.info('Shutting down gracefully...');
    labelerServer.stop();
    metricsServer.close();
  } catch (error) {
    logger.error(`Error shutting down gracefully: ${error}`);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
