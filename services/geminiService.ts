import { GoogleGenAI, Type } from "@google/genai";
import { Problem, EvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const evaluateCode = async (
  problem: Problem,
  code: string
): Promise<EvaluationResult> => {
  const testCasesPrompt = problem.testCases
    .map(
      (tc) =>
        `Test Case ${tc.id}: Input: ${tc.input}, Expected Output: ${tc.expectedOutput}`
    )
    .join("\n");

  const prompt = `
    Bạn là một hệ thống chấm bài lập trình tự động (Online Judge).
    Hãy đánh giá code sau cho bài toán: "${problem.title}".
    
    Đề bài: ${problem.description}
    Ràng buộc: ${problem.constraints.join(", ")}
    
    Danh sách các Test Cases cần kiểm tra:
    ${testCasesPrompt}
    
    Code của người dùng:
    \`\`\`javascript
    ${code}
    \`\`\`
    
    Yêu cầu:
    1. Chạy thử code với TỪNG test case.
    2. Nếu code có lỗi cú pháp, trả về Compilation Error.
    3. Với mỗi test case, xác định status (Passed/Failed), output thực tế và thời gian chạy giả định (ms).
    4. Trả về kết quả tổng quan (Accepted nếu pass hết, ngược lại là Wrong Answer).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            testResults: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  testCaseId: { type: Type.STRING },
                  status: { type: Type.STRING },
                  actualOutput: { type: Type.STRING },
                  executionTime: { type: Type.NUMBER },
                  message: { type: Type.STRING },
                },
                required: [
                  "testCaseId",
                  "status",
                  "actualOutput",
                  "executionTime",
                ],
              },
            },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            optimizedCode: { type: Type.STRING },
          },
          required: [
            "status",
            "score",
            "feedback",
            "testResults",
            "suggestions",
            "optimizedCode",
          ],
        },
      },
    });

    return JSON.parse(response.text) as EvaluationResult;
  } catch (error) {
    console.error("Evaluation Error:", error);
    return {
      status: "Compilation Error",
      score: 0,
      feedback: "Lỗi hệ thống chấm bài.",
      testResults: [],
      suggestions: [],
      optimizedCode: "",
    };
  }
};
