import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { ContentPanel } from './components/ContentPanel';
import { ChatPanel } from './components/ChatPanel';
import { ConfirmDialog } from './components/ConfirmDialog';
import { SettingsPanel } from './components/SettingsPanel';
import { ContentItem, ContentModule } from './types';

// Content modules will be created dynamically based on settings

function App() {
  // 设置状态
  const [isConfigured, setIsConfigured] = useState(false);
  const [settings, setSettings] = useState<{
    apiKey: string;
    chatModel: string;
    summaryModel: string;
    llmAModel: string;
    llmBModel: string;
    language: string;
    temperature: number;
    maxTokens: number;
    llmATemperature: number;
    llmAMaxTokens: number;
    llmBTemperature: number;
    llmBMaxTokens: number;
    downloadPath: string;
    scenePrompt: string;
    llmAPrompt: string;
    llmBPrompt: string;
    summaryPrompt: string;
    targetScene: string;
    finalTask: string;
    aiMode: string;
  } | null>(null);

  // 检查是否已有保存的设置
  useEffect(() => {
    // 只在首次使用时设置版本，不清除用户自定义设置
    const promptVersion = localStorage.getItem('prompt_version');
    if (!promptVersion) {
      console.log('Setting initial prompt version to 10.0');
      localStorage.setItem('prompt_version', '10.0');
    }
    
    const savedApiKey = localStorage.getItem('openai_api_key');
    const savedChatModel = localStorage.getItem('chat_model');
    const savedSummaryModel = localStorage.getItem('summary_model');
    const savedLanguage = localStorage.getItem('app_language');
    
    if (savedApiKey && savedApiKey !== 'your_openai_api_key_here') {
      setSettings({
        apiKey: savedApiKey,
        chatModel: savedChatModel || 'gpt-4.1-mini',
        summaryModel: savedSummaryModel || 'gpt-4.1-nano',
        llmAModel: localStorage.getItem('llm_a_model') || 'gpt-4.1',
        llmBModel: localStorage.getItem('llm_b_model') || 'gpt-4.1-mini',
        language: savedLanguage || 'en-US',
        temperature: parseFloat(localStorage.getItem('ai_temperature') || '0.7'),
        maxTokens: parseInt(localStorage.getItem('ai_max_tokens') || '1000'),
        llmATemperature: parseFloat(localStorage.getItem('llm_a_temperature') || '0.3'),
        llmAMaxTokens: parseInt(localStorage.getItem('llm_a_max_tokens') || '500'),
        llmBTemperature: parseFloat(localStorage.getItem('llm_b_temperature') || '0.8'),
        llmBMaxTokens: parseInt(localStorage.getItem('llm_b_max_tokens') || '800'),
        downloadPath: localStorage.getItem('download_path') || 'AI_Content',
        scenePrompt: localStorage.getItem('scene_prompt') || 'You are a professional scene designer helping users design and refine various scene descriptions.',
        llmAPrompt: localStorage.getItem('llm_a_prompt') || `CRITICAL STATE RECOGNITION:
- Greetings like "Hi", "Hello", "I am [Name]" are S10 (early_exploration) NOT S7 (off-topic)
- S7 is only for truly unrelated topics like weather, politics, or completely different subjects
- Social courtesies and introductions are part of natural conversation flow

QUESTION DETECTION RULES:
- ALWAYS extract user questions into user_question field (e.g., "what's your name?")
- ALWAYS extract user names into user_name field when they introduce themselves
- Questions MUST be answered before any topic guidance`,
        llmBPrompt: localStorage.getItem('llm_b_prompt') || `CONVERSATION CONTINUITY RULES (CRITICAL):
- SOCIAL POLITENESS: Always respond naturally to greetings and basic social interactions
- If user says "Hi" or "Hello", respond warmly: "Hi there!" then smoothly continue the conversation
- If user mentions their name, acknowledge naturally: "Very nice to meet you, [Name]!" then gentle topic transition
- If user asks questions about you (like "what's your name?"), answer briefly: "I'm your design assistant!"
- NEVER ignore user questions - always acknowledge and respond to what they asked
- If user says preference, build on it: "[Something] sounds peaceful. What draws you to that?"
- Remember what user told you and reference it naturally
- Balance natural social responses with topic progression - don't ignore basic courtesy

THREE-STEP CONVERSATION STRUCTURE:
- Step 1: Direct response to their question/statement
- Step 2: Natural bridge/transition sentence  
- Step 3: Gentle guide back to design task
- Example: User talks about weather → "That sounds lovely! Weather affects our mood so much. What kinds of spaces make you feel good?"
- Example: User mentions food → "That sounds delicious! Food brings such warmth. What environments help you relax?"
- Keep each sentence short and natural - avoid being abrupt or overly long

QUESTION HANDLING PRIORITY:
- If user_question exists: MUST answer question first, then add topic transition
- If user_name exists: MUST acknowledge name with greeting
- Never ignore questions - they take precedence over topic guidance

THREE-STEP CONVERSATION TEMPLATES:
- Question response: "[Answer their question]! [Natural bridge statement]. [Gentle design question]."
- Name introduction: "Nice to meet you, [Name]! I'm your design assistant. [Simple design question]."
- Daily topic acknowledgment: "[Positive response]! [Relatable bridge]. [Space/atmosphere question]."

CRITICAL: Keep each sentence short and natural (under 8-10 words per sentence), use three-step structure: Response + Bridge + Design question, make it feel like natural conversation, NEVER ignore what user just told you.`,
        summaryPrompt: localStorage.getItem('summary_prompt') || 'Based on the conversation about {contentType} design, create a comprehensive summary that fulfills the Final Task Goal. Include detailed environmental descriptions (lighting, atmosphere, weather, colors) and complete audio design (ambient sounds, music, sound effects). If conversation lacks details, creatively add appropriate elements to complete the scene design.',
        targetScene: localStorage.getItem('target_scene') || 'Medieval Castle',
        finalTask: localStorage.getItem('final_task') || 'Create a detailed scene description that can be used for visual rendering or storytelling purposes.',
        aiMode: localStorage.getItem('ai_mode') || 'modeD'
      });
      setIsConfigured(true);
    }
  }, []);

  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: 'scene',
      title: 'Scene',
      content: '',
      placeholder: 'Describe your scene here... You can type directly or use AI to help generate content.'
    }
    // Temporarily commented out - Sound Effects and Avatar Design modules
    // {
    //   id: 'sound',
    //   title: 'Sound Effects',
    //   content: '',
    //   placeholder: 'Describe your sound effects here... You can type directly or use AI to help generate content.'
    // },
    // {
    //   id: 'avatar',
    //   title: 'Avatar Design',
    //   content: '',
    //   placeholder: 'Describe your avatar design here... You can type directly or use AI to help generate content.'
    // }
  ]);

  const [selectedModule, setSelectedModule] = useState<ContentModule | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingContent, setPendingContent] = useState<{
    moduleId: string;
    summary: string;
  } | null>(null);
  
  // Timer states
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [totalTime, setTotalTime] = useState<string | null>(null);
  
  // Individual chat memories for each module
  const [moduleChats, setModuleChats] = useState<{
    [key: string]: any[];
  }>({
    scene: []
    // Temporarily commented out - Sound Effects and Avatar Design modules
    // sound: [],
    // avatar: []
  });

  // 编辑区域启用状态 - 跟踪每个模块是否已通过AI完成设计
  const [enabledModules, setEnabledModules] = useState<{ [key: string]: boolean }>({
    scene: false
    // sound: false,
    // avatar: false
  });

  // Create content modules dynamically based on settings
  const getContentModules = (): ContentModule[] => {
    if (!settings) return [];
    
    return [
      {
        id: 'scene',
        title: 'Scene',
        description: 'Describe your desired scene settings and atmosphere',
        systemPrompt: settings.scenePrompt
      }
      // Temporarily commented out - Sound Effects and Avatar Design modules
      // {
      //   id: 'sound',
      //   title: 'Sound Effects',
      //   description: 'Choose suitable background music and sound effects',
      //   systemPrompt: settings.soundPrompt
      // },
      // {
      //   id: 'avatar',
      //   title: 'Avatar Design',
      //   description: 'Design the appearance and characteristics of digital avatars',
      //   systemPrompt: settings.avatarPrompt
      // }
    ];
  };

  const handleModuleSelect = (module: ContentModule) => {
    setSelectedModule(module);
    
    // Start timer when Scene module is selected
    if (module.id === 'scene') {
      const now = Date.now();
      setStartTime(now);
      setEndTime(null);
      setTotalTime(null);
      console.log('🕐 Timer started for Scene design');
    }
  };

  const handleContentSuggestion = (moduleId: string, summary: string) => {
    setPendingContent({ moduleId, summary });
    setShowConfirmDialog(true);
  };

  const handleContentUpdate = (itemId: string, content: string) => {
    setContentItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, content } : item
      )
    );
  };

  const handleConfirmContent = () => {
    if (pendingContent) {
      setContentItems(prev => prev.map(item =>
        item.id === pendingContent.moduleId
          ? { ...item, content: pendingContent.summary }
          : item
      ));
      
      // 启用对应模块的编辑功能
      setEnabledModules(prev => ({
        ...prev,
        [pendingContent.moduleId]: true
      }));
    }
    setShowConfirmDialog(false);
    setPendingContent(null);
  };

  const handleCancelContent = () => {
    setShowConfirmDialog(false);
    setPendingContent(null);
  };

  // Check if the scene module is completed
  const allModulesCompleted = contentItems.every(item => item.content.trim() !== '');

  // Download function
  const handleDownload = () => {
    // End timer when download is clicked
    let timeInfo = '';
    if (startTime) {
      const now = Date.now();
      setEndTime(now);
      const duration = now - startTime;
      
      // Format time as MM:SS
      const minutes = Math.floor(duration / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);
      const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      setTotalTime(formattedTime);
      timeInfo = `========================================\n⏱️  COMPLETION TIME: ${formattedTime}\n========================================\n\n`;
      
      console.log(`🕐 Timer ended. Total time: ${formattedTime}`);
    }
    
    const content = timeInfo + contentItems.map(item => 
      `${item.title}:\n${item.content || 'Not completed'}\n\n`
    ).join('');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // Use custom filename if provided, otherwise default
    const customName = settings?.downloadPath?.trim() || 'AI_Content';
    const fileName = `${customName}.txt`;
    a.download = fileName;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show user-friendly message
    console.log(`📁 File will be downloaded as: ${fileName}`);
    console.log(`💡 Due to browser security, file will be saved to your default Downloads folder`);
  };

  const handleSettingsComplete = (newSettings: {
    apiKey: string;
    chatModel: string;
    summaryModel: string;
    llmAModel: string;
    llmBModel: string;
    language: string;
    temperature: number;
    maxTokens: number;
    llmATemperature: number;
    llmAMaxTokens: number;
    llmBTemperature: number;
    llmBMaxTokens: number;
    downloadPath: string;
    scenePrompt: string;
    llmAPrompt: string;
    llmBPrompt: string;
    summaryPrompt: string;
    targetScene: string;
    finalTask: string;
    aiMode: string;
  }) => {
    setSettings(newSettings);
    setIsConfigured(true);
  };

  // 如果未配置，显示设置页面
  if (!isConfigured) {
    return <SettingsPanel onSettingsComplete={handleSettingsComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6">
        <header className="text-center mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12"></div>
            <div className="text-center">
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                AI Scene Designer
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto rounded-full"></div>
            </div>
            <button
              onClick={() => setIsConfigured(false)}
              className="group p-3 text-gray-500 hover:text-indigo-600 hover:bg-white/70 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/30"
              title="Settings"
            >
              <Settings className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
          <p className="text-xl text-gray-700 font-medium mb-4">
            Create stunning scenes with AI-powered design assistance
          </p>
          <div className="inline-flex items-center space-x-4 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-white/40">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Chat: {settings?.chatModel}</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Summary: {settings?.summaryModel}</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <span className="text-sm font-medium text-gray-700">{settings?.language}</span>
          </div>
        </header>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <ContentPanel
            items={contentItems}
            modules={getContentModules()}
            allCompleted={allModulesCompleted}
            onDownload={handleDownload}
            onContentUpdate={handleContentUpdate}
            enabledModules={enabledModules}
          />
          
          <ChatPanel
            selectedModule={selectedModule}
            onContentSuggestion={handleContentSuggestion}
            settings={settings}
            moduleChats={moduleChats}
            setModuleChats={setModuleChats}
            modules={getContentModules()}
            onModuleSelect={handleModuleSelect}
          />
        </div>

        {showConfirmDialog && pendingContent && (
          <ConfirmDialog
            content={pendingContent.summary}
            moduleTitle={getContentModules().find(m => m.id === pendingContent.moduleId)?.title || ''}
            onConfirm={handleConfirmContent}
            onCancel={handleCancelContent}
          />
        )}
      </div>
    </div>
  );
}

export default App; 