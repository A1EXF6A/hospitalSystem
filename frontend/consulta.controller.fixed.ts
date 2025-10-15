import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Consulta } from "../entities/Consulta";

export class ConsultaController {
  static async create(req: Request, res: Response) {
    try {
      const repo = AppDataSource.getRepository(Consulta);
      
      // If centroId is set by middleware (for medicos), enforce it in the creation
      if (req.query.centroId && req.user?.role === 'medico') {
        req.body.centroId = Number(req.query.centroId);
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
      
      // Build where clause - if centroId is set by middleware (for medicos), use it
      let where: any = {};
      if (req.query.centroId) {
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
      
      // Validate doctorId parameter
      const doctorIdParam = req.params.doctorId;
      if (!doctorIdParam) {
        return res.status(400).json({ message: "Doctor ID es requerido" });
      }
      
      const doctorId = Number(doctorIdParam);
      if (isNaN(doctorId) || doctorId <= 0) {
        return res.status(400).json({ message: "Doctor ID debe ser un número válido" });
      }

      const { from, to } = req.query;

      let where: any = { doctorId };
      
      // If centroId is set by middleware (for medicos), filter by it
      if (req.query.centroId) {
        const centroId = Number(req.query.centroId);
        if (!isNaN(centroId)) {
          where.centroId = centroId;
        }
      }
      
      if (from || to) {
        where.fecha = {};
        if (from) {
          const fromDate = new Date(String(from));
          if (!isNaN(fromDate.getTime())) {
            where.fecha.$gte = fromDate;
          }
        }
        if (to) {
          const toDate = new Date(String(to));
          if (!isNaN(toDate.getTime())) {
            where.fecha.$lte = toDate;
          }
        }
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