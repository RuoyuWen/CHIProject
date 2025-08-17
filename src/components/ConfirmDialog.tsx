import { Check, X } from 'lucide-react';

interface ConfirmDialogProps {
  content: string;
  moduleTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ content, moduleTitle, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto border border-white/50 animate-slideUp">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Ready to Apply?
            </h3>
            <p className="text-lg text-gray-600">
              Review your AI-generated {moduleTitle} content
            </p>
          </div>
          
          {/* Content Preview */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border-2 border-indigo-100 shadow-inner">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-pulse"></div>
              <p className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Generated Content
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-gray-800 whitespace-pre-wrap leading-relaxed shadow-lg border border-white/50">
              {content}
            </div>
          </div>
          
          {/* Description */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200">
            <p className="text-gray-700 text-center leading-relaxed">
              <span className="font-semibold">🎯 Perfect fit?</span> Apply this content to your {moduleTitle} section. 
              <br />
              <span className="font-semibold">🔧 Need adjustments?</span> Continue refining with more AI assistance.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onCancel}
              className="group relative px-8 py-4 border-2 border-gray-300 bg-white/70 backdrop-blur-sm rounded-xl text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl font-semibold text-lg overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <X className="w-6 h-6 relative z-10 group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">Continue Refining</span>
            </button>
            <button
              onClick={onConfirm}
              className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl font-semibold text-lg hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Check className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform duration-300" />
              <span className="relative z-10">Apply Content</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 