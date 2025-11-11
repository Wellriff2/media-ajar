import { getPool, query, withTransaction } from '../../src/utils/database.js';

export const handler = async (event) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const path = event.path.replace(/\.netlify\/functions\/[^/]+/, '');
  const segments = path.split('/').filter(e => e);
  
  try {
    let result;

    switch (event.httpMethod) {
      case 'GET':
        result = await handleGet(event, segments);
        break;
      case 'POST':
        result = await handlePost(event, segments);
        break;
      case 'PUT':
        result = await handlePut(event, segments);
        break;
      case 'DELETE':
        result = await handleDelete(event, segments);
        break;
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    return {
      statusCode: 200,
      headers,
      body: typeof result === 'string' ? result : JSON.stringify(result)
    };
  } catch (error) {
    console.error('API Error:', error);
    
    return {
      statusCode: error.statusCode || 500,
      headers,
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      })
    };
  }
};

async function handleGet(event, segments) {
  if (segments.length === 0) {
    return { message: 'Arabic Learning Platform API', version: '1.0.0' };
  }

  if (segments[0] === 'students') {
    if (segments[1]) {
      // Get specific student
      const result = await query('SELECT * FROM students WHERE id = $1', [segments[1]]);
      return result.rows[0] || { error: 'Student not found' };
    } else {
      // List all students
      const result = await query('SELECT * FROM students ORDER BY created_at DESC');
      return result.rows;
    }
  }

  if (segments[0] === 'contents') {
    const { chapter, section } = event.queryStringParameters || {};
    
    if (segments[1]) {
      // Get specific content
      const result = await query('SELECT * FROM learning_contents WHERE id = $1', [segments[1]]);
      return result.rows[0] || { error: 'Content not found' };
    } else {
      // List contents with optional filtering
      let queryText = 'SELECT * FROM learning_contents';
      let params = [];
      let conditions = [];

      if (chapter) {
        conditions.push(`chapter_id = $${conditions.length + 1}`);
        params.push(parseInt(chapter));
      }

      if (section) {
        conditions.push(`section = $${conditions.length + 1}`);
        params.push(section);
      }

      if (conditions.length > 0) {
        queryText += ' WHERE ' + conditions.join(' AND ');
      }

      queryText += ' ORDER BY created_at DESC';
      
      const result = await query(queryText, params);
      return result.rows;
    }
  }

  if (segments[0] === 'quiz-results') {
    const { student_id } = event.queryStringParameters || {};
    
    let queryText = 'SELECT * FROM quiz_results';
    let params = [];

    if (student_id) {
      queryText += ' WHERE student_id = $1';
      params.push(student_id);
    }

    queryText += ' ORDER BY created_at DESC';
    
    const result = await query(queryText, params);
    return result.rows;
  }

  return { error: 'Endpoint not found' };
}

async function handlePost(event, segments) {
  if (!event.body) {
    throw { statusCode: 400, message: 'Request body is required' };
  }

  const body = JSON.parse(event.body);

  if (segments[0] === 'students') {
    const { id, name } = body;
    
    if (!id || !name) {
      throw { statusCode: 400, message: 'ID and name are required' };
    }

    return await withTransaction(async (client) => {
      const result = await client.query(
        'INSERT INTO students (id, name) VALUES ($1, $2) RETURNING *',
        [id, name]
      );
      return result.rows[0];
    });
  }

  if (segments[0] === 'contents') {
    const { 
      chapter_id, 
      section, 
      title, 
      description, 
      file_names, 
      file_types, 
      file_sizes, 
      file_contents, 
      file_datas, 
      file_count 
    } = body;

    if (!chapter_id || !section || !title) {
      throw { statusCode: 400, message: 'Chapter ID, section, and title are required' };
    }

    return await withTransaction(async (client) => {
      const result = await client.query(
        `INSERT INTO learning_contents 
         (chapter_id, section, title, description, file_names, file_types, file_sizes, file_contents, file_datas, file_count) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          chapter_id, 
          section, 
          title, 
          description || 'Tidak ada deskripsi',
          file_names || [],
          file_types || [],
          file_sizes || [],
          file_contents || [],
          file_datas || [],
          file_count || 0
        ]
      );
      return result.rows[0];
    });
  }

  if (segments[0] === 'quiz-results') {
    const { student_id, chapter_id, score, total_questions, answers } = body;

    if (!student_id || !chapter_id || score === undefined || !total_questions) {
      throw { statusCode: 400, message: 'Missing required fields' };
    }

    return await withTransaction(async (client) => {
      const result = await client.query(
        `INSERT INTO quiz_results (student_id, chapter_id, score, total_questions, answers) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [student_id, chapter_id, score, total_questions, answers || {}]
      );
      return result.rows[0];
    });
  }

  throw { statusCode: 404, message: 'Endpoint not found' };
}

async function handleDelete(event, segments) {
  if (segments[0] === 'contents' && segments[1]) {
    const result = await query('DELETE FROM learning_contents WHERE id = $1 RETURNING *', [segments[1]]);
    
    if (result.rows.length === 0) {
      throw { statusCode: 404, message: 'Content not found' };
    }

    return { message: 'Content deleted successfully', deleted: result.rows[0] };
  }

  throw { statusCode: 404, message: 'Endpoint not found' };
}

async function handlePut(event, segments) {
  // Implement if needed for future features
  throw { statusCode: 501, message: 'Not implemented' };
}
