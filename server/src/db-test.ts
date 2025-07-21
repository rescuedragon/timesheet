import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { Pool } from 'pg';

// Load environment variables
dotenv.config({ path: 'server/.env' });

async function testConnection() {
  try {
    // Parse the DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    console.log('Attempting to connect to the database...');
    console.log(`Connection string: ${dbUrl}`);
    
    // Extract connection details from the URL
    const match = dbUrl?.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    const [, user, password, host, port, database] = match;
    
    // Create a connection pool
    const pool = new Pool({
      user,
      password,
      host,
      port: parseInt(port),
      database,
    });
    
    // Execute a simple query
    const result = await pool.query('SELECT 1 as result');
    console.log('Connection successful!', result.rows);
    
    // Close the pool
    await pool.end();
    
    return true;
  } catch (error) {
    console.error('Database connection failed:');
    console.error(error);
    return false;
  }
}

// Run the test
testConnection()
  .then(success => {
    if (success) {
      console.log('✅ Database connection test passed!');
    } else {
      console.log('❌ Database connection test failed!');
    }
    process.exit(success ? 0 : 1);
  });