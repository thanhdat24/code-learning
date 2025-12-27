
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ProblemDetail } from './components/ProblemDetail';
import { PROBLEMS } from './constants';
import { Problem, User, Submission } from './types';
import { dbService } from './services/apiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Lưu dữ liệu lên database mỗi khi user có thay đổi (ví dụ: giải được bài mới)
  useEffect(() => {
    const syncData = async () => {
      if (user) {
        setIsSyncing(true);
        try {
          await dbService.saveUser(user);
        } catch (error) {
          console.error("Lỗi đồng bộ:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    // Chỉ sync khi user đã login và có sự thay đổi thực tế
    const timeoutId = setTimeout(syncData, 1000); 
    return () => clearTimeout(timeoutId);
  }, [user?.submissions.length, user?.points]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = loginInput.trim();
    if (!username) return;

    setIsLoading(true);
    try {
      // Thử lấy dữ liệu từ database trước
      let userData = await dbService.getUser(username);
      
      if (!userData) {
        // Nếu là user mới, khởi tạo mặc định
        userData = {
          username,
          solvedProblemIds: [],
          points: 0,
          submissions: []
        };
        await dbService.saveUser(userData);
      }
      
      setUser(userData);
    } catch (error) {
      alert("Không thể kết nối với Database. Vui lòng kiểm tra lại.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Đăng xuất sẽ đưa bạn về màn hình chính. Dữ liệu của bạn đã được lưu an toàn trên Cloud.')) {
      setUser(null);
      setSelectedProblem(null);
    }
  };

  const handleNewSubmission = (submission: Submission) => {
    if (!user) return;

    setUser(prev => {
      if (!prev) return null;
      
      const isFirstSuccess = submission.result.status === 'Accepted' && !prev.solvedProblemIds.includes(submission.problemId);
      
      return {
        ...prev,
        points: isFirstSuccess ? prev.points + submission.result.score : prev.points,
        solvedProblemIds: isFirstSuccess 
          ? [...prev.solvedProblemIds, submission.problemId] 
          : prev.solvedProblemIds,
        submissions: [submission, ...prev.submissions]
      };
    });
  };

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-600/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-indigo-500/20">CP</div>
            </div>
            <h1 className="text-2xl font-bold text-center text-white mb-2">Đăng nhập CodeMaster</h1>
            <p className="text-slate-400 text-center text-sm mb-8">Dữ liệu bài tập của bạn sẽ được lưu trữ vĩnh viễn trên MongoDB Cloud.</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1 tracking-widest">Username cá nhân</label>
                <input 
                  type="text" 
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Nhập tên của bạn..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700"
                  required
                  disabled={isLoading}
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
                  isLoading ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang tải dữ liệu Cloud...
                  </>
                ) : 'Bắt đầu luyện tập'}
              </button>
            </form>
            <div className="mt-8 flex items-center justify-center gap-2 text-slate-600">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
               <span className="text-[10px] uppercase font-bold tracking-widest">MongoDB Atlas Persistent Store</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Content
  return (
    <Layout user={user} onLogout={handleLogout} isSyncing={isSyncing}>
      {selectedProblem ? (
        <ProblemDetail 
          problem={selectedProblem} 
          user={user}
          onBack={() => setSelectedProblem(null)} 
          onNewSubmission={handleNewSubmission}
        />
      ) : (
        <>
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold mb-2 text-white italic">Thư viện bài tập</h2>
              <p className="text-slate-400">Chào mừng {user.username}, hệ thống đã sẵn sàng.</p>
            </div>
            <div className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl text-xs text-indigo-300 font-medium">
              Dữ liệu tự động đồng bộ sau mỗi lần nộp bài
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROBLEMS.map((problem) => {
              const isSolved = user.solvedProblemIds.includes(problem.id);
              return (
                <div 
                  key={problem.id}
                  className={`group relative bg-slate-900 border rounded-2xl p-6 transition-all cursor-pointer flex flex-col h-full ${
                    isSolved ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'border-slate-800 hover:border-indigo-500/50'
                  }`}
                  onClick={() => setSelectedProblem(problem)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-500' :
                      problem.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {problem.difficulty}
                    </span>
                    {isSolved && (
                      <span className="bg-emerald-500 text-white p-1 rounded-full shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-300">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      </span>
                    )}
                  </div>
                  
                  <h3 className={`text-xl font-bold mb-2 transition-colors ${isSolved ? 'text-emerald-400' : 'group-hover:text-indigo-400'}`}>
                    {problem.title}
                  </h3>
                  
                  <p className="text-slate-400 text-sm mb-6 line-clamp-3 flex-grow">
                    {problem.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-auto">
                    <span className="text-xs text-slate-500 font-semibold">{problem.category}</span>
                    <div className={`flex items-center gap-1 text-xs font-bold group-hover:translate-x-1 transition-transform ${isSolved ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      {isSolved ? 'Xem lại bài giải' : 'Bắt đầu giải bài'}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Layout>
  );
};

export default App;
