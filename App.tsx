import React, { useState, useEffect, useMemo } from "react";
import { Layout } from "./components/Layout";
import { ProblemDetail } from "./components/ProblemDetail";
import { PROBLEMS } from "./constants";
import { Problem, User, Submission, Difficulty } from "./types";
import { dbService } from "./services/apiService";

const AUTH_KEY = "codemaster_auth_user";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [loginInput, setLoginInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "solved" | "unsolved"
  >("all");
  const [levelFilter, setLevelFilter] = useState<"all" | Difficulty>("all");

  // Persistence: Check for session on F5
  useEffect(() => {
    const checkSession = async () => {
      const lastUsername = localStorage.getItem(AUTH_KEY);
      if (lastUsername) {
        try {
          const userData = await dbService.getUser(lastUsername);
          if (userData) {
            setUser(userData);
          } else {
            localStorage.removeItem(AUTH_KEY);
          }
        } catch (err) {
          console.error("Session restoration failed:", err);
          localStorage.removeItem(AUTH_KEY);
        }
      }
      setIsBooting(false);
    };

    checkSession();
  }, []);

  // Sync data to MongoDB when changes occur
  useEffect(() => {
    const syncData = async () => {
      if (user) {
        setIsSyncing(true);
        try {
          await dbService.saveUser(user);
        } catch (error) {
          console.error("Auto-sync failed:", error);
        } finally {
          setIsSyncing(false);
        }
      }
    };

    if (user) {
      const timeoutId = setTimeout(syncData, 1500);
      return () => clearTimeout(timeoutId);
    }
  }, [user?.submissions.length, user?.points]);

  // Stats Calculation
  const stats = useMemo(() => {
    const counts = {
      Easy: { solved: 0, total: 0 },
      Medium: { solved: 0, total: 0 },
      Hard: { solved: 0, total: 0 },
    };
    PROBLEMS.forEach((p) => {
      counts[p.difficulty].total++;
      if (user?.solvedProblemIds.includes(p.id)) {
        counts[p.difficulty].solved++;
      }
    });
    return counts;
  }, [user?.solvedProblemIds]);

  // Filtered Problems
  const filteredProblems = useMemo(() => {
    return PROBLEMS.filter((p) => {
      const matchesSearch = p.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const isSolved = user?.solvedProblemIds.includes(p.id);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "solved" && isSolved) ||
        (statusFilter === "unsolved" && !isSolved);
      const matchesLevel =
        levelFilter === "all" || p.difficulty === levelFilter;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [searchQuery, statusFilter, levelFilter, user?.solvedProblemIds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = loginInput.trim();
    if (!username) return;

    setIsLoading(true);
    try {
      let userData = await dbService.getUser(username);
      if (!userData) {
        userData = {
          username,
          solvedProblemIds: [],
          points: 0,
          submissions: [],
        };
        await dbService.saveUser(userData);
      }
      setUser(userData);
      localStorage.setItem(AUTH_KEY, username);
    } catch (error) {
      alert(
        "Lỗi kết nối server: " +
          (error instanceof Error ? error.message : "Vui lòng thử lại")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Đăng xuất khỏi hệ thống?")) {
      setUser(null);
      setSelectedProblem(null);
      localStorage.removeItem(AUTH_KEY);
    }
  };

  const handleNewSubmission = (submission: Submission) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return null;
      const isFirstSuccess =
        submission.result.status === "Accepted" &&
        !prev.solvedProblemIds.includes(submission.problemId);
      return {
        ...prev,
        points: isFirstSuccess
          ? prev.points + submission.result.score
          : prev.points,
        solvedProblemIds: isFirstSuccess
          ? [...prev.solvedProblemIds, submission.problemId]
          : prev.solvedProblemIds,
        submissions: [submission, ...prev.submissions],
      };
    });
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          Đang kết nối MongoDB...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center font-bold text-3xl text-white mx-auto mb-6 shadow-lg shadow-indigo-500/20">
              CP
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              CodeMaster Login
            </h1>
            <p className="text-slate-400 text-sm mb-8">
              Nhập username để truy cập dữ liệu từ Cloud
            </p>
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="Ví dụ: codemaster_01"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all"
                required
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isLoading
                    ? "bg-slate-800 text-slate-500"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                }`}
              >
                {isLoading ? "Đang xác thực..." : "Đăng nhập"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Stats Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-wrap items-center justify-around gap-8">
            <div className="flex flex-col items-center">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
                Dễ
              </div>
              <div className="text-2xl font-black text-emerald-500">
                {stats.Easy.solved}
                <span className="text-slate-700 mx-1">/</span>
                {stats.Easy.total}
              </div>
            </div>
            <div className="w-px h-10 bg-slate-800 hidden md:block"></div>
            <div className="flex flex-col items-center">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
                Trung bình
              </div>
              <div className="text-2xl font-black text-amber-500">
                {stats.Medium.solved}
                <span className="text-slate-700 mx-1">/</span>
                {stats.Medium.total}
              </div>
            </div>
            <div className="w-px h-10 bg-slate-800 hidden md:block"></div>
            <div className="flex flex-col items-center">
              <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
                Khó
              </div>
              <div className="text-2xl font-black text-rose-500">
                {stats.Hard.solved}
                <span className="text-slate-700 mx-1">/</span>
                {stats.Hard.total}
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div className="relative flex-1 w-full">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Nhập nội dung tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="all">Trạng thái: Tất cả</option>
                <option value="solved">Đã giải</option>
                <option value="unsolved">Chưa giải</option>
              </select>
            </div>

            <div className="w-full md:w-48">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="all">Cấp độ: Tất cả</option>
                <option value="Easy">Dễ</option>
                <option value="Medium">Trung bình</option>
                <option value="Hard">Khó</option>
              </select>
            </div>
          </div>

          {/* Grid Display */}
          {filteredProblems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProblems.map((problem) => {
                const isSolved = user.solvedProblemIds.includes(problem.id);
                return (
                  <div
                    key={problem.id}
                    className={`group relative bg-slate-900 border rounded-2xl p-6 transition-all cursor-pointer flex flex-col h-full ${
                      isSolved
                        ? "border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                        : "border-slate-800 hover:border-indigo-500/50"
                    }`}
                    onClick={() => setSelectedProblem(problem)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          problem.difficulty === "Easy"
                            ? "bg-green-500/10 text-green-500"
                            : problem.difficulty === "Medium"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {problem.difficulty === "Easy"
                          ? "Dễ"
                          : problem.difficulty === "Medium"
                          ? "Trung bình"
                          : "Khó"}
                      </span>
                      {isSolved && (
                        <span className="bg-emerald-500 text-white p-1 rounded-full">
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <h3
                      className={`text-xl font-bold mb-2 transition-colors ${
                        isSolved
                          ? "text-emerald-400"
                          : "group-hover:text-indigo-400"
                      }`}
                    >
                      {problem.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
                      {problem.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-auto">
                      <span className="text-xs text-slate-500 font-semibold">
                        {problem.category}
                      </span>
                      <div className="text-indigo-400 text-xs font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Chi tiết{" "}
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
              <div className="text-slate-500 mb-2">
                Không tìm thấy bài tập phù hợp
              </div>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setLevelFilter("all");
                }}
                className="text-indigo-400 text-sm hover:underline"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default App;
