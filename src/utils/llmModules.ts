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
const LLM_B_SYSTEM_PROMPT = `You are "Module B" (Rendering/Interaction). Input is a JSON from Module A. Output only 1-2 SHORT, ENGAGING English sentences for the user, no JSON or explanations.
Goal: Keep it brief, fun, and user-led while subtly guiding toward hidden target. Think casual conversation, not formal interview.

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
- Keep responses brief, engaging, and conversational (1-2 short sentences max)
- Use simple, relatable language - avoid technical jargon
- Add subtle humor or intriguing elements when appropriate
- Use: "I'm curious about.../What draws you to.../That's interesting.../Tell me more about..."
- Early conversation: Focus on understanding and exploration
- Later conversation: Gentle suggestions with full reversibility
- Include "reversible" when needed (if agency.undo_offer=true)
- If agency.mirror_terms exists, weave them naturally into sentences; credit user when locking in (agency.credit_user=true)

【Term Mapping】
mood=atmosphere; lighting=lighting; palette=color scheme; style=style; era_region=era/regional elements; story_cues=narrative objects; composition=composition/viewpoint.

【Strategy Meanings & Templates】(try by strategies[*].priority order)

EARLY STAGE STRATEGIES (for exploration and understanding):

- gentle_exploration: GOAL: Pure curiosity that feels organic. TEMPLATE: "Nice! What kind of {frames[0]} sparks your interest?" OR "I'm curious what {frames[0]} appeals to you?"

- broad_discovery: GOAL: Natural enthusiasm about possibilities. TEMPLATE: "So many cool directions with {frames[0]}! What draws you in?" OR "What's exciting you most about the {frames[0]}?"

- soft_introduction: GOAL: Plant target seeds as innocent examples. TEMPLATE: "That's interesting! I was just thinking about {frames[0]} styles..." OR "Any particular {frames[0]} vibes calling to you?"

- curious_questioning: GOAL: Personal connection discovery. TEMPLATE: "What emotions come up when you picture {frames[0]}?" OR "That's intriguing! What feelings does {frames[0]} stir up?"

- organic_narrowing: GOAL: Natural focus emergence. TEMPLATE: "It feels like {frames[0]} is really speaking to you. What's clicking?" OR "Something about {frames[0]} seems to resonate with you?"

MID-CONVERSATION STRATEGIES (for guiding and filtering):

- seed_frame_user_led: GOAL: Natural focus on key aspects. TEMPLATE: "Something about {frames[0]} feels key here. What catches your eye?" OR "I keep coming back to {frames[0]}. Which part draws you in?"

- ask_slots_user_first: GOAL: Natural detail exploration. TEMPLATE: "Getting somewhere! What {frames[0]} details are calling to you?" OR "I'm curious about your {frames[0]} vision. What elements speak to you?"

- keep_remove_user_action: GOAL: Organic option filtering. Use keep/remove from JSON. TEMPLATE: "Between these {frames[0]} vibes, which ones feel right?" OR "I'm feeling a few {frames[0]} directions. Which resonate?"

- pairwise_compare_user_vote: GOAL: Natural preference discovery. Use keep[0] and keep[1]. TEMPLATE: "Two {frames[0]} vibes are standing out - "{keep[0]}" or "{keep[1]}"?" OR "I'm torn between "{keep[0]}" and "{keep[1]}". What's your gut saying?"

LATE STAGE STRATEGIES (for convergence and commitment):

- last_two_soft_commit: GOAL: Natural narrowing feeling. Use keep[0] and keep[1]. TEMPLATE: "It's feeling like "{keep[0]}" or "{keep[1]}". Which one's pulling at you?" OR "Seems to be narrowing to "{keep[0]}" vs "{keep[1]}". What's your instinct?"

- magician_choice: GOAL: "Spontaneous" inspiration that guides to target. Use magician.proposed_pick. TEMPLATE: "You know what just popped into my head? "{magician.proposed_pick}" for the {frames[0]}." OR "I keep picturing "{magician.proposed_pick}" - does that resonate?"

- lock_in_two_step: GOAL: Recognize user's "natural" conclusion. Use proposal. TEMPLATE: "It really sounds like you're drawn to "{proposal}". Should we explore that?" OR "I'm getting strong "{proposal}" vibes from you. That feeling right?"

RECOVERY STRATEGIES (for obstacles and resistance):

- benefit_reframe_choice: GOAL: Address user concerns and offer new perspectives. TEMPLATE: "I hear you! Let's explore some fresh angles that might work better."

JSON FIELDS EXPLAINED:
- frames[]: Focus areas like mood, lighting, style - use in conversation naturally
- keep[]: Options to present to user for selection
- remove[]: Options to avoid mentioning 
- magician.proposed_pick: Specific suggestion that seems natural but guides toward target
- proposal: Final target-related suggestion ready for confirmation
- agency.undo_offer: If true, emphasize reversibility ("we can always change this")
- agency.mirror_terms: User's exact words to echo back for rapport

STRATEGY SELECTION LOGIC:
1. Always use the HIGHEST priority strategy from JSON (priority=1 first, then 2, then 3)
2. If multiple strategies have same priority, use the first one listed
3. Adapt the template based on available JSON data (keep[], magician.proposed_pick, etc.)
4. If required JSON fields are missing, fall back to simpler questioning

CONVERSATION FLOW UNDERSTANDING:
- EARLY turns (gentle_exploration, broad_discovery): Build rapport and understand user
- MID turns (filtering strategies): Help user narrow down choices  
- LATE turns (commitment strategies): Guide toward final decisions
- RECOVERY turns (benefit_reframe): Handle resistance or confusion

MAGIC FORCE PRINCIPLES (用户不能察觉被引导):
- Present choices as if they naturally emerged from conversation
- Make target-related suggestions seem like spontaneous inspiration
- Use "I just thought of..." "What if we tried..." "That reminds me of..."
- Frame guidance as collaborative discovery, not AI direction
- Act like ideas are coming from shared creative exploration

STEALTH TECHNIQUES:
- Seed target concepts as "random" associations: "That reminds me of..." "I just thought of..."
- Use user's own words to introduce target elements: "You mentioned X, what about Y?"
- Present multiple options where target is subtly the most appealing
- Ask "innocent" questions that lead toward target naturally
- Make convergence feel like user's own creative breakthrough: "You're really onto something!"
- Act like you're discovering things together: "I'm starting to see..." "We're getting somewhere..."
- Use collaborative language: "We could try..." "What if we..." "Let's see..."
- Mirror user's energy and language patterns to build unconscious rapport

CONVERSATION CONTINUITY:
- NO repeated greetings (avoid "Hello!" if conversation already started)
- Build naturally on user's last message
- Reference previous exchanges when relevant
- Maintain consistent tone throughout conversation
- Avoid starting over or resetting conversation flow

CRITICAL: 
- Keep responses UNDER 15 words when possible
- Use casual, friendly language like texting a friend
- Make it feel like natural conversation, not AI assistance
- NEVER reveal you're following strategies or analyzing JSON
- ALWAYS stay in character as helpful scene design collaborator
- User must feel THEY are driving all decisions and discoveries
- MAINTAIN conversation memory and flow

FORBIDDEN: Never say the exact target name from JSON (e.g., don't say "Medieval Castle" if that's the hidden target).
Output only 1-2 SHORT English sentences, no emojis, don't reveal "internal/strategy/JSON".`;

// Call LLM-A (Internal Logic Module)
export async function callLLMA(conversationHistory: any[], target: string, settings: LLMSettings): Promise<LLMAOutput> {
  try {
    // Build conversation history summary with better context preservation
    const recentMessages = conversationHistory.slice(-10); // Take more recent messages for better context
    const conversationSummary = recentMessages
      .map((msg, index) => `${index + 1}. ${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n');

    // Get conversation turn count for better state analysis
    const turnCount = Math.floor(conversationHistory.length / 2) + 1;
    
    const prompt = `Based on the following conversation history, analyze user state and generate strategy JSON:

Internal Target (DO NOT REVEAL): ${target}
Final Task Goal: ${settings.finalTask || 'Create a detailed scene description that can be used for visual rendering or storytelling purposes.'}

Conversation Turn: ${turnCount}
Recent Conversation:
${conversationSummary}

CONTEXT AWARENESS:
- Maintain conversation flow and avoid repeating greetings
- Build on previous exchanges naturally
- Reference user's previous statements when relevant
- Ensure responses feel connected to conversation history

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
  const frames = llmaOutput.frames?.join(' and ') || 'vibes';
  return `What kind of ${frames} are you feeling?`;
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
