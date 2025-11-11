import { contentsAPI } from '../utils/apiClient.js';

export class ContentManager {
  static CHAPTERS = [
    { id: 1, semester: 1, icon: '👋', title: 'التحيات والتعارف', subtitle: 'Salam dan Perkenalan' },
    { id: 2, semester: 1, icon: '👨‍👩‍👧‍👦', title: 'الأسرة', subtitle: 'Keluarga' },
    { id: 3, semester: 1, icon: '🏫', title: 'المدرسة', subtitle: 'Sekolah' },
    { id: 4, semester: 2, icon: '🌅', title: 'الْحَيَاةُ الْيَوْمِيَّةُ', subtitle: 'Kehidupan Sehari-hari' },
    { id: 5, semester: 2, icon: '⚽', title: 'الهواية', subtitle: 'Hobi' },
    { id: 6, semester: 2, icon: '🍽️', title: 'الطعام و الشراب', subtitle: 'Makanan dan Minuman' }
  ];

  static SUBMENUS = [
    { id: 'mufrodat', icon: '📚', title: 'Mufrodat', subtitle: 'Kosakata' },
    { id: 'qiroah', icon: '📖', title: 'Qiroah', subtitle: 'Membaca' },
    { id: 'hiwar', icon: '💬', title: 'Hiwar', subtitle: 'Percakapan' },
    { id: 'qowaid', icon: '✍️', title: 'Qowaid', subtitle: 'Tata Bahasa' },
    { id: 'quiz', icon: '🎮', title: 'Quiz', subtitle: 'Latihan Soal' }
  ];

  static SAMPLE_FILES = {
    'mufrodat': [
      { 
        name: 'kosakata-harian.pdf', 
        type: 'application/pdf', 
        size: '2.4 MB', 
        content: 'PDF',
        data: `KOSAKATA BAHASA ARAB SEHARI-HARI\n\n1. التحيات (Salam)\n   - السلام عليكم - Assalamu'alaikum\n   - وعليكم السلام - Wa'alaikum salam\n   - مرحبا - Marhaban\n   - مع السلامة - Ma'assalama`
      }
    ],
    'qiroah': [
      { 
        name: 'teks-bacaan.docx', 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
        size: '0.8 MB', 
        content: 'TEXT',
        data: `نص القراءة العربية\n\nفي المدرسة\n\nأنا طالب في المدرسة. أذهب إلى المدرسة كل يوم. في المدرسة أتعلم اللغة العربية والرياضيات والعلوم.`
      }
    ],
    'hiwar': [
      { 
        name: 'video-percakapan.mp4', 
        type: 'video/mp4', 
        size: '15.2 MB', 
        content: 'VIDEO',
        data: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      }
    ],
    'qowaid': [
      { 
        name: 'tata-bahasa.pdf', 
        type: 'application/pdf', 
        size: '3.1 MB', 
        content: 'PDF',
        data: `TATA BAHASA ARAB DASAR\n\n1. ISIM (Kata Benda)\n   - Isim adalah kata yang menunjukkan pada suatu benda, orang, atau konsep.\n   - Contoh: كِتَابٌ (buku), مُعَلِّمٌ (guru), بَيْتٌ (rumah)`
      }
    ]
  };

  static async getContents(chapterId, section) {
    try {
      return await contentsAPI.list(chapterId, section);
    } catch (error) {
      console.error('Failed to fetch contents:', error);
      return [];
    }
  }

  static async createContent(contentData) {
    try {
      return await contentsAPI.create(contentData);
    } catch (error) {
      console.error('Failed to create content:', error);
      throw error;
    }
  }

  static async deleteContent(contentId) {
    try {
      await contentsAPI.delete(contentId);
      return true;
    } catch (error) {
      console.error('Failed to delete content:', error);
      throw error;
    }
  }

  static getFileIcon(fileType) {
    if (!fileType) return '📎';
    
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📎';
  }

  static formatFileSize(bytes) {
    if (!bytes) return '0 KB';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  static getAcceptTypes(section) {
    switch (section) {
      case 'mufrodat':
      case 'qowaid':
        return 'image/*,.pdf,.doc,.docx,.txt';
      case 'qiroah':
        return 'image/*,.pdf,audio/*,.txt,.doc,.docx,.mp3,.wav';
      case 'hiwar':
        return 'video/*,.mp4,.avi,.mov';
      default:
        return '*';
    }
  }

  static getUploadHint(section) {
    switch (section) {
      case 'mufrodat':
      case 'qowaid':
        return 'Unggah gambar, PDF, atau dokumen teks';
      case 'qiroah':
        return 'Unggah teks, gambar, PDF, atau audio';
      case 'hiwar':
        return 'Unggah video percakapan';
      default:
        return 'Unggah file materi';
    }
  }
}
