const API_BASE_URL = 'https://connect.mindcloud.co';
const snippetText = (lines) => lines.map((line) => line.map(([value]) => value).join('')).join('\n');

export const SETUP_STEPS = [
  {
    title: 'Create an API key',
    paragraphs: [
      'Create a **Full Access** MindCloud API key. Your server needs it to create end users and give your agent every MCP tool.',
      'Store the key on your server as `MINDCLOUD_API_KEY`. It can access your whole organization. Never put it in a browser, mobile app, or model prompt.'
    ],
    link: { label: 'Open API Keys', href: 'https://app.mindcloud.co/user/api-keys' }
  },
  {
    title: 'Create an end user',
    paragraphs: [
      'On your server, create one MindCloud end user for each signed-in user of your app. Use your stable user ID as `externalId`.',
      'Store the returned `userId` on your user record and reuse it. Each call creates a new end user. If MCP returns `END_USER_NOT_FOUND`, check the stored ID and organization before creating another user.'
    ],
    snippetLines: [
      [['curl', 'command'], [' -X ', 'option'], ['POST', 'method'], [' '], [`${API_BASE_URL}/v1/users`, 'url'], [' \\']],
      [['  '], ['-H', 'option'], [' "'], ['Authorization', 'header'], [': Bearer '], ['$MINDCLOUD_API_KEY', 'variable'], ['" \\']],
      [['  '], ['-H', 'option'], [' "'], ['Content-Type', 'header'], [': application/json" \\']],
      [['  '], ['-d', 'option'], [" '{ "], ['"externalId"', 'key'], [': '], ['"<your-app-user-id>"', 'string'], [', '], ['"name"', 'key'], [': '], ['"Jane Doe"', 'string'], [', '], ['"email"', 'key'], [': '], ['"jane@example.com"', 'string'], [" }'"]]
    ],
    snippetLanguage: 'bash'
  },
  {
    title: 'Connect your agent',
    paragraphs: [
      'Connect your **server-side MCP client** to the URL below with Streamable HTTP and your API key. Replace `{endUserId}` with the stored MindCloud `userId` for the signed-in user.',
      'Resolve the end user from your server session. Never accept that ID from the browser, model, or tool arguments. If you use a hosted MCP connector, give it a separate key with the lowest access level its tools need.'
    ],
    snippetLines: [
      [[`${API_BASE_URL}/v2/embedded/end-users/{endUserId}/mcp`, 'url']],
      [['Authorization', 'header'], [': Bearer '], ['$MINDCLOUD_API_KEY', 'variable']]
    ],
    snippetLanguage: 'text'
  },
  {
    title: 'Test your setup',
    paragraphs: [
      'List the tools available to that end user. The key’s access level determines which tools appear. Replace `{endUserId}` with a real stored MindCloud user ID before you run this command.',
      'Then call `get-connect-url` for an app, show its URL exactly as returned to the same user, and confirm the connection with `list-connections`.'
    ],
    snippetLines: [
      [['curl', 'command'], [' -X ', 'option'], ['POST', 'method'], [' '], [`${API_BASE_URL}/v2/embedded/end-users/{endUserId}/mcp`, 'url'], [' \\']],
      [['  '], ['-H', 'option'], [' "'], ['Authorization', 'header'], [': Bearer '], ['$MINDCLOUD_API_KEY', 'variable'], ['" \\']],
      [['  '], ['-H', 'option'], [' "'], ['Content-Type', 'header'], [': application/json" \\']],
      [['  '], ['-H', 'option'], [' "'], ['Accept', 'header'], [': application/json, text/event-stream" \\']],
      [['  '], ['-d', 'option'], [" '{ "], ['"jsonrpc"', 'key'], [': '], ['"2.0"', 'string'], [', '], ['"id"', 'key'], [': '], ['1', 'number'], [', '], ['"method"', 'key'], [': '], ['"tools/list"', 'string'], [" }'"]]
    ],
    snippetLanguage: 'bash'
  }
];

export const SETUP_INSTRUCTIONS_MARKDOWN = [
  '# Set up MindCloud Embedded MCP for my app',
  'Implement these steps in my app. Keep the MindCloud API key and MCP client on my server. Use the signed-in app user for each request.',
  ...SETUP_STEPS.map((step, index) => [
    `## ${index + 1}. ${step.title}`,
    ...step.paragraphs,
    step.snippetLines ? `\`\`\`${step.snippetLanguage}\n${snippetText(step.snippetLines)}\n\`\`\`` : null,
    step.link ? `[${step.link.label}](${step.link.href})` : null
  ].filter(Boolean).join('\n\n'))
].join('\n\n');
