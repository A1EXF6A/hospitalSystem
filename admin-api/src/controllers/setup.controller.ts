import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Usuario } from "../entities/Usuario";
import bcrypt from "bcrypt";

const usuarioRepository = AppDataSource.getRepository(Usuario);

/**
 * @swagger
 * /setup/admin:
 *   post:
 *     summary: Crear el primer usuario administrador (solo para setup inicial)
 *     tags: [Setup]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               centroId:
 *                 type: number
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Usuario administrador creado exitosamente
 *       400:
 *         description: Ya existe un administrador o datos inválidos
 */
export const createInitialAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password, centroId } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: "Username y password son requeridos" 
      });
    }

    // Verificar si ya existe algún usuario admin
    const existingAdmin = await usuarioRepository.findOne({
      where: { role: "admin" }
    });

    if (existingAdmin) {
      return res.status(400).json({ 
        message: "Ya existe un usuario administrador en el sistema" 
      });
    }

    // Verificar si el username ya existe
    const existingUser = await usuarioRepository.findOne({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: "El username ya existe" 
      });
    }

    // Hashear password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario admin
    const user = usuarioRepository.create({
      username,
      password: hashedPassword,
      role: "admin",
      centroId: centroId || null
    });

    const savedUser = await usuarioRepository.save(user);

    // Responder sin password
    res.status(201).json({
      id: savedUser.id,
      username: savedUser.username,
      role: savedUser.role,
      centroId: savedUser.centroId,
      created_at: savedUser.created_at,
      message: "Usuario administrador creado exitosamente"
    });

  } catch (error) {
    console.error("Error creating initial admin:", error);
    res.status(500).json({ 
      message: "Error interno del servidor" 
    });
  }
};