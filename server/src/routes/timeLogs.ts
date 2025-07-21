import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const createTimeLogSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  subprojectId: z.string().min(1, 'Subproject ID is required'),
  projectName: z.string().min(1, 'Project name is required'),
  subprojectName: z.string().min(1, 'Subproject name is required'),
  duration: z.number().min(0, 'Duration must be positive'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

const updateTimeLogSchema = createTimeLogSchema.partial();

// GET /api/time-logs - Get all time logs with optional date filtering
router.get('/', async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    
    console.log('[DEBUG] GET /api/time-logs with query params:', { date, startDate, endDate });
    
    let whereClause: any = {};
    
    if (date) {
      whereClause.date = date as string;
      console.log(`[DEBUG] Filtering by date: ${date}`);
    } else if (startDate && endDate) {
      whereClause.date = {
        gte: startDate as string,
        lte: endDate as string
      };
      console.log(`[DEBUG] Filtering by date range: ${startDate} to ${endDate}`);
    }
    
    const timeLogs = await prisma.timeLog.findMany({
      where: whereClause,
      include: {
        project: true,
        subproject: true
      },
      orderBy: [
        { date: 'desc' },
        { startTime: 'desc' }
      ]
    });
    
    console.log(`[DEBUG] Found ${timeLogs.length} time logs`);
    res.json(timeLogs);
  } catch (error) {
    console.error('[ERROR] Error fetching time logs:', error);
    res.status(500).json({ error: 'Failed to fetch time logs' });
  }
});

// GET /api/time-logs/:id - Get single time log
router.get('/:id', async (req, res) => {
  try {
    console.log(`[DEBUG] GET /api/time-logs/${req.params.id}`);
    
    const timeLog = await prisma.timeLog.findUnique({
      where: { id: req.params.id },
      include: {
        project: true,
        subproject: true
      }
    });
    
    if (!timeLog) {
      console.log(`[DEBUG] Time log with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Time log not found' });
    }
    
    console.log(`[DEBUG] Found time log with ID ${req.params.id}`);
    res.json(timeLog);
  } catch (error) {
    console.error('[ERROR] Error fetching time log:', error);
    res.status(500).json({ error: 'Failed to fetch time log' });
  }
});

// POST /api/time-logs - Create new time log
router.post('/', async (req, res) => {
  try {
    console.log('[DEBUG] Creating new time log with data:', JSON.stringify(req.body, null, 2));
    
    // Validate the request data
    try {
      const data = createTimeLogSchema.parse(req.body);
      console.log('[DEBUG] Validation passed for time log data');
      
      // Check if project and subproject exist
      const project = await prisma.project.findUnique({
        where: { id: data.projectId }
      });
      
      if (!project) {
        console.error(`[ERROR] Project with ID ${data.projectId} not found`);
        return res.status(404).json({ error: `Project with ID ${data.projectId} not found` });
      }
      
      const subproject = await prisma.subproject.findUnique({
        where: { id: data.subprojectId }
      });
      
      if (!subproject) {
        console.error(`[ERROR] Subproject with ID ${data.subprojectId} not found`);
        return res.status(404).json({ error: `Subproject with ID ${data.subprojectId} not found` });
      }
      
      console.log('[DEBUG] Project and subproject found, proceeding with time log creation');
      
      // Create time log and update project/subproject totals
      const timeLog = await prisma.$transaction(async (tx) => {
        // Create the time log
        console.log('[DEBUG] Creating time log in transaction');
        const newTimeLog = await tx.timeLog.create({
          data,
          include: {
            project: true,
            subproject: true
          }
        });
        console.log('[DEBUG] Time log created:', newTimeLog.id);
        
        // Update project total time
        console.log('[DEBUG] Updating project total time');
        await tx.project.update({
          where: { id: data.projectId },
          data: {
            totalTime: {
              increment: data.duration
            }
          }
        });
        
        // Update subproject total time
        console.log('[DEBUG] Updating subproject total time');
        await tx.subproject.update({
          where: { id: data.subprojectId },
          data: {
            totalTime: {
              increment: data.duration
            }
          }
        });
        
        return newTimeLog;
      });
      
      console.log('[DEBUG] Transaction completed successfully, returning time log:', timeLog);
      res.status(201).json(timeLog);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        console.error('[ERROR] Validation error:', validationError.errors);
        return res.status(400).json({ error: validationError.errors });
      }
      throw validationError;
    }
  } catch (error) {
    console.error('[ERROR] Error creating time log:', error);
    if (error instanceof Error) {
      console.error('[ERROR] Error message:', error.message);
      console.error('[ERROR] Error stack:', error.stack);
    }
    res.status(500).json({ 
      error: 'Failed to create time log',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error && 'code' in error ? (error as any).code : undefined
    });
  }
});

// PUT /api/time-logs/:id - Update time log
router.put('/:id', async (req, res) => {
  try {
    console.log(`[DEBUG] PUT /api/time-logs/${req.params.id} with data:`, JSON.stringify(req.body, null, 2));
    
    const data = updateTimeLogSchema.parse(req.body);
    
    // Get the existing time log to calculate duration difference
    const existingTimeLog = await prisma.timeLog.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingTimeLog) {
      console.log(`[DEBUG] Time log with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Time log not found' });
    }
    
    const timeLog = await prisma.$transaction(async (tx) => {
      // Update the time log
      console.log('[DEBUG] Updating time log in transaction');
      const updatedTimeLog = await tx.timeLog.update({
        where: { id: req.params.id },
        data,
        include: {
          project: true,
          subproject: true
        }
      });
      
      // If duration changed, update project/subproject totals
      if (data.duration !== undefined) {
        const durationDiff = data.duration - existingTimeLog.duration;
        
        console.log(`[DEBUG] Updating project total time by ${durationDiff}`);
        await tx.project.update({
          where: { id: existingTimeLog.projectId },
          data: {
            totalTime: {
              increment: durationDiff
            }
          }
        });
        
        console.log(`[DEBUG] Updating subproject total time by ${durationDiff}`);
        await tx.subproject.update({
          where: { id: existingTimeLog.subprojectId },
          data: {
            totalTime: {
              increment: durationDiff
            }
          }
        });
      }
      
      return updatedTimeLog;
    });
    
    console.log('[DEBUG] Time log updated successfully:', timeLog);
    res.json(timeLog);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('[ERROR] Validation error:', error.errors);
      return res.status(400).json({ error: error.errors });
    }
    console.error('[ERROR] Error updating time log:', error);
    res.status(500).json({ error: 'Failed to update time log' });
  }
});

