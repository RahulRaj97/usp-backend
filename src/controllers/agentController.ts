import { Request, Response } from 'express';
import * as agentService from '@/services/agentService';

export const createAgent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const agent = await agentService.createAgent(req.body);
    res.status(201).json({ message: 'Agent created successfully', agent });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating agent',
      error: (error as Error).message,
    });
  }
};

export const getAllAgents = async (
  _: Request,
  res: Response,
): Promise<void> => {
  try {
    const agents = await agentService.getAllAgents();
    res.status(200).json(agents);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching agents',
      error: (error as Error).message,
    });
  }
};

export const getAgentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const agent = await agentService.getAgentById(req.params.id);
    if (!agent) {
      res.status(404).json({ message: 'Agent not found' });
      return;
    }
    res.status(200).json(agent);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching agent',
      error: (error as Error).message,
    });
  }
};

export const updateAgent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const agent = await agentService.updateAgent(req.params.id, req.body);
    if (!agent) {
      res.status(404).json({ message: 'Agent not found' });
      return;
    }
    res.status(200).json({ message: 'Agent updated successfully', agent });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating agent',
      error: (error as Error).message,
    });
  }
};

export const deleteAgent = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const agent = await agentService.deleteAgent(req.params.id);
    if (!agent) {
      res.status(404).json({ message: 'Agent not found' });
      return;
    }
    res.status(200).json({ message: 'Agent deleted successfully', agent });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting agent',
      error: (error as Error).message,
    });
  }
};
