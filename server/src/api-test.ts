import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { Pool } from 'pg';

// Load environment variables
dotenv.config({ path: 'server/.env' });

// Create a database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// API base URL
const API_BASE_URL = `http://localhost:${process.env.PORT || 3002}/api`;

async function testAPI() {
  try {
    console.log('Testing API connection...');
    console.log(`API URL: ${API_BASE_URL}`);
    
    // Test 1: Create a test project
    console.log('\n1. Creating test project...');
    const projectResponse = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Project ' + new Date().toISOString(),
      }),
    });
    
    if (!projectResponse.ok) {
      throw new Error(`Failed to create project: ${projectResponse.status} ${projectResponse.statusText}`);
    }
    
    const project = await projectResponse.json();
    console.log('Project created successfully:', project);
    
    // Test 2: Create a subproject
    console.log('\n2. Creating test subproject...');
    const subprojectResponse = await fetch(`${API_BASE_URL}/projects/${project.id}/subprojects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Subproject ' + new Date().toISOString(),
      }),
    });
    
    if (!subprojectResponse.ok) {
      throw new Error(`Failed to create subproject: ${subprojectResponse.status} ${subprojectResponse.statusText}`);
    }
    
    const subproject = await subprojectResponse.json();
    console.log('Subproject created successfully:', subproject);
    
    // Test 3: Create a time log
    console.log('\n3. Creating test time log...');
    const timeLogResponse = await fetch(`${API_BASE_URL}/time-logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: project.id,
        subprojectId: subproject.id,
        projectName: project.name,
        subprojectName: subproject.name,
        duration: 3600, // 1 hour in seconds
        description: 'Test time log',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00:00',
        endTime: '10:00:00',
      }),
    });
    
    if (!timeLogResponse.ok) {
      throw new Error(`Failed to create time log: ${timeLogResponse.status} ${timeLogResponse.statusText}`);
    }
    
    const timeLog = await timeLogResponse.json();
    console.log('Time log created successfully:', timeLog);
    
    // Test 4: Get time logs
    console.log('\n4. Getting time logs...');
    const getTimeLogsResponse = await fetch(`${API_BASE_URL}/time-logs`);
    
    if (!getTimeLogsResponse.ok) {
      throw new Error(`Failed to get time logs: ${getTimeLogsResponse.status} ${getTimeLogsResponse.statusText}`);
    }
    
    const timeLogs = await getTimeLogsResponse.json();
    console.log(`Retrieved ${timeLogs.length} time logs`);
    
    // Test 5: Check if our created time log exists
    const createdTimeLog = timeLogs.find((log: any) => log.id === timeLog.id);
    if (createdTimeLog) {
      console.log('Successfully found our created time log in the database');
    } else {
      throw new Error('Could not find our created time log in the database');
    }
    
    console.log('\n✅ All API tests passed!');
    return true;
  } catch (error) {
    console.error('\n❌ API test failed:', error);
    return false;
  } finally {
    await pool.end();
  }
}

// Run the test
testAPI()
  .then(success => {
    process.exit(success ? 0 : 1);
  });