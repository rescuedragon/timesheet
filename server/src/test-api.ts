import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient();

async function testTimeLogCreation() {
  try {
    console.log('Testing time log creation...');
    
    // Create a test project if none exists
    let project = await prisma.project.findFirst();
    if (!project) {
      console.log('Creating test project...');
      project = await prisma.project.create({
        data: {
          name: 'Test Project',
        }
      });
    }
    
    // Create a test subproject if none exists
    let subproject = await prisma.subproject.findFirst({
      where: { projectId: project.id }
    });
    if (!subproject) {
      console.log('Creating test subproject...');
      subproject = await prisma.subproject.create({
        data: {
          name: 'Test Subproject',
          projectId: project.id
        }
      });
    }
    
    // Create a test time log
    const timeLog = await prisma.timeLog.create({
      data: {
        projectId: project.id,
        subprojectId: subproject.id,
        projectName: project.name,
        subprojectName: subproject.name,
        duration: 3600, // 1 hour in seconds
        description: 'Test time log',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00:00',
        endTime: '10:00:00'
      }
    });
    
    console.log('Successfully created time log:', timeLog);
    
    // Update project and subproject total times
    await prisma.project.update({
      where: { id: project.id },
      data: {
        totalTime: {
          increment: 3600
        }
      }
    });
    
    await prisma.subproject.update({
      where: { id: subproject.id },
      data: {
        totalTime: {
          increment: 3600
        }
      }
    });
    
    console.log('Updated project and subproject total times');
    
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testTimeLogCreation()
  .then(success => {
    if (success) {
      console.log('✅ API test passed!');
    } else {
      console.log('❌ API test failed!');
    }
    process.exit(success ? 0 : 1);
  });