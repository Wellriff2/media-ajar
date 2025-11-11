import { quizAPI } from '../utils/apiClient.js';
import { LoginManager } from './LoginManager.js';

export class QuizManager {
  static QUIZ_DATA = {
    1: [ // Chapter 1
      {
        question: 'Apa arti dari "السلام عليكم"?',
        options: ['Selamat pagi', 'Selamat tinggal', 'Salam sejahtera', 'Terima kasih'],
        correct: 2
      },
      {
        question: 'Kata "أب" dalam bahasa Indonesia berarti?',
        options: ['Ibu', 'Ayah', 'Kakak', 'Adik'],
        correct: 1
      },
      {
        question: 'Bagaimana cara mengatakan "Sekolah" dalam bahasa Arab?',
        options: ['البيت', 'المدرسة', 'المسجد', 'السوق'],
        correct: 1
      }
    ],
    2: [ // Chapter 2
      {
        question: 'Apa arti dari "أم"?',
        options: ['Ayah', 'Ibu', 'Saudara', 'Kakek'],
        correct: 1
      },
      {
        question: 'Kata "أخ" berarti?',
        options: ['Saudara perempuan', 'Saudara laki-laki', 'Anak', 'Orang tua'],
        correct: 1
      }
    ]
    // Tambahkan quiz untuk chapter lainnya...
  };

  static async submitQuizResult(chapterId, score, totalQuestions, answers) {
    const user = LoginManager.getCurrentUser();
    
    if (user.role !== LoginManager.USER_ROLES.STUDENT) {
      throw new Error('Hanya siswa yang dapat mengumpulkan quiz');
    }

    try {
      return await quizAPI.submitResult({
        student_id: user.studentId,
        chapter_id: chapterId,
        score: score,
        total_questions: totalQuestions,
        answers: answers
      });
    } catch (error) {
      console.error('Failed to submit quiz result:', error);
      throw error;
    }
  }

  static async getStudentResults(studentId = null) {
    try {
      return await quizAPI.getResults(studentId);
    } catch (error) {
      console.error('Failed to fetch quiz results:', error);
      return [];
    }
  }

  static calculateScore(answers, questions) {
    return answers.reduce((score, answer, index) => {
      return score + (answer === questions[index].correct ? 1 : 0);
    }, 0);
  }

  static getQuizQuestions(chapterId) {
    return this.QUIZ_DATA[chapterId] || this.QUIZ_DATA[1]; // Fallback ke chapter 1
  }

  static getPerformanceFeedback(percentage) {
    if (percentage >= 90) return { text: 'Luar Biasa!', color: '#48bb78' };
    if (percentage >= 80) return { text: 'Bagus Sekali!', color: '#68d391' };
    if (percentage >= 70) return { text: 'Baik!', color: '#f6e05e' };
    if (percentage >= 60) return { text: 'Cukup', color: '#ed8936' };
    return { text: 'Perlu belajar lagi', color: '#fc8181' };
  }
}
