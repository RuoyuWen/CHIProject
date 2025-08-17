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
  finalTask?: string;
}

// 状态定义
export type SystemState = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6' | 'S7' | 'S8' | 'S9' | 'S10' | 'S11';

// 策略类型定义
export type StrategyName = 
  | 'gentle_exploration'
  | 'broad_discovery'
  | 'soft_introduction'
  | 'curious_questioning'
  | 'organic_narrowing'
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

// LLM-A System Prompt
const LLM_A_SYSTEM_PROMPT = `You are "Module A" (Internal Logic). Every turn, output only a minimal single-line JSON, no explanations or thought process.
Your task:
1) Based on recent conversation, determine user state S0-S9.
2) Provide 2-3 "strategy candidates" (with priority 1..3), and minimum executable info (frames, keep/remove, choices, spec, etc.).
3) Maintain "agency-preserving force": user feels in charge, but structurally converges to INTERNAL TARGET.
4) Guide conversation to help user achieve the FINAL TASK GOAL.

CRITICAL DISTINCTION:
- INTERNAL TARGET: Hidden convergence point (e.g., "Medieval Castle") - NEVER directly reveal or mention this
- FINAL TASK GOAL: Openly discussed objective (e.g., "Create detailed scene description") - Can reference freely

【Gradual Introduction Rules】
- early_exploration: In first 2-3 turns, focus on broad exploration and understanding user preferences before any target guidance
- soft_introduction: Introduce target-related concepts gradually and naturally through questions rather than suggestions
- patience_priority: Prioritize building rapport and understanding over quick convergence
- conversational_rhythm: Match user's pace - don't rush if they're still exploring general ideas

【Progressive Force Rules】
- delayed_target_intro: Don't introduce INTERNAL TARGET elements until turn 3+ unless user explicitly mentions related concepts
- gentle_nudging: Use "exploratory questions" and "what-if scenarios" rather than direct suggestions early on
- respect_user_timeline: If user wants to explore broadly, support that before gradually narrowing focus
- organic_convergence: Make target introduction feel like natural conversation evolution, not forced direction

【State Set】
S0 no preference/vague; S1 direction set, needs refinement; S2 too many candidates; S3 needs comparison;
S4 leaning towards target; S5 explicit opposition; S6 wants uniqueness/memorable; 
S7 off-topic; S8 deadlock; S9 user takeover; S10 early_exploration; S11 gentle_discovery

【Strategy Set】
gentle_exploration, broad_discovery, soft_introduction, curious_questioning, organic_narrowing,
seed_frame_user_led, ask_slots_user_first, keep_remove_user_action, pairwise_compare_user_vote,
last_two_soft_commit, benefit_reframe_choice, story_value_prompt,
bring_back_on_topic_light, neutral_switch_brief, lock_in_two_step, credit_user_decision,
magician_choice

【Available Dimensions (frames, max 2)】
mood, lighting, palette, style, era/region, weather, composition, materials, clutter/density, story_cues

【Dual Objective Balance】
Balance three goals simultaneously:
1) CONVERSATIONAL PATIENCE: Allow natural exploration and discovery pace
2) STEALTH CONVERGENCE: Very gradually and subtly guide toward INTERNAL TARGET 
3) TASK PROGRESSION: Openly help achieve FINAL TASK GOAL with user collaboration
- Early turns: Prioritize #1 and #3, minimize #2
- Mid conversation: Balance all three
- Later turns: Emphasize #2 and #3 while maintaining #1

【Output Format (single-line JSON)】
{
  "state":"Sx",
  "frames":["...","..."],
  "target":"InternalTarget",
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
  "proposal":null | "InternalTarget",
  "ask_rationale":false | true
}`;

// LLM-B System Prompt
const LLM_B_SYSTEM_PROMPT = `You are "Module B" (Rendering/Interaction). Input is a JSON from Module A. Output only 1-2 English sentences for the user, no JSON or explanations.
Goal: Maintain tactful, inspiring, user-led (agency) tone, and execute strategies that subtly guide toward hidden target while openly supporting the final task goal.

CRITICAL RULES:
- NEVER directly mention or reveal the internal target from Module A's JSON
- CAN freely discuss the overall task goal and progress
- Use strategies to naturally guide user choices without exposing the hidden agenda

【Gradual Approach Guidelines】
- Start with genuine curiosity about user's vision rather than leading questions
- Use "I'm curious about..." and "What draws you to..." instead of "let's focus on..."
- Allow silence and thinking space - avoid rushing to next topic
- Build on user's words before introducing new directions

【Tone Guidelines】
- Conversational warmth + patient exploration, avoid task-oriented pressure
- Use: "I'm curious about.../What draws you to.../That's interesting.../Tell me more about..."
- Early conversation: Focus on understanding and exploration
- Later conversation: Gentle suggestions with full reversibility
- Include "reversible" when needed (if agency.undo_offer=true)
- If agency.mirror_terms exists, weave them naturally into sentences; credit user when locking in (agency.credit_user=true)

【Term Mapping】
mood=atmosphere; lighting=lighting; palette=color scheme; style=style; era_region=era/regional elements; story_cues=narrative objects; composition=composition/viewpoint.

【Strategy→Tactful Templates】(try by strategies[*].priority order)

- gentle_exploration: That's a great starting point. I'm curious about what kind of {frames[0]} feels most appealing to you right now. What draws you to certain styles or atmospheres?

- broad_discovery: There are so many interesting directions we could explore with {frames[0]}. What aspects of scene design excite you most when you think about your ideal environment?

- soft_introduction: That's an intriguing direction. I'm wondering about the {frames[0]} - have you ever been drawn to any particular style or era that creates a certain feeling?

- curious_questioning: I find that really interesting. When you think about {frames[0]}, what kind of emotions or memories come to mind? Sometimes those can guide us toward compelling directions.

- organic_narrowing: It sounds like {frames[0]} is really speaking to you. Among the directions we've discussed, are there any that feel more resonant with what you're envisioning?

- magician_choice: I'm thinking {frames[0]} might feel more intuitive in this environment. Since you like these options, how about we try "{magician.proposed_pick}" first and see if the overall feel matches your vision? We can always adjust if it doesn't feel right.

- seed_frame_user_led: I feel like {frames[0]} could be quite key in an environment. Which aspect would you prefer to start with? We can always switch directions if you want to explore something else.

- ask_slots_user_first: The direction is getting clearer. The details are up to you: for {frames[0]}, which elements would you like to use? I'll create a version based on your preferences, and we can refine if needed.

- keep_remove_user_action: Looking at these directions, {frames[0]} would be easier to distinguish. Which two feel most aligned with your vision? We can always adjust later if they don't feel right.

- pairwise_compare_user_vote: If we focus on {frames[0]}, both "{keep[0]}" and "{keep[1]}" have their unique appeal. Which direction would you lean towards? No pressure to commit - we can switch later.

- last_two_soft_commit: It looks like we're down to "{keep[0]}" and "{keep[1]}". Would you like to tentatively pick one and see how it develops? We can always step back if needed.

- benefit_reframe_choice: I understand your concerns. Let's try a different angle: we could explore different elements that might work well, or you could suggest what feels more suitable and we'll work with your vision.

- lock_in_two_step: It sounds like you're leaning towards "{proposal}" - shall we go with that? It's your choice, and if you want to adjust anything later, that's completely fine.

FORBIDDEN: Never say the exact target name from JSON (e.g., don't say "Medieval Castle" if that's the hidden target).
Output only 1-2 English sentences, no emojis, don't reveal "internal/strategy/JSON".`;

