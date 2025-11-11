import { studentsAPI } from '../utils/apiClient.js';

export class LoginManager {
  static USER_ROLES = {
    STUDENT: 'student',
    TEACHER: 'teacher'
  };

  static STORAGE_KEYS = {
    USER_ROLE: 'user_role',
    STUDENT_ID: 'student_id',
    STUDENT_NAME: 'student_name'
  };

  static generateStudentId(name) {
    const namePart = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `${namePart}${randomPart}`;
  }

  static async loginStudent(name) {
    if (!name || name.length < 3) {
      throw new Error('Nama harus minimal 3 karakter');
    }

    const studentId = this.generateStudentId(name);
    
    try {
      // Coba daftarkan siswa baru
      await studentsAPI.create({
        id: studentId,
        name: name
      });

      this.setUserSession(this.USER_ROLES.STUDENT, studentId, name);
      return { success: true, studentId, isNew: true };
    } catch (error) {
      // Jika sudah terdaftar, langsung login
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        this.setUserSession(this.USER_ROLES.STUDENT, studentId, name);
        return { success: true, studentId, isNew: false };
      }
      throw error;
    }
  }

  static loginTeacher(password) {
    if (password === 'guru123') {
      this.setUserSession(this.USER_ROLES.TEACHER);
      return true;
    }
    throw new Error('Password guru salah');
  }

  static setUserSession(role, studentId = null, studentName = null) {
    if (role === this.USER_ROLES.STUDENT) {
      localStorage.setItem(this.STORAGE_KEYS.STUDENT_ID, studentId);
      localStorage.setItem(this.STORAGE_KEYS.STUDENT_NAME, studentName);
    }
    localStorage.setItem(this.STORAGE_KEYS.USER_ROLE, role);
  }

  static getCurrentUser() {
    const role = localStorage.getItem(this.STORAGE_KEYS.USER_ROLE);
    
    if (role === this.USER_ROLES.STUDENT) {
      return {
        role,
        studentId: localStorage.getItem(this.STORAGE_KEYS.STUDENT_ID),
        studentName: localStorage.getItem(this.STORAGE_KEYS.STUDENT_NAME)
      };
    }
    
    return { role };
  }

  static isLoggedIn() {
    return !!localStorage.getItem(this.STORAGE_KEYS.USER_ROLE);
  }

  static logout() {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  static async getStudentsList() {
    try {
      return await studentsAPI.list();
    } catch (error) {
      console.error('Failed to fetch students:', error);
      return [];
    }
  }
}
