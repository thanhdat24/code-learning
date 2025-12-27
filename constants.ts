import { Problem } from "./types";

export const PROBLEMS: Problem[] = [
  {
    id: "second-character",
    title: "Second Character",
    difficulty: "Easy",
    category: "String",
    description:
      'Bạn được cung cấp chuỗi ký tự `s` (chỉ bao gồm các kí tự viết thường). Yêu cầu bạn hãy in ra kí tự với tần suất xuất hiện nhiều thứ 2 (không có 2 kí tự nào có cùng tần số xuất hiện). Nếu không có hãy in ra `?`.\n\nVí dụ:\n- Input: s = "abaa", Output: "b"\nGiải thích: ký tự a xuất hiện 3 lần, ký tự b xuất hiện 1 lần.',
    constraints: ["[Thời gian chạy] 0.5s với JS", "s.length <= 100"],
    initialCode:
      "function secondChar(s) {\n  // Viết code của bạn ở đây\n  \n}",
    testCases: [
      { id: "1", input: '"abaa"', expectedOutput: '"b"', isPublic: true },
      { id: "2", input: '"aabbbcccc"', expectedOutput: '"b"', isPublic: true },
      { id: "3", input: '"abc"', expectedOutput: '"?"', isPublic: true },
      { id: "4", input: '"aaaaa"', expectedOutput: '"?"', isPublic: false },
      { id: "5", input: '"pqpqpp"', expectedOutput: '"q"', isPublic: false },
      { id: "6", input: '"zzzxx"', expectedOutput: '"x"', isPublic: false },
    ],
  },
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array",
    description:
      "Cho một mảng số nguyên `nums` và một số nguyên `target`, hãy trả về chỉ số của hai số sao cho tổng của chúng bằng `target`.",
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i] <= 10^9"],
    initialCode: "function twoSum(nums, target) {\n  \n}",
    testCases: [
      {
        id: "1",
        input: "nums=[2,7,11,15], target=9",
        expectedOutput: "[0,1]",
        isPublic: true,
      },
      {
        id: "2",
        input: "nums=[3,2,4], target=6",
        expectedOutput: "[1,2]",
        isPublic: true,
      },
      {
        id: "3",
        input: "nums=[3,3], target=6",
        expectedOutput: "[0,1]",
        isPublic: false,
      },
    ],
  },
];