// DELETE /api/time-logs/:id - Delete time log
router.delete('/:id', async (req, res) => {
  try {
    console.log(`[DEBUG] DELETE /api/time-logs/${req.params.id}`);
    
    const timeLog = await prisma.timeLog.findUnique({
      where: { id: req.params.id }
    });
    
    if (!timeLog) {
      console.log(`[DEBUG] Time log with ID ${req.params.id} not found`);
      return res.status(404).json({ error: 'Time log not found' });
    }
    
    await prisma.$transaction(async (tx) => {
      // Delete the time log
      console.log('[DEBUG] Deleting time log in transaction');
      await tx.timeLog.delete({
        where: { id: req.params.id }
      });
      
      // Update project total time
      console.log(`[DEBUG] Updating project total time by -${timeLog.duration}`);
      await tx.project.update({
        where: { id: timeLog.projectId },
        data: {
          totalTime: {
            decrement: timeLog.duration
          }
        }
      });
      
      // Update subproject total time
      console.log(`[DEBUG] Updating subproject total time by -${timeLog.duration}`);
      await tx.subproject.update({
        where: { id: timeLog.subprojectId },
        data: {
          totalTime: {
            decrement: timeLog.duration
          }
        }
      });
    });
    
    console.log('[DEBUG] Time log deleted successfully');
    res.status(204).send();
  } catch (error) {
    console.error('[ERROR] Error deleting time log:', error);
    res.status(500).json({ error: 'Failed to delete time log' });
  }
});

// GET /api/time-logs/stats/summary - Get time tracking statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    console.log('[DEBUG] GET /api/time-logs/stats/summary with query params:', { startDate, endDate });
    
    let whereClause: any = {};
    if (startDate && endDate) {
      whereClause.date = {
        gte: startDate as string,
        lte: endDate as string
      };
      console.log(`[DEBUG] Filtering by date range: ${startDate} to ${endDate}`);
    }
    
    const [totalTime, totalLogs, projectStats] = await Promise.all([
      // Total time logged
      prisma.timeLog.aggregate({
        where: whereClause,
        _sum: { duration: true }
      }),
      
      // Total number of logs
      prisma.timeLog.count({
        where: whereClause
      }),
      
      // Time by project
      prisma.timeLog.groupBy({
        by: ['projectId', 'projectName'],
        where: whereClause,
        _sum: { duration: true },
        orderBy: { _sum: { duration: 'desc' } }
      })
    ]);
    
    const result = {
      totalTime: totalTime._sum.duration || 0,
      totalLogs,
      projectStats
    };
    
    console.log('[DEBUG] Stats summary:', result);
    res.json(result);
  } catch (error) {
    console.error('[ERROR] Error fetching time log stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;