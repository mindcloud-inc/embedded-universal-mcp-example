// Shows what the agent can do right now: the tool names MindCloud MCP returns
// for the signed-in user's end user, or why there are none. It connects the
// same way the chat route does, so this list is exactly what the model gets.
import Image from 'next/image';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/ssr/CheckCircle';
import ChatClient from './ChatClient.jsx';
import Workspace from './Workspace.jsx';
import ToolsCatalog from './ToolsCatalog.jsx';
import { getSessionUser } from '../lib/session.js';
import { getMindCloudTools } from '../lib/getMindCloudTools.js';

// The tools depend on your env and on MindCloud, not on the build, so read
// them on every request.
export const dynamic = 'force-dynamic';

// What the statuses you can hit during setup mean for you. Any other code
// shows the generic sentence below; the README error table explains it.
// HTTP_<status> and MCP_CLIENT_ERROR come from lib/getMindCloudTools.js.
const STATUS_HELP = {
  NO_API_KEY: 'No MindCloud API key: the agent has no tools. Set MINDCLOUD_API_KEY in .env.local, then restart the dev server.',
  EMBEDDED_NOT_ENABLED: 'Embedded is not enabled for your MindCloud organization. Ask your MindCloud representative to enable it.',
  EMBEDDED_MCP_NOT_ENABLED: 'The Embedded MCP server is switched off for your organization. In MindCloud, turn on the "Enable MCP server for AI agents" switch on the Embedded home page.',
  API_KEY_ACCESS_DENIED: 'This API key cannot do what the agent needs. Creating an end user needs a Full Access key.',
  HTTP_401: 'MindCloud rejected the API key. Check MINDCLOUD_API_KEY.',
  MCP_CLIENT_ERROR: 'Could not load the MindCloud tools. Check MINDCLOUD_API_BASE_URL and the server log.'
};

export default async function AgentPage({ searchParams }) {
  const { tab } = await searchParams;
  const sessionUser = await getSessionUser();
  const mindcloud = await getMindCloudTools({ sessionUser });
  const tools = Object.entries(mindcloud.tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    inputSchema: tool.inputSchema.jsonSchema
  }));
  await mindcloud.close();

  const hasGatewayKey = Boolean(process.env.AI_GATEWAY_API_KEY);

  return (
    <main className="main">
      <header className="page-header">
        <h1><Image src="/mindcloud-logo.svg" width={165} height={20} alt="MindCloud" priority /><span>MCP</span></h1>
        <p>Give your AI agent access to MindCloud’s 3,400+ apps. Let customers connect their accounts right in your product, while MindCloud handles authentication and credentials behind the scenes.</p>
      </header>

      <Workspace
        initialTab={tab}
        chat={<ChatClient canChat={hasGatewayKey} />}
        toolNames={mindcloud.toolNames}
        toolStatus={mindcloud.status}
        toolStatusHelp={STATUS_HELP[mindcloud.status] || `MindCloud returned ${mindcloud.status}, so the agent has no tools.`}
        statusPanels={<>
          <div className="status-card">
            <h2>Model</h2>
            {hasGatewayKey ? (
              <p className="status-hint status-hint-success"><CheckCircleIcon size={18} weight="fill" aria-hidden="true" />AI Gateway key is set.</p>
            ) : (
              <p className="status-hint">No AI Gateway key: the chat is off. Set AI_GATEWAY_API_KEY in .env.local, then restart the dev server.</p>
            )}
          </div>

          <div className="status-card">
            <h2>Acting for</h2>
            <p className="status-hint">
              {sessionUser.name} (<code>{sessionUser.appUserId}</code>), from <code>lib/session.js</code>. Replace the stub there with your own session lookup.
            </p>
          </div>
        </>}
        tools={<ToolsCatalog tools={tools} status={mindcloud.status} statusHelp={STATUS_HELP[mindcloud.status] || `MindCloud returned ${mindcloud.status}, so the agent has no tools.`} />}
      />
    </main>
  );
}
