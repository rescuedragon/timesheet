import dotenv from 'dotenv';
import { Pool } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: 'server/.env' });

async function createTestData() {
  try {
    console.log('Setting up database...');
    
    // Run Prisma migrations
    console.log('\nRunning Prisma migrations...');
    try {
      const { stdout, stderr } = await execAsync('npx prisma migrate dev --name init --schema=server/prisma/schema.prisma');
      console.log('Migration output:', stdout);
      if (stderr) console.error('Migration errors:', stderr);
    } catch (error) {
      console.error('Migration failed:', error);
      return false;
    }
    
    // Parse the DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('DATABASE_URL is not defined');
      return false;
    }
    
    // Extract connection details from the URL
    const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (!match) {
      console.error('Invalid DATABASE_URL format');
      return false;
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
    
    // Get a client from the pool
    const client = await pool.connect();
    
    try {
      // Create test projects
      console.log('\nCreating test projects...');
      
      // Check if projects table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'projects'
        );
      `);
      
      if (!tableCheck.rows[0].exists) {
        console.error('Projects table does not exist. Migration may have failed.');
        return false;
      }
      
      // Create projects
      const project1 = await client.query(`
        INSERT INTO projects (id, name, "totalTime", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Development', 0, NOW(), NOW())
        RETURNING *;
      `);
      
      const project2 = await client.query(`
        INSERT INTO projects (id, name, "totalTime", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Design', 0, NOW(), NOW())
        RETURNING *;
      `);
      
      console.log('Created projects:', project1.rows[0], project2.rows[0]);
      
      // Create subprojects
      console.log('\nCreating subprojects...');
      const subproject1 = await client.query(`
        INSERT INTO subprojects (id, name, "totalTime", "projectId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Frontend', 0, $1, NOW(), NOW())
        RETURNING *;
      `, [project1.rows[0].id]);
      
      const subproject2 = await client.query(`
        INSERT INTO subprojects (id, name, "totalTime", "projectId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'Backend', 0, $1, NOW(), NOW())
        RETURNING *;
      `, [project1.rows[0].id]);
      
      const subproject3 = await client.query(`
        INSERT INTO subprojects (id, name, "totalTime", "projectId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), 'UI', 0, $1, NOW(), NOW())
        RETURNING *;
      `, [project2.rows[0].id]);
      
      console.log('Created subprojects:', subproject1.rows[0], subproject2.rows[0], subproject3.rows[0]);
      
      // Create time logs
      console.log('\nCreating time logs...');
      const today = new Date().toISOString().split('T')[0];
      
      const timeLog1 = await client.query(`
        INSERT INTO time_logs (
          id, "projectId", "subprojectId", "projectName", "subprojectName", 
          duration, description, date, "startTime", "endTime", "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, 
          3600, 'Working on homepage', $5, '09:00:00', '10:00:00', NOW(), NOW()
        )
        RETURNING *;
      `, [
        project1.rows[0].id, 
        subproject1.rows[0].id, 
        project1.rows[0].name, 
        subproject1.rows[0].name, 
        today
      ]);
      
      const timeLog2 = await client.query(`
        INSERT INTO time_logs (
          id, "projectId", "subprojectId", "projectName", "subprojectName", 
          duration, description, date, "startTime", "endTime", "createdAt", "updatedAt"
        )
        VALUES (
          gen_random_uuid(), $1, $2, $3, $4, 
          1800, 'API development', $5, '10:30:00', '11:00:00', NOW(), NOW()
        )
        RETURNING *;
      `, [
        project1.rows[0].id, 
        subproject2.rows[0].id, 
        project1.rows[0].name, 
        subproject2.rows[0].name, 
        today
      ]);
      
      console.log('Created time logs:', timeLog1.rows[0], timeLog2.rows[0]);
      
      // Update project and subproject total times
      console.log('\nUpdating project and subproject total times...');
      await client.query(`
        UPDATE projects 
        SET "totalTime" = "totalTime" + $1 
        WHERE id = $2;
      `, [timeLog1.rows[0].duration + timeLog2.rows[0].duration, project1.rows[0].id]);
      
      await client.query(`
        UPDATE subprojects 
        SET "totalTime" = "totalTime" + $1 
        WHERE id = $2;
      `, [timeLog1.rows[0].duration, subproject1.rows[0].id]);
      
      await client.query(`
        UPDATE subprojects 
        SET "totalTime" = "totalTime" + $1 
        WHERE id = $2;
      `, [timeLog2.rows[0].duration, subproject2.rows[0].id]);
      
      console.log('Test data created successfully!');
      return true;
    } finally {
      // Release the client back to the pool
      client.release();
      await pool.end();
    }
  } catch (error) {
    console.error('Failed to create test data:', error);
    return false;
  }
}

// Run the function
createTestData()
  .then(success => {
    console.log('\nTest data creation ' + (success ? 'succeeded' : 'failed'));
    process.exit(success ? 0 : 1);
  });