import 'dotenv/config';

export const DID = process.env.DID ?? '';
export const SIGNING_KEY = process.env.SIGNING_KEY ?? '';
export const HOST = process.env.HOST ?? '127.0.0.1';
export const PORT = process.env.PORT ? Number(process.env.PORT) : 4100;
export const METRICS_PORT = process.env.METRICS_PORT ? Number(process.env.METRICS_PORT) : 4101;
export const BSKY_IDENTIFIER = process.env.BSKY_IDENTIFIER ?? '';
export const BSKY_PASSWORD = process.env.BSKY_PASSWORD ?? '';
