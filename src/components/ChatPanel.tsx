import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, CheckCircle, Brain, MessageSquare } from 'lucide-react';
import { ChatMessage, ContentModule } from '../types';
import { sendMessage } from '../utils/openai';
import { processDualLLM, LLMAOutput, STATE_DESCRIPTIONS, STRATEGY_DESCRIPTIONS } from '../utils/llmModules';

interface ChatPanelProps {
  selectedModule: ContentModule | null;
  onContentSuggestion: (moduleId: string, summary: string) => void;
  settings: {
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
  } | null;
  moduleChats: { [key: string]: any[] };
  setModuleChats: (chats: { [key: string]: any[] } | ((prev: { [key: string]: any[] }) => { [key: string]: any[] })) => void;
  modules: ContentModule[];
  onModuleSelect: (module: ContentModule) => void;
}

export function ChatPanel({ selectedModule, onContentSuggestion, settings, moduleChats, setModuleChats, modules, onModuleSelect }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<LLMAOutput | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // 根据设置确定是否使用双LLM模式
  const isDualLLMMode = settings?.aiMode === 'modeD';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get current module's messages
  const messages = selectedModule ? (moduleChats[selectedModule.id] || []) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedModule && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Hello! I'm an AI assistant specialized in ${selectedModule.title} design. ${selectedModule.description}

Please tell me your ideas and requirements, and I'll help you refine your design solution.`,
        timestamp: new Date()
      };
      setModuleChats((prev: { [key: string]: any[] }) => ({
        ...prev,
        [selectedModule.id]: [welcomeMessage]
      }));
    }
  }, [selectedModule, setModuleChats]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedModule || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    // Add user message to current module's chat
    setModuleChats((prev: { [key: string]: any[] }) => ({
      ...prev,
      [selectedModule.id]: [...(prev[selectedModule.id] || []), userMessage]
    }));
    setInputValue('');
    setIsLoading(true);

    try {
      if (isDualLLMMode) {
        // 双LLM模式：使用LLM-A + LLM-B 管道
        const conversationHistory = [
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage.content }
        ];

        const result = await processDualLLM(conversationHistory, settings?.targetScene || 'Default Scene', {
          apiKey: settings?.apiKey || '',
          chatModel: settings?.chatModel || 'gpt-4.1-mini',
          summaryModel: settings?.summaryModel || 'gpt-4.1-nano',
          llmAModel: settings?.llmAModel || 'gpt-4.1',
          llmBModel: settings?.llmBModel || 'gpt-4.1-mini',
          temperature: settings?.temperature || 0.7,
          maxTokens: settings?.maxTokens || 1000,
          llmATemperature: settings?.llmATemperature || 0.3,
          llmAMaxTokens: settings?.llmAMaxTokens || 500,
          llmBTemperature: settings?.llmBTemperature || 0.8,
          llmBMaxTokens: settings?.llmBMaxTokens || 800,
          llmAPrompt: settings?.llmAPrompt,
          llmBPrompt: settings?.llmBPrompt
        });

        // 保存分析结果用于展示
        setCurrentAnalysis(result.analysis);
        
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.response,
          timestamp: new Date()
        };

        // Add assistant message to current module's chat
        setModuleChats((prev: { [key: string]: any[] }) => ({
          ...prev,
          [selectedModule.id]: [...(prev[selectedModule.id] || []), assistantMessage]
        }));

      } else {
        // 传统模式：直接调用OpenAI API
        const conversationHistory = [
          { role: 'system', content: selectedModule.systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage.content }
        ];

        const aiResponse = await sendMessage(conversationHistory, settings);

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };

        // Add assistant message to current module's chat
        setModuleChats((prev: { [key: string]: any[] }) => ({
          ...prev,
          [selectedModule.id]: [...(prev[selectedModule.id] || []), assistantMessage]
        }));
      }

    } catch (error) {
      console.error('Chat error:', error);
      let errorContent = isDualLLMMode 
        ? 'LLM模块处理出现问题，请检查API配置后重试。'
        : '抱歉，我遇到了一些技术问题。请检查你的API密钥是否正确配置，然后重试。';
      
      if (error instanceof Error) {
        errorContent = error.message;
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setModuleChats((prev: { [key: string]: any[] }) => ({
        ...prev,
        [selectedModule.id]: [...(prev[selectedModule.id] || []), errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCompleteDesign = async () => {
    if (!selectedModule || !settings || messages.length === 0) return;

    setIsLoading(true);
    try {
      // Generate conversation summary using custom prompt
      const customSummaryPrompt = settings.summaryPrompt.replace(/{contentType}/g, selectedModule.title);
      const summaryPrompt = `
${customSummaryPrompt}

Conversation content:
${messages.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n')}
`;

      const summary = await sendMessage([
        { role: 'user', content: summaryPrompt }
      ], settings, 'summary');

      onContentSuggestion(selectedModule.id, summary);
    } catch (error) {
      console.error('Summary generation error:', error);
      let errorContent = 'An error occurred while generating the summary, please try again.';
      
      if (error instanceof Error) {
        errorContent = error.message;
      }
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      };
      setModuleChats((prev: { [key: string]: any[] }) => ({
        ...prev,
        [selectedModule.id]: [...(prev[selectedModule.id] || []), errorMessage]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedModule) {
    return (
      <div className="bg-gradient-to-br from-white/90 to-indigo-50/90 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-white/50 flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Bot className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-ping opacity-20"></div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Ready to Design?
          </h3>
          <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto leading-relaxed">
            Choose a module below to start creating with AI assistance
          </p>
          
          {/* AI Design Buttons */}
          <div className="space-y-3 mb-6">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => onModuleSelect(module)}
                className="group w-full max-w-xs mx-auto relative px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <span>🤖</span>
                  <span>AI Design: {module.title}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse"></div>
              <span>AI is ready to help you create amazing scenes</span>
            </div>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-3 h-3" />
                <span>modeT (Tradition)</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Brain className="w-3 h-3" />
                <span>modeD (Dual)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/90 to-indigo-50/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 flex flex-col h-[600px] overflow-hidden">
      <div className="p-6 border-b border-white/50 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          {/* Header Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedModule.title} Designer
                </h3>
                <p className="text-white/80 text-sm">AI-Powered Creative Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">Online</span>
            </div>
          </div>

          {/* Mode Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-white/90 text-sm font-medium">Chat Mode:</span>
              <div className="flex items-center space-x-2">
                {isDualLLMMode ? (
                  <>
                    <Brain className="w-4 h-4 text-white/80" />
                    <span className="text-white/90 text-sm font-semibold">modeD (Dual)</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 text-white/80" />
                    <span className="text-white/90 text-sm font-semibold">modeT (Tradition)</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Analysis Toggle (only show in Dual-LLM mode) */}
            {isDualLLMMode && currentAnalysis && (
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white/90 text-sm font-medium hover:bg-white/30 transition-all duration-300 flex items-center space-x-2"
              >
                <Brain className="w-4 h-4" />
                <span>Analysis</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Analysis Panel - only show in Dual-LLM mode when toggled */}
        {isDualLLMMode && showAnalysis && currentAnalysis && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Brain className="w-6 h-6 text-indigo-600" />
              <h4 className="text-lg font-bold text-indigo-800">LLM-A Analysis</h4>
              <button
                onClick={() => setShowAnalysis(false)}
                className="ml-auto text-indigo-400 hover:text-indigo-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* Current State */}
              <div className="bg-white/70 rounded-xl p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">🧠 Current State</h5>
                <div className="text-blue-700">
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                    {currentAnalysis.state}
                  </span>
                  <span className="ml-2 text-gray-600">
                    {STATE_DESCRIPTIONS[currentAnalysis.state] || 'Unknown State'}
                  </span>
                </div>
              </div>

              {/* Active Frames */}
              {currentAnalysis.frames && currentAnalysis.frames.length > 0 && (
                <div className="bg-white/70 rounded-xl p-4 border border-blue-200">
                  <h5 className="font-semibold text-blue-800 mb-2">🎯 Focus Areas</h5>
                  <div className="flex flex-wrap gap-2">
                    {currentAnalysis.frames.map((frame, index) => (
                      <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium">
                        {frame}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Target */}
              <div className="bg-white/70 rounded-xl p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">🎪 Target Scene</h5>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg font-medium">
                  {settings?.targetScene || currentAnalysis.target}
                </span>
              </div>

              {/* Final Task */}
              <div className="bg-white/70 rounded-xl p-4 border border-blue-200 md:col-span-2">
                <h5 className="font-semibold text-blue-800 mb-2">🎯 Final Task Goal</h5>
                <div className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  {settings?.finalTask || 'Create a detailed scene description.'}
                </div>
              </div>

              {/* Active Strategies */}
              <div className="bg-white/70 rounded-xl p-4 border border-blue-200">
                <h5 className="font-semibold text-blue-800 mb-2">⚡ Active Strategies</h5>
                <div className="space-y-2">
                  {currentAnalysis.strategies.slice(0, 2).map((strategy, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-indigo-700 font-medium text-xs">
                        {STRATEGY_DESCRIPTIONS[strategy.name] || strategy.name}
                      </span>
                      <span className="bg-indigo-100 text-indigo-600 px-2 py-1 rounded text-xs font-bold">
                        P{strategy.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Agency Indicators */}
            {currentAnalysis.agency && (
              <div className="mt-4 flex flex-wrap gap-2">
                {currentAnalysis.agency.undo_offer && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs">
                    ↩️ Undo Available
                  </span>
                )}
                {currentAnalysis.agency.offer_alternatives && (
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-lg text-xs">
                    🔄 Alternatives Offered
                  </span>
                )}
                {currentAnalysis.agency.credit_user && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs">
                    👤 User-Led
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} group`}
          >
            <div className={`flex items-start space-x-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                message.role === 'user' 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500' 
                  : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
              }`}>
                {message.role === 'assistant' ? (
                  <Bot className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              
              {/* Message bubble */}
              <div className={`relative px-6 py-4 rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                  : 'bg-white/90 backdrop-blur-sm text-gray-800 border border-white/50'
              }`}>
                {/* Message tail */}
                <div className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                  message.role === 'user' 
                    ? '-right-1.5 bg-gradient-to-r from-indigo-500 to-purple-500' 
                    : '-left-1.5 bg-white/90 border-l border-t border-white/50'
                }`}></div>
                
                <div className="relative z-10">
                  <div className="whitespace-pre-wrap leading-relaxed text-sm">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-2 opacity-70 ${
                    message.role === 'user' ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start group">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg bg-gradient-to-r from-emerald-400 to-cyan-400">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-white/50">
                <div className="flex items-center space-x-3">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-gray-700 font-medium">AI is crafting a response...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 border-t border-white/50 bg-white/30 backdrop-blur-sm">
        {/* Complete Design Button */}
        {messages.length > 2 && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={handleCompleteDesign}
              disabled={isLoading}
              className="group relative px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center space-x-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CheckCircle className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">Complete {selectedModule.title} Design</span>
            </button>
          </div>
        )}
        
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isDualLLMMode 
                ? `🧠 Advanced AI analysis mode - Chat with ${selectedModule.title} designer...`
                : `💬 Chat with your ${selectedModule.title} designer...`
              }
              className="w-full resize-none border-2 border-white/50 bg-white/70 backdrop-blur-sm rounded-xl px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-300 placeholder-gray-500 text-gray-800"
              rows={2}
              disabled={isLoading}
            />
            {inputValue.trim() && (
              <div className="absolute bottom-2 right-16 text-xs text-gray-500 bg-white/80 rounded-full px-2 py-1">
                {inputValue.length} chars
              </div>
            )}
            {/* Mode Indicator */}
            <div className="absolute bottom-2 right-2">
              {isDualLLMMode ? (
                <div className="flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                  <Brain className="w-3 h-3" />
                  <span>Dual</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  <MessageSquare className="w-3 h-3" />
                  <span>Std</span>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="group relative w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Send className="w-6 h-6 relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
          </button>
        </div>
        
        {messages.length > 2 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-600 border border-white/50">
              <span>💡</span>
              {isDualLLMMode ? (
                <span>Dual-LLM analyzes your preferences - Click "Complete Design" when ready</span>
              ) : (
                <span>Ready to finalize? Click "Complete Design" to generate your content</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 