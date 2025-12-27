
import React, { useState } from 'react';
import { Problem, EvaluationResult, User, Submission } from '../types';
import { evaluateCode } from '../services/geminiService';

interface ProblemDetailProps {
  problem: Problem;
  user: User;
  onBack: () => void;
  onNewSubmission: (submission: Submission) => void;
}

export const ProblemDetail: React.FC<ProblemDetailProps> = ({ problem, user, onBack, onNewSubmission }) => {
  const [code, setCode] = useState(problem.initialCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [currentResult, setCurrentResult] = useState<EvaluationResult | null>(null);

  const problemSubmissions = user.submissions
    .filter(s => s.problemId === problem.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setCurrentResult(null);
    try {
      const evaluation = await evaluateCode(problem, code);
      setCurrentResult(evaluation);
      
      const submission: Submission = {
        id: Math.random().toString(36).substr(2, 9),
        problemId: problem.id,
        code,
        timestamp: Date.now(),
        result: evaluation
      };
      
      onNewSubmission(submission);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
      {/* Left Column: Problem Description */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="text-slate-400 hover:text-white flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            Quay lại
          </button>
          <div className="flex gap-2">
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
              problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
              problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
              'bg-red-500/10 text-red-500'
            }`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        <div className="p-6 prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
          <div className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-8">
            {problem.description}
          </div>

          <h3 className="text-lg font-semibold mb-4 text-indigo-400">Ví dụ</h3>
          {problem.examples.map((ex, idx) => (
            <div key={idx} className="bg-slate-800/50 rounded-lg p-4 mb-4 border border-slate-700/50">
              <p className="text-sm font-semibold text-slate-400 mb-1">Đầu vào:</p>
              <code className="block bg-slate-950 p-2 rounded mb-3 text-emerald-400">{ex.input}</code>
              <p className="text-sm font-semibold text-slate-400 mb-1">Đầu ra:</p>
              <code className="block bg-slate-950 p-2 rounded mb-3 text-cyan-400">{ex.output}</code>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Editor & History */}
      <div className="flex flex-col gap-4 overflow-hidden">
        <div className="flex bg-slate-900 rounded-t-xl overflow-hidden border-x border-t border-slate-800">
          <button 
            onClick={() => setActiveTab('editor')}
            className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Code Editor
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 text-sm font-bold transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            Lịch sử ({problemSubmissions.length})
          </button>
        </div>

        {activeTab === 'editor' ? (
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-b-xl overflow-hidden flex flex-col shadow-2xl">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full bg-slate-950 p-6 code-font text-sm leading-relaxed text-indigo-100 outline-none resize-none"
              spellCheck="false"
            />
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-4">
              <button 
                className={`px-8 py-2 rounded-lg text-sm font-bold shadow-lg transition-all ${
                  isSubmitting ? 'bg-slate-700 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang chấm...' : 'Nộp bài'}
              </button>
            </div>
            
            {currentResult && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/50 overflow-y-auto max-h-64">
                 <div className="flex items-center justify-between mb-2">
                    <span className={`font-bold ${currentResult.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {currentResult.status}
                    </span>
                    <span className="text-white font-bold">{currentResult.score}/100</span>
                 </div>
                 <p className="text-sm text-slate-300 italic">{currentResult.feedback}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-b-xl overflow-y-auto p-4 space-y-4 shadow-2xl">
            {problemSubmissions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">Bạn chưa có lượt nộp bài nào cho bài này.</div>
            ) : (
              problemSubmissions.map((sub) => (
                <div key={sub.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${sub.result.status === 'Accepted' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {sub.result.status}
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(sub.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-white mb-2 font-semibold">Điểm: {sub.result.score}/100</div>
                  <p className="text-xs text-slate-400 mb-3">{sub.result.feedback}</p>
                  <details className="text-[10px]">
                    <summary className="cursor-pointer text-indigo-400 hover:underline">Xem code đã nộp</summary>
                    <pre className="mt-2 p-2 bg-slate-900 rounded text-slate-300 overflow-x-auto">{sub.code}</pre>
                  </details>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
