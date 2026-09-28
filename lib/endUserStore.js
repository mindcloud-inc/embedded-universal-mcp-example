// Stands in for your database: a real app stores the MindCloud end user id as
// a column on its own users table. This demo keeps it in data/end-users.json so
// a restart does not create duplicate end users.
//
// POST /v1/users always creates a new end user, so two first requests for the
// same user must share one create call. This demo does that in memory, for one
// server process. In your app, lock the user's row around the create call; a
// conditional update alone keeps one id but leaves an unused end user behind.
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { createEndUser } from './mindcloud.js';

const STORE_PATH = path.join(process.cwd(), 'data', 'end-users.json');

// appUserId -> the lookup (and create, when needed) that is running for it.
const inFlight = new Map();

// A missing file means no end users yet. Any other failure stops here: reading
// a broken file as empty would create a second end user for the same person.
const readStore = async () => {
  try {
    return JSON.parse(await fs.readFile(STORE_PATH, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
};

const writeStore = async (store) => {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
};

const readOrCreate = async ({ appUserId, name, email }) => {
  const store = await readStore();

  if (store[appUserId]) {
    return { endUserId: store[appUserId] };
  }

  const created = await createEndUser({ externalId: appUserId, name, email });
  const endUserId = created.body?.data?.userId;

  if (!endUserId) {
    return { error: created.body?.error?.code || `HTTP_${created.status}` };
  }

  store[appUserId] = endUserId;
  await writeStore(store);

  return { endUserId };
};

// Returns { endUserId } or { error }.
export const getOrCreateEndUserId = ({ appUserId, name, email }) => {
  if (!inFlight.has(appUserId)) {
    inFlight.set(appUserId, readOrCreate({ appUserId, name, email }).finally(() => inFlight.delete(appUserId)));
  }

  return inFlight.get(appUserId);
};

// Drops a stored id that MindCloud reported as END_USER_NOT_FOUND, so the next
// getOrCreateEndUserId creates a new end user.
export const forgetEndUserId = async (appUserId) => {
  const store = await readStore();
  delete store[appUserId];
  await writeStore(store);
};
