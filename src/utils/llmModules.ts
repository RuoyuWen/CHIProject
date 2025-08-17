// LLM双模块系统：LLM-A（内部逻辑）+ LLM-B（渲染交互）

interface LLMSettings {
  apiKey: string;
  chatModel: string;
  summaryModel: string;
  llmAModel: string;
  llmBModel: string;
  temperature: number;
  maxTokens: number;
  llmATemperature: number;
  llmAMaxTokens: number;
  llmBTemperature: number;
  llmBMaxTokens: number;
  llmAPrompt?: string;
  llmBPrompt?: string;
}

// 状态定义
export type SystemState = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9';

// 策略类型定义
export type StrategyName = 
  | 'seed_frame_user_led'
  | 'ask_slots_user_first' 
  | 'keep_remove_user_action'
  | 'pairwise_compare_user_vote'
  | 'last_two_soft_commit'
  | 'benefit_reframe_choice'
  | 'story_value_prompt'
  | 'bring_back_on_topic_light'
  | 'neutral_switch_brief'
  | 'lock_in_two_step'
  | 'credit_user_decision'
  | 'magician_choice';

// 维度类型
export type FrameType = 'mood' | 'lighting' | 'palette' | 'style' | 'era/region' | 'weather' | 'composition' | 'materials' | 'clutter/density' | 'story_cues';

// LLM-A 输出结构
export interface LLMAOutput {
  state: SystemState;
  frames?: FrameType[];
  target: string;
  strategies: Array<{
    name: StrategyName;
    priority: number;
    choices?: {
      keep_options?: string[];
      min_keep?: number;
      max_keep?: number;
    };
    keep?: string[];
    remove?: string[];
    spec?: Record<string, any>;
    magician?: {
      selection_pool?: string[];
      proposed_pick?: string;
      decoy_policy?: string;
      on_hit_next?: string;
      on_miss_next?: string;
    };
  }>;
  force_policy: {
    always_in_play: boolean;
    double_reject_threshold: number;
    tie_break: string;
    soft_default_to_target: boolean;
  };
  agency: {
    undo_offer?: boolean;
    offer_alternatives?: boolean;
    mirror_terms?: string[];
    credit_user?: boolean;
  };
  proposal?: string | null;
  ask_rationale?: boolean;
}

// LLM-A 系统提示词
const LLM_A_SYSTEM_PROMPT = `你是"模块A"（内部逻辑）。每一轮只输出一个最小JSON（单行），不输出任何解释或思维过程。
你的任务：
1) 基于近期对话，判定用户所处状态 S0~S9。
2) 为该状态给出2–3个"策略候选"（带 priority 1..3），并提供最少可执行信息。
3) 保持"agency-preserving force"：用户感觉自己在主导，但结构上收敛到 target。

【硬规则（Force）】
- always_in_play：除非用户连续两次明确拒绝target，target必须出现在 keep 或 pairwise 对阵中。
- last_two/对比 必含 target。
- soft_default_to_target：用户出现"都行/随便/先这样"等模糊同意时，默认收敛到 target。
- tie_break=favor_target：模糊或并列时偏向 target。

【状态集合】
S0 无偏好/模糊；S1 方向已定待细化；S2 候选过多；S3 要对比；
S4 倾向目标；S5 明确反对；S6 要记忆点/独特性；
S7 跑题；S8 僵持；S9 用户接管。

【策略集合】
seed_frame_user_led, ask_slots_user_first, keep_remove_user_action, pairwise_compare_user_vote,
last_two_soft_commit, benefit_reframe_choice, story_value_prompt,
bring_back_on_topic_light, neutral_switch_brief, lock_in_two_step, credit_user_decision,
magician_choice

【可用维度（frames，最多2个）】
mood, lighting, palette, style, era/region, weather, composition, materials, clutter/density, story_cues

【输出格式（单行JSON）】
{
  "state":"Sx",
  "frames":["...","..."],
  "target":"OldTown",
  "strategies":[
    {
      "name":"strategy_name",
      "priority":1,
      "choices":{"keep_options":["..."],"min_keep":2,"max_keep":2},
      "keep":["..."], "remove":["..."],
      "spec":{ ... },
      "magician":{"selection_pool":["..."],"proposed_pick":"...","decoy_policy":"prefer_easier_reject","on_hit_next":"...","on_miss_next":"..."}
    }
  ],
  "force_policy":{"always_in_play":true,"double_reject_threshold":2,"tie_break":"favor_target","soft_default_to_target":true},
  "agency":{"undo_offer":true,"offer_alternatives":true,"mirror_terms":["..."],"credit_user":true},
  "proposal":null | "OldTown",
  "ask_rationale":false | true
}`;

