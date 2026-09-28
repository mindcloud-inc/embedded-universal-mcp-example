// The one place this demo decides "who is asking". The MindCloud end user the
// agent acts for is derived from this, never from the model, the browser, or
// tool arguments.
//
// REPLACE THIS with your real session lookup (cookie, JWT, whatever you use).
// It is the single edit that turns this demo into a multi-tenant-safe app.
export const getSessionUser = async () => {
  return { appUserId: 'demo-user-1', name: 'Demo User', email: 'demo@example.com' };
};
