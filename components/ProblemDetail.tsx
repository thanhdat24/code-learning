import React, { useState, useEffect } from "react";
import {
  Problem,
  EvaluationResult,
  User,
  Submission,
  TestCaseResult,
} from "../types";
import { evaluateCode } from "../services/geminiService";

interface ProblemDetailProps {
  problem: Problem;
  user: User;
  onBack: () => void;
  onNewSubmission: (submission: Submission) => void;
}

export const ProblemDetail: React.FC<ProblemDetailProps> = ({
  problem,
  user,
  onBack,
  onNewSubmission,
}) => {
  const [code, setCode] = useState(problem.initialCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "history">("desc");
  const [bottomTab, setBottomTab] = useState<"test" | "console">("test");
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(
    problem.testCases[0].id
  );
  const [lastResult, setLastResult] = useState<EvaluationResult | null>(null);

  const currentTestCase = problem.testCases.find(
    (tc) => tc.id === selectedTestCaseId
  );
  const currentResult = lastResult?.testResults.find(
    (tr) => tr.testCaseId === selectedTestCaseId
  );

  const handleSubmit = async (isTestOnly: boolean = false) => {
    setIsSubmitting(true);
    try {
      const evaluation = await evaluateCode(problem, code);
      setLastResult(evaluation);

      if (!isTestOnly) {
        const submission: Submission = {
          id: Math.random().toString(36).substr(2, 9),
          problemId: problem.id,
          code,
          timestamp: Date.now(),
          result: evaluation,
        };
        onNewSubmission(submission);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] -m-6 overflow-hidden bg-[#0f172a]">
      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e293b] border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-sm font-bold text-slate-200">{problem.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-[#0f172a] rounded-lg p-1 border border-slate-700">
            <select className="bg-transparent text-xs font-bold text-indigo-400 px-2 outline-none cursor-pointer">
              <option>Javascript</option>
              <option>C#</option>
              <option>Python</option>
            </select>
          </div>
          <button
            onClick={() => setCode(problem.initialCode)}
            className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Cài đặt lại
          </button>

          <div className="h-6 w-px bg-slate-800 mx-1"></div>

          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded-lg text-xs font-bold text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10 transition-all flex items-center gap-2"
          >
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
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
            </svg>
            Chạy thử
          </button>

          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              isSubmitting
                ? "bg-slate-700 text-slate-500"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
            }`}
          >
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {isSubmitting ? "Đang chấm..." : "Nộp bài (10)"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Problem Description */}
        <div className="w-1/2 flex flex-col border-r border-slate-800 bg-[#0f172a]">
          <div className="flex border-b border-slate-800 bg-slate-900/50">
            <button
              onClick={() => setActiveTab("desc")}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "desc"
                  ? "text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Mô tả
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === "history"
                  ? "text-indigo-400 border-b-2 border-indigo-500 bg-slate-800/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Lịch sử nộp
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {activeTab === "desc" ? (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                    JD
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-400">
                      {user.username}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 rounded font-black uppercase tracking-tighter">
                        Đơn Giản
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        ❤️ 100 Điểm
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold">
                        Giới hạn kí tự:{" "}
                        <span className="text-rose-400">3000</span>
                      </span>
                    </div>
                  </div>
                </div>

                <h1 className="text-xl font-black text-white mb-6">Đề bài:</h1>
                <div className="text-slate-300 space-y-4 leading-relaxed whitespace-pre-wrap mb-8 text-[15px]">
                  {problem.description}
                </div>

                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">
                  Đầu vào/Đầu ra
                </h3>
                <ul className="space-y-3 text-sm text-slate-400 ml-4 list-disc">
                  {problem.constraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                {user.submissions.filter((s) => s.problemId === problem.id)
                  .length > 0 ? (
                  user.submissions
                    .filter((s) => s.problemId === problem.id)
                    .map((sub) => (
                      <div
                        key={sub.id}
                        className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                              sub.result.status === "Accepted"
                                ? "bg-emerald-500/20 text-emerald-500"
                                : "bg-rose-500/20 text-rose-500"
                            }`}
                          >
                            {sub.result.status}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(sub.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-white mb-1">
                          Điểm: {sub.result.score}/100
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2 italic">
                          "{sub.result.feedback}"
                        </p>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-20 text-slate-600 font-bold uppercase text-xs tracking-widest">
                    Không tìm thấy kết quả
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Editor & Test Bench */}
        <div className="w-1/2 flex flex-col bg-[#0f172a]">
          {/* Editor Area */}
          <div className="flex-1 relative border-b border-slate-800 group">
            <div className="absolute top-4 left-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <span className="text-[10px] font-bold text-slate-600 bg-slate-900/80 px-2 py-1 rounded">
                Ln 1, Col 1
              </span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="absolute inset-0 w-full h-full bg-[#0f172a] p-6 code-font text-[14px] text-indigo-100 outline-none resize-none leading-relaxed selection:bg-indigo-500/30"
              spellCheck="false"
            />
          </div>

          {/* Test Bench Area (Height: 40%) */}
          <div className="h-[40%] flex flex-col bg-[#1e293b]">
            <div className="flex items-center justify-between border-b border-slate-800 px-4 bg-slate-900/30">
              <div className="flex gap-6">
                <button
                  onClick={() => setBottomTab("test")}
                  className={`py-3 text-[11px] font-black uppercase tracking-[2px] transition-all ${
                    bottomTab === "test"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  KIỂM THỬ
                </button>
                <button
                  onClick={() => setBottomTab("console")}
                  className={`py-3 text-[11px] font-black uppercase tracking-[2px] transition-all ${
                    bottomTab === "console"
                      ? "text-white border-b-2 border-indigo-500"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  CONSOLE
                </button>
              </div>
              <button className="p-1 hover:bg-slate-700 rounded text-slate-400 transition-colors">
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {bottomTab === "test" ? (
              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar: Test case list */}
                <div className="w-1/3 border-r border-slate-800 overflow-y-auto bg-slate-900/80">
                  {problem.testCases.map((tc) => {
                    const result = lastResult?.testResults.find(
                      (r) => r.testCaseId === tc.id
                    );
                    const isSelected = selectedTestCaseId === tc.id;

                    return (
                      <button
                        key={tc.id}
                        onClick={() => setSelectedTestCaseId(tc.id)}
                        className={`w-full px-5 py-3.5 flex items-center justify-between group transition-all border-b border-slate-800/50 ${
                          isSelected
                            ? "bg-indigo-600/10"
                            : "hover:bg-slate-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {result ? (
                            result.status === "Passed" ? (
                              <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center animate-in zoom-in duration-300">
                                <svg
                                  className="w-2.5 h-2.5 text-white"
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
                              </div>
                            ) : (
                              <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center animate-in zoom-in duration-300">
                                <svg
                                  className="w-2.5 h-2.5 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              </div>
                            )
                          ) : tc.isPublic ? (
                            <div
                              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                                isSelected
                                  ? "border-indigo-400"
                                  : "border-slate-700 group-hover:border-slate-500"
                              }`}
                            ></div>
                          ) : (
                            <div className="flex items-center justify-center text-slate-600 group-hover:text-slate-400 transition-colors">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
                              </svg>
                            </div>
                          )}
                          <span
                            className={`text-[12px] font-bold tracking-tight transition-colors ${
                              isSelected ? "text-indigo-400" : "text-slate-400"
                            }`}
                          >
                            Kiểm thử {tc.id}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-1 h-4 bg-indigo-500 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Detail Panel: Selected test case details */}
                <div className="flex-1 p-6 overflow-y-auto bg-[#1e293b]">
                  {currentTestCase?.isPublic ? (
                    <div className="space-y-5 animate-in fade-in slide-in-from-right-2 duration-300">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                            Đầu vào
                          </label>
                          <div className="bg-slate-950/80 p-3 rounded-xl text-emerald-400 font-mono text-[13px] border border-slate-800 shadow-inner min-h-[40px]">
                            {currentTestCase.input}
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                            Đầu ra mong đợi
                          </label>
                          <div className="bg-slate-950/80 p-3 rounded-xl text-cyan-400 font-mono text-[13px] border border-slate-800 shadow-inner min-h-[40px]">
                            {currentTestCase.expectedOutput}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-800">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                          Đầu ra thực tế
                        </label>
                        <div
                          className={`bg-slate-950/80 p-3 rounded-xl font-mono text-[13px] border shadow-inner min-h-[40px] transition-all ${
                            !lastResult
                              ? "text-slate-600 border-slate-800"
                              : currentResult?.status === "Passed"
                              ? "text-emerald-400 border-emerald-500/20"
                              : "text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {lastResult
                            ? currentResult?.actualOutput || "N/A"
                            : "Vui lòng chạy thử code của bạn trước!"}
                        </div>
                      </div>

                      <div className="flex gap-12 pt-2">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                            Giới hạn thời gian
                          </label>
                          <div className="text-[13px] font-bold text-slate-300">
                            500 ms
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                            Thời gian thực thi
                          </label>
                          <div
                            className={`text-[13px] font-bold ${
                              lastResult
                                ? "text-emerald-400 animate-in fade-in"
                                : "text-slate-600"
                            }`}
                          >
                            {lastResult
                              ? `${currentResult?.executionTime || 0} ms`
                              : "0 ms"}
                          </div>
                        </div>
                      </div>

                      {currentResult?.message && (
                        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                          <p className="text-[11px] text-rose-400 font-medium">
                            Mô tả: {currentResult.message}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Hidden/Private Test Case Logic */
                    <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
                      {lastResult && currentResult ? (
                        <div className="text-center space-y-4">
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                              currentResult.status === "Passed"
                                ? "bg-emerald-500/20 text-emerald-500"
                                : "bg-rose-500/20 text-rose-500"
                            }`}
                          >
                            {currentResult.status === "Passed" ? (
                              <svg
                                className="w-8 h-8"
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
                            ) : (
                              <svg
                                className="w-8 h-8"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="3"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            )}
                          </div>
                          <h3
                            className={`text-lg font-black uppercase tracking-widest ${
                              currentResult.status === "Passed"
                                ? "text-emerald-500"
                                : "text-rose-500"
                            }`}
                          >
                            {currentResult.status === "Passed"
                              ? "Vượt qua!"
                              : "Thất bại!"}
                          </h3>
                          <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                            {currentResult.status === "Passed"
                              ? "Bạn đã vượt qua bài test ẩn này."
                              : "Code của bạn chưa xử lý đúng trường hợp này."}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-700 border border-dashed border-slate-700">
                            <svg
                              className="w-8 h-8"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                            Kiểm thử này đang bị khóa
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium max-w-[220px] mx-auto leading-relaxed">
                            Kết quả của các bài test ẩn chỉ hiển thị khi bạn
                            nhấn "Nộp bài" để đảm bảo tính công bằng.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 p-6 font-mono text-[13px] text-slate-400 bg-slate-950/80 overflow-y-auto selection:bg-indigo-500/20">
                {lastResult ? (
                  <div className="space-y-3 animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 text-indigo-400 border-b border-indigo-500/20 pb-2 mb-4">
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
                          d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-bold uppercase text-[10px] tracking-widest">
                        Execution Output
                      </span>
                    </div>
                    <p className="leading-relaxed">
                      <span className="text-slate-600 mr-2">Status:</span>{" "}
                      <span
                        className={
                          lastResult.status === "Accepted"
                            ? "text-emerald-500"
                            : "text-rose-500"
                        }
                      >
                        {lastResult.status}
                      </span>
                    </p>
                    <p className="leading-relaxed">
                      <span className="text-slate-600 mr-2">Feedback:</span>{" "}
                      {lastResult.feedback}
                    </p>

                    <div className="mt-8">
                      <p className="text-emerald-500 font-bold mb-2 flex items-center gap-2">
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
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                        Gợi ý tối ưu:
                      </p>
                      <ul className="space-y-2 ml-4">
                        {lastResult.suggestions.map((s, i) => (
                          <li
                            key={i}
                            className="text-slate-400 before:content-['>'] before:text-emerald-500/50 before:mr-2"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                    <svg
                      className="w-12 h-12 mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1"
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                    <p>No console output yet. Run your code to see results.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
