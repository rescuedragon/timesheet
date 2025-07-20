import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config({ path: 'server/.env' });

async function checkDatabase() {
  // Parse the DATABASE_URL
  const dbUrl = process.env.DATABASE_URL;
  console.log('Database URL:', dbUrl);
  
  if (!dbUrl) {
    console.error('DATABASE_URL is not defined');
    return false;
  }
  
  try {
    // Extract connection details from the URL
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!match) {
      console.error('Invalid DATABASE_URL format');
      return false;
    }
    
    const [, user, password, host, port, database] = match;
    
    console.log('Connection details:');
    console.log('- User:', user);
    console.log('- Password:', password ? '********' : 'none');
    console.log('- Host:', host);
    console.log('- Port:', port);
    console.log('- Database:', database);
    
    // Create a connection pool
    const pool = new Pool({
      user,
      password,
      host,
      port: parseInt(port),
      database,
    });
    
    // Check connection
    console.log('Attempting to connect to the database...');
    const client = await pool.connect();
    console.log('Connection successful!');
    
    // Check if tables exist
    console.log('\nChecking tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables found:', tablesResult.rows.length);
    tablesResult.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check if there are any projects
    console.log('\nChecking projects...');
    const projectsResult = await client.query('SELECT COUNT(*) FROM projects');
    console.log(`Projects count: ${projectsResult.rows[0].count}`);
    
    if (parseInt(projectsResult.rows[0].count) > 0) {
      const projectsData = await client.query('SELECT * FROM projects LIMIT 5');
      console.log('Sample projects:', projectsData.rows);
    }
    
    // Check if there are any time logs
    console.log('\nChecking time logs...');
    const timeLogsResult = await client.query('SELECT COUNT(*) FROM time_logs');
    console.log(`Time logs count: ${timeLogsResult.rows[0].count}`);
    
    if (parseInt(timeLogsResult.rows[0].count) > 0) {
      const timeLogsData = await client.query('SELECT * FROM time_logs LIMIT 5');
      console.log('Sample time logs:', timeLogsData.rows);
    }
    
    // Release the client
    client.release();
    
    // Close the pool
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('Database check failed:', error);
    return false;
  }
}

// Run the check
checkDatabase()
  .then(success => {
    console.log('\nDatabase check ' + (success ? 'passed' : 'failed'));
    process.exit(success ? 0 : 1);
  });