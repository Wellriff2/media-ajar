import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const setupQueries = [
  `CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS learning_contents (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER NOT NULL,
    section VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_names TEXT[],
    file_types TEXT[],
    file_sizes TEXT[],
    file_contents TEXT[],
    file_datas TEXT[],
    file_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  `CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(id),
    chapter_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    answers JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )`,

  `CREATE INDEX IF NOT EXISTS idx_contents_chapter_section ON learning_contents(chapter_id, section)`,
  `CREATE INDEX IF NOT EXISTS idx_quiz_results_student ON quiz_results(student_id)`,
  `CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC)`
];

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Setting up database tables...');
    
    for (const query of setupQueries) {
      await client.query(query);
      console.log('✅ Query executed successfully');
    }
    
    console.log('🎉 Database setup completed!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase().catch(console.error);
