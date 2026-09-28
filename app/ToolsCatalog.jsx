import ToolBrowser from './ToolBrowser.jsx';
import ToolDetails from './ToolDetails.jsx';
import toolOutputExamples from './toolOutputExamples.js';

const TOOL_GUIDE = {
  'search-apps': { group: 'Discover', summary: 'Find published apps and preview their actions.' },
  'search-actions': { group: 'Discover', summary: 'Find actions in one published app.' },
  'get-action-schema': { group: 'Discover', summary: 'Read the inputs and outputs of one action.' },
  'list-connections': { group: 'Connect', summary: 'List this end user’s connected accounts.' },
  'get-connect-url': { group: 'Connect', summary: 'Get a single-use link to connect or repair an account.' },
  'execute-actions': { group: 'Run', summary: 'Run one or more actions on connected accounts.' },
  'query-result-set': { group: 'Run', summary: 'Search, filter, or summarize a stored action result.' },
  'resolve-lookup': { group: 'Run', summary: 'Find the ID an action argument needs.' }
};

const GROUPS = [
  { name: 'Discover', hint: 'Find an app, then inspect the action you want to use.' },
  { name: 'Connect', hint: 'See which accounts this end user can use or get a connection link.' },
  { name: 'Run', hint: 'Call actions and work with their results.' },
  { name: 'Other', hint: 'Tools added by the MCP server.' }
];

export default function ToolsCatalog({ tools, status, statusHelp }) {
  const groups = GROUPS.map((group) => ({
    ...group,
    tools: tools
      .filter((tool) => (TOOL_GUIDE[tool.name]?.group || 'Other') === group.name)
      .map((tool) => {
        const guide = TOOL_GUIDE[tool.name] || { summary: 'Inspect this tool’s live definition.' };
        return {
          name: tool.name,
          summary: guide.summary,
          details: <ToolDetails tool={tool} outputExample={toolOutputExamples[tool.name]} />
        };
      })
  })).filter((group) => group.tools.length > 0);

  return <ToolBrowser groups={groups} status={status} statusHelp={statusHelp} />;
}
