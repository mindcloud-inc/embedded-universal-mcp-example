// The agent loop, on your server. Each request takes the chat history from the
// browser, connects to MindCloud MCP as the signed-in user's end user, and
// streams the model's answer back.
//
// The browser sends messages only. The MindCloud key stays here, and the end
// user comes from your session, so no request can choose whose tools it gets.
import { convertToModelMessages, isStepCount, streamText } from 'ai';
import { getSessionUser } from '../../../lib/session.js';
import { getMindCloudTools } from '../../../lib/getMindCloudTools.js';
import { getSystemPrompt } from '../../../lib/systemPrompt.js';

// A "provider/model" string runs through the Vercel AI Gateway, which reads
// AI_GATEWAY_API_KEY.
const MODEL = process.env.AI_MODEL || 'anthropic/claude-sonnet-5';

// Any failure in the stream (a wrong gateway key, an unknown model, a tool call
// that could not reach MindCloud) reaches the browser as this fixed text. The
// real error is logged here and never leaves the server.
const toBrowserError = (error) => {
  console.error('Chat turn failed:', error);
  return 'The agent hit an error. Check the server log.';
};

export async function POST(request) {
  const sessionUser = await getSessionUser();
  const mindcloud = await getMindCloudTools({ sessionUser });

  // A tool call the user stopped with the Stop button never gets a result.
  // Leaving it in would make every later turn fail, so drop it.
  let modelMessages;

  try {
    const { messages } = await request.json();
    modelMessages = await convertToModelMessages(messages, { tools: mindcloud.tools, ignoreIncompleteToolCalls: true });
  } catch {
    await mindcloud.close();
    return new Response('messages could not be read.', { status: 400 });
  }

  const result = streamText({
    model: MODEL,
    instructions: getSystemPrompt({ toolNames: mindcloud.toolNames }),
    messages: modelMessages,
    tools: mindcloud.tools,
    stopWhen: isStepCount(8),
    abortSignal: request.signal,
    // The MCP client stays open while the model calls tools, so close it when
    // the turn ends.
    onEnd: () => mindcloud.close()
  });

  return result.toUIMessageStreamResponse({ onError: toBrowserError });
}
