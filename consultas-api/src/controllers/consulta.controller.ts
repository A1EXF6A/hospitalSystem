import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Consulta } from "../entities/Consulta";

export class ConsultaController {
  static async create(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Consulta);
      
      // If user is medico, enforce their doctorId in the creation
      if (req.user?.role === 'medico') {
        if (!req.user.doctorId) {
          return res.status(403).json({ message: "Usuario médico debe tener doctorId asociado" });
        }
        req.body.doctorId = req.user.doctorId;
        
        // Also enforce centroId if provided by middleware
        if (req.query.centroId) {
          req.body.centroId = Number(req.query.centroId);
        }
      }
      
      const consulta = repo.create(req.body);
      await repo.save(consulta);
      res.status(201).json(consulta);
    } catch (error) {
      console.error('Error creating consulta:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Consulta);
      
      // Build where clause
      let where: any = {};
      
      // For medical users, filter by their specific doctor ID
      if (req.user?.role === 'medico') {
        if (!req.user.doctorId) {
          return res.status(403).json({ message: "Usuario médico debe tener doctorId asociado" });
        }
        
        // Filter by the specific doctor ID from JWT
        where.doctorId = req.user.doctorId;
      } else if (req.query.centroId) {
        // For admin users, use centroId filter if provided
        where.centroId = Number(req.query.centroId);
      }
      
      const consultas = await repo.find({ where });
      res.json(consultas);
    } catch (error) {
      console.error('Error getting consultas:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async getOne(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Consulta);
      const consulta = await repo.findOneBy({ id: Number(req.params.id) });
      if (!consulta) return res.status(404).json({ message: "No encontrada" });
      res.json(consulta);
    } catch (error) {
      console.error('Error getting consulta:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Consulta);
      const consulta = await repo.findOneBy({ id: Number(req.params.id) });
      if (!consulta) return res.status(404).json({ message: "No encontrada" });
      repo.merge(consulta, req.body);
      await repo.save(consulta);
      res.json(consulta);
    } catch (error) {
      console.error('Error updating consulta:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Consulta);
      await repo.delete({ id: Number(req.params.id) });
      res.json({ message: "Consulta eliminada" });
    } catch (error) {
      console.error('Error deleting consulta:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }

  static async reportByDoctor(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Consulta);
      const doctorId = Number(req.params.doctorId);
      const { from, to } = req.query;

      let where: any = { doctorId };
      
      // If centroId is set by middleware (for medicos), filter by it
      if (req.query.centroId) {
        where.centroId = Number(req.query.centroId);
      }
      
      if (from || to) {
        where.fecha = {};
        if (from) where.fecha.$gte = new Date(String(from));
        if (to) where.fecha.$lte = new Date(String(to));
      }

      const consultas = await repo.find({ where });
      res.json({
        doctorId,
        total: consultas.length,
        consultas,
      });
    } catch (error) {
      console.error('Error getting report by doctor:', error);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
}
