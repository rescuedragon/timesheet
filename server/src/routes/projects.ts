import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
});

const createSubprojectSchema = z.object({
  name: z.string().min(1, 'Subproject name is required'),
  projectId: z.string().min(1, 'Project ID is required'),
});

// GET /api/projects - Get all projects with subprojects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        subprojects: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Get single project with subprojects
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        subprojects: {
          orderBy: { name: 'asc' }
        }
      }
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - Create new project
router.post('/', async (req, res) => {
  try {
    const { name } = createProjectSchema.parse(req.body);
    
    const project = await prisma.project.create({
      data: { name },
      include: {
        subprojects: true
      }
    });
    
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const { name } = createProjectSchema.parse(req.body);
    
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name },
      include: {
        subprojects: true
      }
    });
    
    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', async (req, res) => {
  try {
    await prisma.project.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// POST /api/projects/:id/subprojects - Create subproject
router.post('/:id/subprojects', async (req, res) => {
  try {
    const { name } = z.object({ name: z.string().min(1) }).parse(req.body);
    const projectId = req.params.id;
    
    const subproject = await prisma.subproject.create({
      data: {
        name,
        projectId
      }
    });
    
    res.status(201).json(subproject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating subproject:', error);
    res.status(500).json({ error: 'Failed to create subproject' });
  }
});

// PUT /api/projects/subprojects/:id - Update subproject
router.put('/subprojects/:id', async (req, res) => {
  try {
    const { name } = z.object({ name: z.string().min(1) }).parse(req.body);
    
    const subproject = await prisma.subproject.update({
      where: { id: req.params.id },
      data: { name }
    });
    
    res.json(subproject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating subproject:', error);
    res.status(500).json({ error: 'Failed to update subproject' });
  }
});

// DELETE /api/projects/subprojects/:id - Delete subproject
router.delete('/subprojects/:id', async (req, res) => {
  try {
    await prisma.subproject.delete({
      where: { id: req.params.id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting subproject:', error);
    res.status(500).json({ error: 'Failed to delete subproject' });
  }
});

export default router;