// LLM-B 系统提示词
const LLM_B_SYSTEM_PROMPT = `你是"模块B"（渲染/对话）。输入是一段来自模块A的JSON。你只输出给用户看的1–2句中文，不输出任何JSON或解释。
目标：保持委婉、启发式、用户主导感（agency），并按A给定的策略优先级推进到目标。

【口风规范】
- 背景式引入+启发式提问，避免命令式。
- 多用：你更倾向/要不要/会不会/先感受一下/如果之后觉得不合适也可以再改。
- 需要时加入"可撤销"（若 agency.undo_offer=true）。
- 若有 agency.mirror_terms，将其自然嵌入句中；锁定时归功用户（agency.credit_user=true）。

【术语映射】
mood=气氛；lighting=光照；palette=配色；style=风格；era_region=年代/地域线索；story_cues=叙事物件；composition=构图/主视点。

【策略→委婉模板】（按 strategies[*].priority 依次尝试）
- magician_choice：我在想，{frames[0]}在这个环境里可能更直观。既然这些你都觉得不错，要不要先按「{magician.proposed_pick}」感受一下，看画面是不是更贴近你的感觉？如果之后觉得不合适，也可以再改。

- seed_frame_user_led：我觉得在一个环境里，{frames[0]}可能更关键。你会更想先从哪一方面入手？如果想换，我们也可以随时调整。

- ask_slots_user_first：方向基本有了。细节还是你来定：在{frames[0]}上，你更想用哪些要素？我按你的词出一版，如果不合适再改。

- keep_remove_user_action：从这些方向里看，{frames[0]}会更好分辨。你觉得哪两个更贴合你的想法？之后不合适也可以再调整。

- pairwise_compare_user_vote：如果只看{frames[0]}，「{keep[0]}」和「{keep[1]}」各有特点。你会更偏向哪一边呢？后面想换也没问题。

- last_two_soft_commit：看起来现在只剩下「{keep[0]}」和「{keep[1]}」。要不要先暂定一个，等看到效果再说？不合适我们再回退。

- benefit_reframe_choice：你提到的顾虑我理解。换个角度试试：比如给「{target}」加上不同的元素，或你也可以直接给一个更合适的元素，我们按你的词来。

- lock_in_two_step：听起来你更倾向「{proposal}」，那我们可以先按这个来。这是你的选择；如果之后想调整也完全没问题。

仅输出1–2句中文，不加emoji、不暴露"内部/策略/JSON"。`;

