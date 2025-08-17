import { useState } from 'react';
import { Settings, Play, Eye, EyeOff } from 'lucide-react';

interface SettingsPanelProps {
  onSettingsComplete: (settings: {
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
  }) => void;
}

export function SettingsPanel({ onSettingsComplete }: SettingsPanelProps) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [chatModel, setChatModel] = useState(() => localStorage.getItem('chat_model') || 'gpt-4.1-mini');
  const [summaryModel, setSummaryModel] = useState(() => localStorage.getItem('summary_model') || 'gpt-4.1-nano');
  const [llmAModel, setLlmAModel] = useState(() => localStorage.getItem('llm_a_model') || 'gpt-4.1');
  const [llmBModel, setLlmBModel] = useState(() => localStorage.getItem('llm_b_model') || 'gpt-4.1-mini');
  const [language, setLanguage] = useState(() => localStorage.getItem('app_language') || 'en-US');
  const [temperature, setTemperature] = useState(() => parseFloat(localStorage.getItem('ai_temperature') || '0.7'));
  const [maxTokens, setMaxTokens] = useState(() => parseInt(localStorage.getItem('ai_max_tokens') || '1000'));
  const [llmATemperature, setLlmATemperature] = useState(() => parseFloat(localStorage.getItem('llm_a_temperature') || '0.3'));
  const [llmAMaxTokens, setLlmAMaxTokens] = useState(() => parseInt(localStorage.getItem('llm_a_max_tokens') || '500'));
  const [llmBTemperature, setLlmBTemperature] = useState(() => parseFloat(localStorage.getItem('llm_b_temperature') || '0.8'));
  const [llmBMaxTokens, setLlmBMaxTokens] = useState(() => parseInt(localStorage.getItem('llm_b_max_tokens') || '800'));
  const [downloadPath, setDownloadPath] = useState(() => localStorage.getItem('download_path') || 'AI_Content');
  const [scenePrompt, setScenePrompt] = useState(() => localStorage.getItem('scene_prompt') || 'You are a professional scene designer helping users design and refine various scene descriptions. Please discuss scene details with users, including environment, atmosphere, style, colors, and other elements. When users are satisfied with a scene description, you should provide a complete scene summary.');
  const [llmAPrompt, setLlmAPrompt] = useState(() => localStorage.getItem('llm_a_prompt') || 'You are "Module A" (Internal Logic). Output only minimal JSON per turn, no explanations. Analyze user state (S0-S9), generate 2-3 strategy candidates with priority, maintain agency-preserving force while converging to target.');
  const [llmBPrompt, setLlmBPrompt] = useState(() => localStorage.getItem('llm_b_prompt') || 'You are "Module B" (Rendering/Interaction). Input is JSON from Module A. Output only 1-2 English sentences for users. Maintain tactful, inspiring tone with user agency feeling while following strategies.');
  const [summaryPrompt, setSummaryPrompt] = useState(() => localStorage.getItem('summary_prompt') || 'Please summarize the following conversation about {contentType} design, extracting key design elements and final solutions. Please provide a concise and complete {contentType} design solution description (100-200 words), including all important details and characteristics.');
  const [targetScene, setTargetScene] = useState(() => localStorage.getItem('target_scene') || 'Medieval Castle');
  const [finalTask, setFinalTask] = useState(() => localStorage.getItem('final_task') || 'Create a detailed scene description that can be used for visual rendering or storytelling purposes.');
  const [aiMode, setAiMode] = useState(() => localStorage.getItem('ai_mode') || 'modeD');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const availableModels = [
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini (Recommended)' },
    { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
    { value: 'gpt-4.1', label: 'GPT-4.1' },
    { value: 'gpt-4o', label: 'GPT-4o' }
  ];

  const availableLanguages = [
    { value: 'en-US', label: 'English' },
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'ja-JP', label: '日本語' }
  ];

  const handleStart = () => {
    if (!apiKey.trim()) {
      alert('Please enter OpenAI API key');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      alert('API key format is incorrect, should start with sk-');
      return;
    }

    setIsStarting(true);

    // Save settings to local storage
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('chat_model', chatModel);
    localStorage.setItem('summary_model', summaryModel);
    localStorage.setItem('llm_a_model', llmAModel);
    localStorage.setItem('llm_b_model', llmBModel);
    localStorage.setItem('app_language', language);
    localStorage.setItem('ai_temperature', temperature.toString());
    localStorage.setItem('ai_max_tokens', maxTokens.toString());
    localStorage.setItem('llm_a_temperature', llmATemperature.toString());
    localStorage.setItem('llm_a_max_tokens', llmAMaxTokens.toString());
    localStorage.setItem('llm_b_temperature', llmBTemperature.toString());
    localStorage.setItem('llm_b_max_tokens', llmBMaxTokens.toString());
    localStorage.setItem('download_path', downloadPath);
    localStorage.setItem('scene_prompt', scenePrompt);
    localStorage.setItem('llm_a_prompt', llmAPrompt);
    localStorage.setItem('llm_b_prompt', llmBPrompt);
    localStorage.setItem('summary_prompt', summaryPrompt);
    localStorage.setItem('target_scene', targetScene);
    localStorage.setItem('final_task', finalTask);
    localStorage.setItem('ai_mode', aiMode);

    // Delay a bit to let user see the startup animation
    setTimeout(() => {
      onSettingsComplete({ 
        apiKey, 
        chatModel, 
        summaryModel,
        llmAModel,
        llmBModel,
        language, 
        temperature, 
        maxTokens, 
        llmATemperature,
        llmAMaxTokens,
        llmBTemperature,
        llmBMaxTokens,
        downloadPath,
        scenePrompt,
        llmAPrompt,
        llmBPrompt,
        summaryPrompt,
        targetScene,
        finalTask,
        aiMode
      });
    }, 1000);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim() || !apiKey.startsWith('sk-')) {
      alert('Please enter a valid API key first');
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        alert('✅ API connection test successful!');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      alert('❌ API connection test failed, please check if the key is correct');
      console.error('Connection test failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-10 w-full max-w-lg">
        <div className="text-center mb-10">
          <div className="relative mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg">
              <Settings className="w-10 h-10 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl animate-ping opacity-20"></div>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            AI Scene Designer
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 mx-auto rounded-full mb-4"></div>
          <p className="text-xl text-gray-700 font-medium">
            Configure Your Creative Assistant
          </p>
        </div>

        <div className="space-y-8">
          {/* API Key Section */}
          <div className="group">
            <label className="block text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              🔑 OpenAI API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-6 py-4 pr-16 border-2 border-gray-200 bg-white/70 backdrop-blur-sm rounded-xl text-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-300"
              >
                {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Get API Key →
              </a>
              <button
                onClick={handleTestConnection}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                ✅ Test Connection
              </button>
            </div>
          </div>

          {/* AI Mode Selection */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <h4 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              🤖 AI Processing Mode
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="group relative">
                <input
                  type="radio"
                  value="modeD"
                  checked={aiMode === 'modeD'}
                  onChange={(e) => setAiMode(e.target.value)}
                  className="sr-only"
                />
                <div className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                  aiMode === 'modeD' 
                    ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      aiMode === 'modeD' ? 'bg-white/20' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}>
                      <span className={`text-lg font-bold ${aiMode === 'modeD' ? 'text-white' : 'text-white'}`}>D</span>
                    </div>
                    <h5 className={`text-xl font-bold ${aiMode === 'modeD' ? 'text-white' : 'text-gray-800'}`}>
                      modeD (Dual)
                    </h5>
                  </div>
                  <p className={`text-sm ${aiMode === 'modeD' ? 'text-white/90' : 'text-gray-600'}`}>
                    🧠 Advanced dual-LLM system with intelligent state analysis and strategic conversation guidance
                  </p>
                </div>
              </label>

              <label className="group relative">
                <input
                  type="radio"
                  value="modeT"
                  checked={aiMode === 'modeT'}
                  onChange={(e) => setAiMode(e.target.value)}
                  className="sr-only"
                />
                <div className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                  aiMode === 'modeT' 
                    ? 'border-purple-500 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                    : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                }`}>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      aiMode === 'modeT' ? 'bg-white/20' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}>
                      <span className={`text-lg font-bold ${aiMode === 'modeT' ? 'text-white' : 'text-white'}`}>T</span>
                    </div>
                    <h5 className={`text-xl font-bold ${aiMode === 'modeT' ? 'text-white' : 'text-gray-800'}`}>
                      modeT (Tradition)
                    </h5>
                  </div>
                  <p className={`text-sm ${aiMode === 'modeT' ? 'text-white/90' : 'text-gray-600'}`}>
                    💬 Traditional single-AI conversation with direct interaction and familiar chat experience
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Model Selection Grid */}
          <div className="space-y-6">
            {/* Traditional Mode Models */}
            <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
              <h4 className="text-lg font-semibold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent mb-4 flex items-center space-x-2">
                <span>💬</span>
                <span>Traditional Mode Models</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    💬 Chat Model
                  </label>
                  <select
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 bg-white/70 backdrop-blur-sm rounded-xl text-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
                  >
                    {availableModels.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-600 bg-indigo-50 rounded-lg p-3">
                    💡 Used for traditional mode conversations
                  </p>
                </div>

                <div className="group">
                  <label className="block text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    📝 Summary Model
                  </label>
                  <select
                    value={summaryModel}
                    onChange={(e) => setSummaryModel(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-gray-200 bg-white/70 backdrop-blur-sm rounded-xl text-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
                  >
                    {availableModels.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-600 bg-purple-50 rounded-lg p-3">
                    💡 Used for content summarization
                  </p>
                </div>
              </div>
            </div>

            {/* Dual-LLM Mode Models */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h4 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center space-x-2">
                <span>🧠</span>
                <span>Dual-LLM Mode Models</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">A</span>
                    </div>
                    <label className="block text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      LLM-A (Logic)
                    </label>
                  </div>
                  <select
                    value={llmAModel}
                    onChange={(e) => setLlmAModel(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-blue-200 bg-white/70 backdrop-blur-sm rounded-xl text-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300"
                  >
                    {availableModels.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
                    🎯 Internal logic, state analysis, strategy planning
                  </p>
                </div>

                <div className="group">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">B</span>
                    </div>
                    <label className="block text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      LLM-B (Rendering)
                    </label>
                  </div>
                  <select
                    value={llmBModel}
                    onChange={(e) => setLlmBModel(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-purple-200 bg-white/70 backdrop-blur-sm rounded-xl text-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300"
                  >
                    {availableModels.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-purple-600 bg-purple-50 rounded-lg p-3">
                    💬 User interaction, conversation rendering
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Language Selection */}
          <div className="group">
            <label className="block text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              🌍 Interface Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-200 bg-white/70 backdrop-blur-sm rounded-xl text-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
            >
              {availableLanguages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="group">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full p-6 bg-gradient-to-r from-gray-50 to-indigo-50 border-2 border-gray-200 rounded-xl hover:border-indigo-300 hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 shadow-sm hover:shadow-lg"
            >
              <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center space-x-2">
                <span>⚙️</span>
                <span>Advanced Settings</span>
              </span>
              <div className={`w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}>
                {showAdvanced ? '−' : '+'}
              </div>
            </button>
          </div>

          {/* Advanced Settings Panel */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
              {/* AI Parameters */}
              <div className="space-y-6">
                {/* Traditional Mode Parameters */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                  <h5 className="text-md font-semibold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent mb-4 flex items-center space-x-2">
                    <span>💬</span>
                    <span>Traditional Mode Parameters</span>
                  </h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">0.0-2.0 (creativity)</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Tokens
                      </label>
                      <input
                        type="number"
                        min="100"
                        max="4000"
                        value={maxTokens}
                        onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">Response length limit</p>
                    </div>
                  </div>
                </div>

                {/* Dual-LLM Parameters */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <h5 className="text-md font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center space-x-2">
                    <span>🧠</span>
                    <span>Dual-LLM Parameters</span>
                  </h5>
                  
                  {/* LLM-A Parameters */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">A</span>
                      </div>
                      <h6 className="text-sm font-semibold text-blue-800">LLM-A (Internal Logic) Parameters</h6>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          A Temperature
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          value={llmATemperature}
                          onChange={(e) => setLlmATemperature(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                        <p className="mt-1 text-xs text-blue-600">Low for precise logic</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          A Max Tokens
                        </label>
                        <input
                          type="number"
                          min="100"
                          max="2000"
                          value={llmAMaxTokens}
                          onChange={(e) => setLlmAMaxTokens(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                        <p className="mt-1 text-xs text-blue-600">JSON output limit</p>
                      </div>
                    </div>
                  </div>

                  {/* LLM-B Parameters */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">B</span>
                      </div>
                      <h6 className="text-sm font-semibold text-purple-800">LLM-B (Rendering) Parameters</h6>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-700 mb-2">
                          B Temperature
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="2"
                          step="0.1"
                          value={llmBTemperature}
                          onChange={(e) => setLlmBTemperature(parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        />
                        <p className="mt-1 text-xs text-purple-600">Higher for creative text</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-700 mb-2">
                          B Max Tokens
                        </label>
                        <input
                          type="number"
                          min="100"
                          max="2000"
                          value={llmBMaxTokens}
                          onChange={(e) => setLlmBMaxTokens(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                        />
                        <p className="mt-1 text-xs text-purple-600">Conversation limit</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Download File Name
                </label>
                <input
                  type="text"
                  value={downloadPath}
                  onChange={(e) => setDownloadPath(e.target.value)}
                  placeholder="MyProject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  ⚠️ Browser Limitation: File will be saved to your default download folder. 
                  This setting changes the filename (e.g., "MyProject.txt")
                </p>
              </div>

              {/* Dual-LLM Target Configuration */}
              <div>
                <h4 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  🎯 Dual-LLM Target Configuration
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Scene
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={targetScene}
                        onChange={(e) => setTargetScene(e.target.value)}
                        placeholder="e.g., Medieval Castle, Space Station, Enchanted Forest"
                        className="w-full px-4 py-3 border-2 border-gray-200 bg-white/70 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300"
                      />
                      <div className="flex flex-wrap gap-2">
                        {['Old Town', 'Medieval Castle', 'Modern Office', 'Space Station', 'Enchanted Forest', 'Cyberpunk City'].map((preset) => (
                          <button
                            key={preset}
                            onClick={() => setTargetScene(preset)}
                            className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      🎯 The target scene that LLM-A will intelligently guide users towards
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Final Task Goal
                    </label>
                    <textarea
                      value={finalTask}
                      onChange={(e) => setFinalTask(e.target.value)}
                      placeholder="What should the user accomplish?"
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 bg-white/70 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300 resize-none"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The ultimate goal users should achieve
                    </p>
                  </div>
                </div>
              </div>

              {/* Dual-LLM System Prompts */}
              <div>
                <h4 className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  🧠 Dual-LLM System Prompts
                </h4>
                
                <div className="space-y-6">
                  {/* LLM-A Prompt */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">A</span>
                      </div>
                      <label className="block text-sm font-semibold text-blue-800">
                        LLM-A (Internal Logic / Planning)
                      </label>
                    </div>
                    <textarea
                      value={llmAPrompt}
                      onChange={(e) => setLlmAPrompt(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-blue-200 bg-white/70 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 text-sm"
                      placeholder="Define LLM-A's role in state analysis and strategy planning..."
                    />
                    <p className="mt-2 text-xs text-blue-600">
                      🎯 Analyzes user states (S0-S9), generates strategies, outputs JSON
                    </p>
                  </div>

                  {/* LLM-B Prompt */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">B</span>
                      </div>
                      <label className="block text-sm font-semibold text-purple-800">
                        LLM-B (Rendering / Interaction)
                      </label>
                    </div>
                    <textarea
                      value={llmBPrompt}
                      onChange={(e) => setLlmBPrompt(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-purple-200 bg-white/70 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all duration-300 text-sm"
                      placeholder="Define LLM-B's role in conversation rendering..."
                    />
                    <p className="mt-2 text-xs text-purple-600">
                      💬 Takes LLM-A JSON, generates tactful user conversations
                    </p>
                  </div>

                  {/* Traditional Mode Prompts */}
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200">
                    <h5 className="text-sm font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <span>📝</span>
                      <span>Traditional Mode Prompts</span>
                    </h5>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Scene Design System Prompt
                        </label>
                        <textarea
                          value={scenePrompt}
                          onChange={(e) => setScenePrompt(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 bg-white/70 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-300 text-sm"
                          placeholder="Define how the AI should approach scene design conversations..."
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Used in traditional single-AI mode
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Summary Generation Prompt
                        </label>
                        <textarea
                          value={summaryPrompt}
                          onChange={(e) => setSummaryPrompt(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 bg-white/70 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all duration-300 text-sm"
                          placeholder="Use {contentType} as placeholder for module type"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Use <code className="bg-gray-100 px-1 rounded">{'{contentType}'}</code> placeholder for dynamic content type
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!apiKey.trim() || isStarting}
            className="group relative w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-6 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isStarting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white relative z-10"></div>
                <span className="relative z-10">Starting Your Creative Journey...</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <span className="relative z-10">Launch AI Scene Designer</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
          <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4 flex items-center space-x-2">
            <span>💡</span>
            <span>Pro Tips</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start space-x-2">
              <span className="text-lg">🔐</span>
              <span className="text-sm text-blue-700">API key stored securely in browser</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg">🚀</span>
              <span className="text-sm text-blue-700">GPT-4.1 Mini recommended for beginners</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg">💳</span>
              <span className="text-sm text-blue-700">Ensure sufficient OpenAI balance</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-lg">⚡</span>
              <span className="text-sm text-blue-700">Settings auto-save for next visit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 