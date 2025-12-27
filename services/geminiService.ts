
import { GoogleGenAI, Type } from "@google/genai";
import { Problem, EvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const evaluateCode = async (problem: Problem, code: string): Promise<EvaluationResult> => {
  const prompt = `
    You are an expert technical interviewer and competitive programmer. 
    Evaluate the following solution for the problem: "${problem.title}".
    
    Problem Description: ${problem.description}
    Constraints: ${problem.constraints.join(', ')}
    
    User Code:
    \`\`\`javascript
    ${code}
    \`\`\`
    
    Please analyze if the code correctly solves the problem, its time and space complexity, and provide constructive feedback.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: {
              type: Type.STRING,
              description: "One of: 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Compilation Error'",
            },
            score: {
              type: Type.NUMBER,
              description: "A score from 0 to 100 based on correctness and efficiency.",
            },
            feedback: {
              type: Type.STRING,
              description: "A concise summary of the code quality and correctness in Vietnamese.",
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of actionable improvements in Vietnamese.",
            },
            optimizedCode: {
              type: Type.STRING,
              description: "An optimized version of the code.",
            },
          },
          required: ["status", "score", "feedback", "suggestions", "optimizedCode"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return result as EvaluationResult;
  } catch (error) {
    console.error("Error evaluating code:", error);
    return {
      status: 'Compilation Error',
      score: 0,
      feedback: "Đã xảy ra lỗi khi kết nối với hệ thống chấm bài. Vui lòng thử lại sau.",
      suggestions: ["Kiểm tra kết nối mạng", "Thử lại trong vài giây"],
      optimizedCode: ""
    };
  }
};