// 调用 LLM-A（内部逻辑模块）
export async function callLLMA(conversationHistory: any[], target: string, settings: LLMSettings): Promise<LLMAOutput> {
  try {
    // 构建对话历史摘要
    const recentMessages = conversationHistory.slice(-6); // 取最近6条消息
    const conversationSummary = recentMessages
      .map(msg => `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`)
      .join('\n');

    const prompt = `基于以下对话历史，分析用户状态并生成策略JSON：

目标场景：${target}

近期对话：
${conversationSummary}

请输出单行JSON：`;

    const systemPrompt = settings.llmAPrompt || LLM_A_SYSTEM_PROMPT;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.llmAModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: settings.llmATemperature,
        max_tokens: settings.llmAMaxTokens,
        top_p: 0.9,
        stop: ['\n}', '\n']
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM-A API error: ${response.status}`);
    }

    const data = await response.json();
    const jsonResponse = data.choices[0]?.message?.content?.trim();

    if (!jsonResponse) {
      throw new Error('Empty response from LLM-A');
    }

    // 尝试解析JSON，如果失败则使用fallback
    try {
      const parsed = JSON.parse(jsonResponse + (jsonResponse.endsWith('}') ? '' : '}'));
      return parsed as LLMAOutput;
    } catch (parseError) {
      console.warn('LLM-A JSON parse error, using fallback:', parseError);
      return createFallbackLLMAOutput(target);
    }

  } catch (error) {
    console.error('LLM-A error:', error);
    return createFallbackLLMAOutput(target);
  }
}

// 调用 LLM-B（渲染交互模块）
export async function callLLMB(llmaOutput: LLMAOutput, settings: LLMSettings): Promise<string> {
  try {
    const prompt = `根据以下策略JSON，生成1-2句委婉的中文对话：

${JSON.stringify(llmaOutput)}

请输出自然的中文对话：`;

    const systemPrompt = settings.llmBPrompt || LLM_B_SYSTEM_PROMPT;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.llmBModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: settings.llmBTemperature,
        max_tokens: settings.llmBMaxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM-B API error: ${response.status}`);
    }

    const data = await response.json();
    const response_text = data.choices[0]?.message?.content?.trim();

    if (!response_text) {
      throw new Error('Empty response from LLM-B');
    }

    return response_text;

  } catch (error) {
    console.error('LLM-B error:', error);
    return createFallbackLLMBOutput(llmaOutput);
  }
}

// 双模块处理管道
export async function processDualLLM(conversationHistory: any[], target: string, settings: LLMSettings) {
  try {
    // Step 1: 调用 LLM-A 进行状态分析和策略规划
    const llmaOutput = await callLLMA(conversationHistory, target, settings);
    
    // Step 2: 调用 LLM-B 进行对话渲染
    const llmbOutput = await callLLMB(llmaOutput, settings);

    return {
      analysis: llmaOutput,
      response: llmbOutput,
      success: true
    };

  } catch (error) {
    console.error('Dual LLM pipeline error:', error);
    return {
      analysis: createFallbackLLMAOutput(target),
      response: '我们继续聊聊这个场景设计吧，你有什么想法？',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fallback 函数
function createFallbackLLMAOutput(target: string): LLMAOutput {
  return {
    state: 'S0',
    frames: ['mood', 'lighting'],
    target,
    strategies: [
      {
        name: 'seed_frame_user_led',
        priority: 1
      }
    ],
    force_policy: {
      always_in_play: true,
      double_reject_threshold: 2,
      tie_break: 'favor_target',
      soft_default_to_target: true
    },
    agency: {
      undo_offer: true,
      offer_alternatives: true,
      credit_user: true
    }
  };
}

function createFallbackLLMBOutput(llmaOutput: LLMAOutput): string {
  const frames = llmaOutput.frames?.join('和') || '设计要素';
  return `我们来聊聊${frames}方面的想法吧，你更倾向于什么样的感觉？`;
}

// 状态和策略的中文描述
export const STATE_DESCRIPTIONS: Record<SystemState, string> = {
  'S0': '无偏好/模糊',
  'S1': '方向已定待细化',
  'S2': '候选过多',
  'S3': '要对比',
  'S4': '倾向目标',
  'S5': '明确反对', 
  'S6': '要记忆点/独特性',
  'S7': '跑题',
  'S8': '僵持',
  'S9': '用户接管'
};

export const STRATEGY_DESCRIPTIONS: Record<StrategyName, string> = {
  'seed_frame_user_led': '用户主导框架建立',
  'ask_slots_user_first': '询问用户优先细节',
  'keep_remove_user_action': '用户主导筛选保留',
  'pairwise_compare_user_vote': '用户投票对比选择',
  'last_two_soft_commit': '软性确认最后两项',
  'benefit_reframe_choice': '优势重构选择',
  'story_value_prompt': '故事价值提示',
  'bring_back_on_topic_light': '轻松拉回主题',
  'neutral_switch_brief': '中性快速切换',
  'lock_in_two_step': '两步锁定确认',
  'credit_user_decision': '归功用户决策',
  'magician_choice': '魔术师选择'
};
