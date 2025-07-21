import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    console.log(`Connection string: ${process.env.DATABASE_URL}`);
    
    // Try to connect to the database
    await prisma.$connect();
    console.log('Database connection successful!');
    
    // Check if tables exist
    console.log('Checking if tables exist...');
    
    try {
      // Try to count projects
      const projectCount = await prisma.project.count();
      console.log(`Projects table exists with ${projectCount} records`);
      
      // Try to count subprojects
      const subprojectCount = await prisma.subproject.count();
      console.log(`Subprojects table exists with ${subprojectCount} records`);
      
      // Try to count time logs
      const timeLogCount = await prisma.timeLog.count();
      console.log(`TimeLogs table exists with ${timeLogCount} records`);
      
      // Try to count holidays
      const holidayCount = await prisma.holiday.count();
      console.log(`Holidays table exists with ${holidayCount} records`);
      
      return true;
    } catch (error) {
      console.error('Error checking tables:', error);
      console.log('Tables may not exist. Try running migrations:');
      console.log('npx prisma migrate dev --schema=server/prisma/schema.prisma');
      return false;
    }
  } catch (error) {
    console.error('Database connection failed:');
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkDatabase()
  .then(success => {
    if (success) {
      console.log('✅ Database check passed!');
    } else {
      console.log('❌ Database check failed!');
    }
    process.exit(success ? 0 : 1);
  });