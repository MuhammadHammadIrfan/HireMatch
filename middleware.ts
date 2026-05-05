// Next.js middleware entry-point.
// The actual logic lives in proxy.ts to keep a clean separation,
// and is called "proxy" to avoid name conflicts if needed.
export { proxy as middleware, config } from './proxy';
