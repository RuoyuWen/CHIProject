import OpenAI from 'openai';

export async function sendMessage(
  messages: Array<{role: string, content: string}>,
  settings: {
    apiKey: string;
    chatModel: string;
    summaryModel: string;
    language: string;
    temperature: number;
    maxTokens: number;
    downloadPath: string;
    scenePrompt: string;
    llmAPrompt: string;
    llmBPrompt: string;
    summaryPrompt: string;
    targetScene: string;
    finalTask: string;
    aiMode: string;
  } | null,
  useModel: 'chat' | 'summary' = 'chat'
) {
  // Check if settings exist
  if (!settings || !settings.apiKey) {
    throw new Error('Please configure OpenAI API key first');
  }

  // Check API key format
  if (!settings.apiKey.startsWith('sk-')) {
    throw new Error('API key format is incorrect, should start with sk-');
  }

  const openai = new OpenAI({
    apiKey: settings.apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    const selectedModel = useModel === 'chat' ? settings.chatModel : settings.summaryModel;
    const response = await openai.chat.completions.create({
      model: selectedModel,
      messages: messages as any,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Provide more friendly error messages
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        throw new Error('❌ Invalid API key, please check if your OpenAI API key is correct');
      } else if (error.message.includes('429')) {
        throw new Error('⏰ API rate limit exceeded, please try again later');
      } else if (error.message.includes('insufficient_quota')) {
        throw new Error('💳 Insufficient API quota, please check your OpenAI account balance');
      } else if (error.message.includes('model_not_found')) {
        throw new Error('🤖 Selected model is not available, please try another model');
      }
    }
    
    throw error;
  }
}

export async function analyzeContentIntent(
  messages: Array<{role: string, content: string}>,
  contentType: string,
  settings: {
    apiKey: string;
    chatModel: string;
    summaryModel: string;
    language: string;
    temperature: number;
    maxTokens: number;
    downloadPath: string;
    scenePrompt: string;
    llmAPrompt: string;
    llmBPrompt: string;
    summaryPrompt: string;
    targetScene: string;
    finalTask: string;
    aiMode: string;
  } | null
): Promise<{
  shouldUse: boolean;
  summary: string;
  confidence: number;
}> {
  if (!settings || !settings.apiKey) {
    return {
      shouldUse: false,
      summary: '',
      confidence: 0
    };
  }

  const openai = new OpenAI({
    apiKey: settings.apiKey,
    dangerouslyAllowBrowser: true
  });

  try {
    const analysisPrompt = `
分析以下对话，判断用户是否想要使用讨论的内容作为${contentType}。

对话内容：
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

请以JSON格式回复：
{
  "shouldUse": boolean, // 用户是否想要使用这个内容
  "summary": "string", // 对话内容的简洁总结（50字以内）
  "confidence": number // 置信度（0-1）
}

判断标准：
- 用户明确表达想要使用某个想法或概念
- 用户对某个描述表示满意或认可
- 用户说"就用这个"、"好的"、"可以"等确认词汇
- 置信度应该基于用户表达的明确程度
`;

    const response = await openai.chat.completions.create({
      model: settings.summaryModel,
      messages: [
        { role: "user", content: analysisPrompt }
      ],
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
      shouldUse: result.shouldUse || false,
      summary: result.summary || '',
      confidence: result.confidence || 0
    };
  } catch (error) {
    console.error('Content analysis error:', error);
    return {
      shouldUse: false,
      summary: '',
      confidence: 0
    };
  }
} 