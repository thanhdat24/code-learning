
import React from 'react';
import { User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  isSyncing?: boolean;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, isSyncing, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">CP</div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                CodeMaster Pro
              </h1>
              {isSyncing && (
                <span className="text-[10px] text-indigo-400 animate-pulse font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                  Đang đồng bộ Cloud...
                </span>
              )}
            </div>
          </div>
          
          {user && (
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Solved</span>
                <span className="font-semibold text-indigo-400">{user.solvedProblemIds.length}</span>
                <div className="w-px h-3 bg-slate-700"></div>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Points</span>
                <span className="font-semibold text-amber-400">{user.points}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-white">{user.username}</p>
                  <button onClick={onLogout} className="text-[10px] text-slate-500 hover:text-red-400 uppercase font-bold tracking-tighter transition-colors">Đăng xuất</button>
                </div>
                <div className="w-9 h-9 rounded-full bg-indigo-500 border border-indigo-400 flex items-center justify-center font-bold text-white shadow-inner">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        {children}
      </main>

      <footer className="border-t border-slate-800 p-6 text-center text-sm text-slate-500">
        <p>&copy; 2024 CodeMaster Pro. Dữ liệu của bạn được bảo mật trên MongoDB Atlas.</p>
      </footer>
    </div>
  );
};
