// Illustrative successful MCP responses. Keep these shapes aligned with the
// embedded tool contract when its output changes.
const toolOutputExamples = {
  'search-apps': {
    success: true,
    data: {
      items: [{
        id: 'app_slack',
        slug: 'slack',
        name: 'Slack',
        actionSlugsPreview: ['sendMessage'],
        actionsTotal: 1,
        actionsPreviewTruncated: false
      }],
      limit: 20,
      nextCursor: null
    }
  },
  'search-actions': {
    success: true,
    data: {
      items: [{ id: 'action_slack_send', slug: 'sendMessage', name: 'Send Message', operation: 'create' }],
      limit: 20,
      nextCursor: null
    }
  },
  'get-action-schema': {
    success: true,
    data: {
      app: { id: 'app_slack', slug: 'slack', name: 'Slack' },
      action: {
        id: 'action_slack_send',
        slug: 'sendMessage',
        name: 'Send Message',
        requiredArgs: [{ key: 'channel', dataType: 'string', needsResolution: true }, { key: 'text', dataType: 'string' }],
        optionalArgs: [],
        responseFields: ['ok', 'ts']
      }
    }
  },
  'list-connections': {
    success: true,
    data: [{
      connectionId: 'cred_public_1',
      appSlug: 'slack',
      appName: 'Slack',
      label: 'Team workspace',
      status: 'valid',
      connectedOn: '2026-09-01T00:00:00.000Z'
    }]
  },
  'get-connect-url': {
    success: true,
    data: {
      url: 'https://app.mindcloud.co/embedded-install#t=example-token',
      appName: 'Slack',
      expiresAt: '2026-09-28T12:15:00.000Z',
      singleUse: true
    }
  },
  'execute-actions': {
    success: true,
    data: { results: [{ ok: true, ts: '1727524800.000100' }] },
    meta: {
      totalRecords: 'Unknown',
      resultCount: 1,
      connectionId: 'cred_public_1',
      connectionLabel: 'Team workspace',
      connectionSource: 'single_valid',
      page: { size: null, returned: 1, nextCursor: null, mayHaveMore: null, stopReason: null, total: null }
    }
  },
  'query-result-set': {
    success: true,
    data: [{ id: 'row_1', name: 'Example record' }],
    meta: { matched: 1, nextCursor: null }
  },
  'resolve-lookup': {
    success: true,
    data: {
      status: 'resolved',
      nextCursor: null,
      selected: { value: 'C123', label: 'team-updates' }
    }
  }
};

export default toolOutputExamples;
