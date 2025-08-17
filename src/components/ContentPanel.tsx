import { Download } from 'lucide-react';
import { ContentItem, ContentModule } from '../types';

interface ContentPanelProps {
  items: ContentItem[];
  modules: ContentModule[];
  allCompleted: boolean;
  onDownload: () => void;
  onContentUpdate: (itemId: string, content: string) => void;
  enabledModules: { [key: string]: boolean };
}

export function ContentPanel({ items, modules, allCompleted, onDownload, onContentUpdate, enabledModules }: ContentPanelProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Scene Design Studio
        </h2>
        {allCompleted && (
          <button
            onClick={onDownload}
            className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Download className="w-5 h-5 relative z-10 group-hover:animate-bounce" />
            <span className="relative z-10">Download Scene</span>
          </button>
        )}
      </div>
      
      {items.map((item) => {
        const module = modules.find(m => m.id === item.id);
        
        return (
          <div
            key={item.id}
            className="group relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/90"
          >
            {/* Gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${enabledModules[item.id] ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-gray-400 to-gray-500'} animate-pulse`}></div>
                <h3 className="text-2xl font-bold text-gray-800">
                  {item.title}
                </h3>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                  enabledModules[item.id] 
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-300'
                }`}>
                  {enabledModules[item.id] ? '✏️ Editable' : '🔒 Locked'}
                </span>
              </div>
            </div>
            
            <div className={`relative min-h-[160px] rounded-xl border-2 border-dashed transition-all duration-300 ${
              enabledModules[item.id] 
                ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 hover:border-indigo-300 focus-within:border-indigo-400 focus-within:bg-indigo-50/30 group-hover:border-purple-300' 
                : 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 cursor-not-allowed'
            }`}>
              <textarea
                value={item.content || ''}
                onChange={(e) => enabledModules[item.id] && onContentUpdate(item.id, e.target.value)}
                placeholder=""
                disabled={!enabledModules[item.id]}
                className={`w-full h-full min-h-[160px] p-6 bg-transparent border-none resize-none focus:outline-none text-lg leading-relaxed ${
                  enabledModules[item.id] 
                    ? 'text-gray-800 cursor-text' 
                    : 'text-gray-500 cursor-not-allowed'
                }`}
                style={{ 
                  resize: 'vertical',
                  minHeight: '160px'
                }}
              />
              {/* Custom placeholder when empty */}
              {!item.content && (
                <div className={`absolute top-6 left-6 pointer-events-none text-lg ${
                  enabledModules[item.id] ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {enabledModules[item.id] 
                    ? `✨ Start designing your ${item.title.toLowerCase()} here...`
                    : `🔒 Complete AI design first to edit ${item.title.toLowerCase()}...`
                  }
                </div>
              )}
            </div>
            
            {module && (
              <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <p className="text-sm text-indigo-700 font-medium flex items-center space-x-2">
                  <span>💡</span>
                  <span>{module.description}</span>
                </p>
              </div>
            )}
          </div>
        );
      })}
      
      <div className="bg-gradient-to-br from-white/90 to-indigo-50/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">💡</span>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Quick Guide</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group p-4 bg-white/70 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-sm">✏️</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Direct Editing</h4>
                <p className="text-sm text-gray-600">Complete AI design first, then edit text areas directly to refine your creation</p>
              </div>
            </div>
          </div>
          
          <div className="group p-4 bg-white/70 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">AI Assistance</h4>
                <p className="text-sm text-gray-600">Use the chat panel on the right to start AI-guided design process</p>
              </div>
            </div>
          </div>
          
          <div className="group p-4 bg-white/70 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-sm">🎨</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Mixed Approach</h4>
                <p className="text-sm text-gray-600">Combine AI suggestions with your personal touches</p>
              </div>
            </div>
          </div>
          
          <div className="group p-4 bg-white/70 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <span className="text-white text-sm">📥</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">Download</h4>
                <p className="text-sm text-gray-600">Complete your scene to download the final design</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 