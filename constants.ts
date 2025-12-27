
import { Problem } from './types';

export const PROBLEMS: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Array',
    description: 'Cho một mảng số nguyên `nums` và một số nguyên `target`, hãy trả về chỉ số của hai số sao cho tổng của chúng bằng `target`. Bạn có thể giả định rằng mỗi đầu vào sẽ có đúng một giải pháp và bạn không được sử dụng cùng một phần tử hai lần.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Vì nums[0] + nums[1] == 9, chúng ta trả về [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9'
    ],
    initialCode: 'function twoSum(nums, target) {\n  // Viết code của bạn ở đây\n  \n}'
  },
  {
    id: 'palindrome-number',
    title: 'Palindrome Number',
    difficulty: 'Easy',
    category: 'Math',
    description: 'Kiểm tra xem một số nguyên `x` có phải là số đối xứng (palindrome) hay không. Một số nguyên là số đối xứng nếu nó đọc xuôi và ngược đều giống nhau.',
    examples: [
      {
        input: 'x = 121',
        output: 'true',
        explanation: '121 đọc từ trái sang phải hay phải sang trái đều là 121.'
      },
      {
        input: 'x = -121',
        output: 'false',
        explanation: 'Từ trái sang phải là -121, từ phải sang trái là 121-.'
      }
    ],
    constraints: [
      '-2^31 <= x <= 2^31 - 1'
    ],
    initialCode: 'function isPalindrome(x) {\n  // Viết code của bạn ở đây\n  \n}'
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Medium',
    category: 'Linked List',
    description: 'Cho đầu của một danh sách liên kết đơn, hãy đảo ngược danh sách và trả về danh sách đã đảo ngược.',
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]'
      }
    ],
    constraints: [
      'Số lượng nút trong danh sách nằm trong khoảng [0, 5000]',
      '-5000 <= Node.val <= 5000'
    ],
    initialCode: '/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nfunction reverseList(head) {\n  \n}'
  }
];
