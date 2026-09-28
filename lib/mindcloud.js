// Server-side MindCloud settings and API client. The API key lives only here
// (and in env): the browser and the model never see it.
const API_BASE_URL = (process.env.MINDCLOUD_API_BASE_URL || 'https://connect.mindcloud.co').replace(/\/+$/, '');

export const getApiKey = () => {
  return process.env.MINDCLOUD_API_KEY || '';
};

// One MCP server per end user: the end user id is part of the URL, so every
// tool on it is scoped to that end user and the model cannot change it.
export const getMcpUrl = (endUserId) => {
  return `${API_BASE_URL}/v2/embedded/end-users/${encodeURIComponent(endUserId)}/mcp`;
};

// Creates an embedded end user in your MindCloud organization. It needs a Full
// Access key, and it always creates a new one, so store the returned userId
// against your own user record and reuse it.
export const createEndUser = async ({ externalId, name, email }) => {
  const response = await fetch(`${API_BASE_URL}/v1/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ externalId, name, email })
  });

  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
};
