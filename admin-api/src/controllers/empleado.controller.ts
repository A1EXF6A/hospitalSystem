import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Empleado } from "../entities/Empleado";

export class EmpleadoController {
  static async create(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Empleado);
    const empleado = repo.create(req.body);
    await repo.save(empleado);
    res.status(201).json(empleado);
  }

  static async getAll(_req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Empleado);
    const empleados = await repo.find({ relations: ["centro"] });
    res.json(empleados);
  }

  static async getOne(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Empleado);
    const empleado = await repo.findOne({
      where: { id: Number(req.params.id) },
      relations: ["centro"],
    });
    if (!empleado) return res.status(404).json({ message: "No encontrado" });
    res.json(empleado);
  }

  static async update(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Empleado);
    const empleado = await repo.findOneBy({ id: Number(req.params.id) });
    if (!empleado) return res.status(404).json({ message: "No encontrado" });
    repo.merge(empleado, req.body);
    await repo.save(empleado);
    res.json(empleado);
  }

  static async delete(req: Request, res: Response) {
    const repo = AppDataSource.getRepository(Empleado);
    await repo.delete({ id: Number(req.params.id) });
    res.json({ message: "Empleado eliminado" });
  }
}
