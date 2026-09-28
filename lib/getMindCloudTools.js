// Connects the agent to MindCloud MCP as ONE end user and returns the tools it
// may use. The end user comes from your session through the store, never from
// the model, the browser, or tool arguments.
//
// It never throws: any failure returns zero tools and a status code the page
// can show, so a broken setup reads as "no tools" instead of a crashed chat.
import { createMCPClient } from '@ai-sdk/mcp';
import { getApiKey, getMcpUrl } from './mindcloud.js';
import { forgetEndUserId, getOrCreateEndUserId } from './endUserStore.js';

const noTools = (status) => ({ tools: {}, toolNames: [], status, close: async () => {} });

const connect = async ({ apiKey, endUserId }) => {
  let client = null;

  try {
    client = await createMCPClient({
      transport: {
        type: 'http',
        url: getMcpUrl(endUserId),
        headers: { Authorization: `Bearer ${apiKey}` }
      },
      // MindCloud MCP uses the initialize handshake. Skipping the newer
      // server/discover probe saves one failed request per chat turn.
      protocolVersionDiscovery: false,
      clientName: 'mindcloud-embedded-mcp-example'
    });

    const tools = await client.tools();
    return { tools, toolNames: Object.keys(tools), status: 'OK', close: () => client.close() };
  } catch (error) {
    await client?.close().catch(() => {});

    // A rejected MCP request carries the HTTP status and MindCloud's JSON
    // error body on the thrown error. Any other failure is MCP_CLIENT_ERROR.
    let status = error?.statusCode ? `HTTP_${error.statusCode}` : 'MCP_CLIENT_ERROR';

    try {
      status = JSON.parse(error.responseBody).error.code || status;
    } catch {
      // Not a MindCloud error body: keep the HTTP status.
    }

    console.error(`MindCloud MCP is unavailable (${status}):`, error?.message);
    return noTools(status);
  }
};

// sessionUser must come from getSessionUser() in lib/session.js.
export const getMindCloudTools = async ({ sessionUser }) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    return noTools('NO_API_KEY');
  }

  try {
    const stored = await getOrCreateEndUserId(sessionUser);

    if (stored.error) {
      return noTools(stored.error);
    }

    const connected = await connect({ apiKey, endUserId: stored.endUserId });

    // Only END_USER_NOT_FOUND means MindCloud has no such end user in this
    // key's organization, for example after you switch to a key from another
    // organization. POST /v1/users always creates a new end user, so any other
    // failure (a wrong base URL, an outage, a rate limit) must not create one.
    if (connected.status !== 'END_USER_NOT_FOUND') {
      return connected;
    }

    await forgetEndUserId(sessionUser.appUserId);
    const recreated = await getOrCreateEndUserId(sessionUser);

    if (recreated.error) {
      return noTools(recreated.error);
    }

    return connect({ apiKey, endUserId: recreated.endUserId });
  } catch (error) {
    console.error('Could not load the MindCloud tools (MCP_CLIENT_ERROR):', error?.message);
    return noTools('MCP_CLIENT_ERROR');
  }
};
