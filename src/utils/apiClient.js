const API_BASE = '/.netlify/functions/api';

export class ApiClient {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API Request failed:', error);
      throw new Error(`Network error: ${error.message}`);
    }
  }

  static async get(endpoint) {
    return this.request(endpoint);
  }

  static async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    });
  }

  static async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    });
  }

  static async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Specific API methods for the application
export const studentsAPI = {
  async list() {
    return ApiClient.get('/students');
  },

  async create(studentData) {
    return ApiClient.post('/students', studentData);
  },

  async getById(id) {
    return ApiClient.get(`/students/${id}`);
  }
};

export const contentsAPI = {
  async list(chapter = null, section = null) {
    const params = new URLSearchParams();
    if (chapter) params.append('chapter', chapter);
    if (section) params.append('section', section);
    
    const query = params.toString();
    return ApiClient.get(`/contents${query ? `?${query}` : ''}`);
  },

  async create(contentData) {
    return ApiClient.post('/contents', contentData);
  },

  async delete(id) {
    return ApiClient.delete(`/contents/${id}`);
  },

  async getById(id) {
    return ApiClient.get(`/contents/${id}`);
  }
};

export const quizAPI = {
  async submitResult(quizData) {
    return ApiClient.post('/quiz-results', quizData);
  },

  async getResults(studentId = null) {
    const query = studentId ? `?student_id=${studentId}` : '';
    return ApiClient.get(`/quiz-results${query}`);
  }
};
