import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schema
const createHolidaySchema = z.object({
  name: z.string().min(1, 'Holiday name is required'),
  date: z.string().min(1, 'Date is required'),
});

const updateHolidaySchema = createHolidaySchema.partial();

// GET /api/holidays - Get all holidays
router.get('/', async (req, res) => {
  try {
    const { year } = req.query;
    
    let whereClause: any = {};
    if (year) {
      whereClause.date = {
        startsWith: year as string
      };
    }
    
    const holidays = await prisma.holiday.findMany({
      where: whereClause,
      orderBy: { date: 'asc' }
    });
    
    res.json(holidays);
  } catch (error) {
    console.error('Error fetching holidays:', error);
    res.status(500).json({ error: 'Failed to fetch holidays' });
  }
});

// GET /api/holidays/:id - Get single holiday
router.get('/:id', async (req, res) => {
  try {
    const holiday = await prisma.holiday.findUnique({
      where: { id: req.params.id }
    });
    
    if (!holiday) {
      return res.status(404).json({ error: 'Holiday not found' });
    }
    
    res.json(holiday);
  } catch (error) {
    console.error('Error fetching holiday:', error);
    res.status(500).json({ error: 'Failed to fetch holiday' });
  }
});

// POST /api/holidays - Create new holiday
router.post('/', async (req, res) => {
  try {
    const data = createHolidaySchema.parse(req.body);
    
    const holiday = await prisma.holiday.create({
      data
    });
    
    res.status(201).json(holiday);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating holiday:', error);
    res.status(500).json({ error: 'Failed to create holiday' });
  }
});

// PUT /api/holidays/:id - Update holiday
router.put('/:id', async (req, res) => {
  try {
    const data = updateHolidaySchema.parse(req.body);
    
    const holiday = await prisma.holiday.update({
      where: { id: req.params.id },
      data
    });
    
    res.json(holiday);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating holiday:', error);
    res.status(500).json({ error: 'Failed to update holiday' });
  }
});

// DELETE /api/holidays/:id - Delete holiday
router.delete('/:id', async (req, res) => {
  try {
    await prisma.holiday.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting holiday:', error);
    res.status(500).json({ error: 'Failed to delete holiday' });
  }
});

export default router;