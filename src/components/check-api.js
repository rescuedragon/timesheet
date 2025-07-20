// Simple script to check if the API is working
import { apiService } from './apiService';

async function checkAPI() {
  try {
    console.log('Checking API...');
    
    // Test 1: Get projects
    console.log('\n1. Getting projects...');
    const projects = await apiService.getProjects();
    console.log(`Retrieved ${projects.length} projects`);
    
    if (projects.length > 0) {
      console.log('Sample project:', projects[0]);
      
      // Test 2: Get time logs
      console.log('\n2. Getting time logs...');
      const timeLogs = await apiService.getTimeLogs();
      console.log(`Retrieved ${timeLogs.length} time logs`);
      
      if (timeLogs.length > 0) {
        console.log('Sample time log:', timeLogs[0]);
      }
    }
    
    console.log('\n✅ API check passed!');
    return true;
  } catch (error) {
    console.error('\n❌ API check failed:', error);
    return false;
  }
}

// Run the check
checkAPI();