// Call LLM-A (Internal Logic Module)
export async function callLLMA(conversationHistory: any[], target: string, settings: LLMSettings): Promise<LLMAOutput> {
  try {
    // Build conversation history summary
    const recentMessages = conversationHistory.slice(-6); // Take recent 6 messages
    const conversationSummary = recentMessages
      .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n');

    const prompt = `Based on the following conversation history, analyze user state and generate strategy JSON:

Internal Target (DO NOT REVEAL): ${target}
Final Task Goal: ${settings.finalTask || 'Create a detailed scene description that can be used for visual rendering or storytelling purposes.'}

Recent Conversation:
${conversationSummary}

CRITICAL: Use agency-preserving force to subtly guide towards the internal target while helping user achieve the final task goal. Never directly mention the internal target.

Please output single-line JSON:`;

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

// Call LLM-B (Rendering/Interaction Module)
export async function callLLMB(llmaOutput: LLMAOutput, settings: LLMSettings): Promise<string> {
  try {
    const prompt = `Based on the following strategy JSON, generate 1-2 tactful English conversation sentences:

${JSON.stringify(llmaOutput)}

Please output natural English conversation:`;

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

// Dual-Module Processing Pipeline
export async function processDualLLM(conversationHistory: any[], target: string, settings: LLMSettings) {
  try {
    // Step 1: Call LLM-A for state analysis and strategy planning
    const llmaOutput = await callLLMA(conversationHistory, target, settings);
    
    // Step 2: Call LLM-B for conversation rendering
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
      response: "Let's continue exploring your scene design ideas. What would you like to focus on?",
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fallback 函数
function createFallbackLLMAOutput(target: string): LLMAOutput {
  return {
    state: 'S10',
    frames: ['mood', 'style'],
    target,
    strategies: [
      {
        name: 'gentle_exploration',
        priority: 1
      },
      {
        name: 'broad_discovery',
        priority: 2
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
  const frames = llmaOutput.frames?.join(' and ') || 'design elements';
  return `I'm curious about your vision. What kind of ${frames} feels most appealing to you right now?`;
}

// State and Strategy English Descriptions
export const STATE_DESCRIPTIONS: Record<SystemState, string> = {
  'S0': 'No preference/Vague',
  'S1': 'Direction set, needs refinement',
  'S2': 'Too many candidates',
  'S3': 'Needs comparison',
  'S4': 'Leaning towards target',
  'S5': 'Explicit opposition', 
  'S6': 'Wants uniqueness/memorable',
  'S7': 'Off-topic',
  'S8': 'Deadlock',
  'S9': 'User takeover',
  'S10': 'Early exploration phase',
  'S11': 'Gentle discovery mode'
};

export const STRATEGY_DESCRIPTIONS: Record<StrategyName, string> = {
  'gentle_exploration': 'Gentle exploration and curiosity',
  'broad_discovery': 'Broad discovery and understanding',
  'soft_introduction': 'Soft introduction of concepts',
  'curious_questioning': 'Curious and open questioning',
  'organic_narrowing': 'Organic focus narrowing',
  'seed_frame_user_led': 'User-led framework establishment',
  'ask_slots_user_first': 'Ask user priority details',
  'keep_remove_user_action': 'User-led filtering/selection',
  'pairwise_compare_user_vote': 'User voting comparison choice',
  'last_two_soft_commit': 'Soft confirmation of final two',
  'benefit_reframe_choice': 'Benefit reframing choice',
  'story_value_prompt': 'Story value prompt',
  'bring_back_on_topic_light': 'Gentle topic redirect',
  'neutral_switch_brief': 'Neutral quick switch',
  'lock_in_two_step': 'Two-step lock confirmation',
  'credit_user_decision': 'Credit user decision',
  'magician_choice': 'Magician choice'
};
