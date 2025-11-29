import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Usuario } from "../entities/Usuario";
import { Medico } from "../entities/Medico";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";

const usuarioRepository = AppDataSource.getRepository(Usuario);
const medicoRepository = AppDataSource.getRepository(Medico);

// Configurar cliente de Google OAuth
const client = new OAuth2Client();

/**
 * @swagger
 * /usuarios/validate:
 *   post:
 *     summary: Valida las credenciales de un usuario
 *     tags: [Usuarios]
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
 *     responses:
 *       200:
 *         description: Usuario válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 role:
 *                   type: string
 *                   enum: [admin, medico, empleado]
 *                 centroId:
 *                   type: number
 *                   nullable: true
 *       401:
 *         description: Credenciales inválidas
 */
export const validateUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username y password son requeridos",
      });
    }

    // Buscar usuario por username
    const user = await usuarioRepository.findOne({
      where: { username },
      relations: ["centro"],
    });

    if (!user) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    // Verificar password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    // Responder con datos del usuario (sin password)
    let responseData: any = {
      id: user.id,
      role: user.role,
      centroId: user.centroId,
      username: user.username,
      correo: user.correo,
    };

    // Si es médico, incluir doctorId
    if (user.role === 'medico') {
      const medico = await medicoRepository.findOne({
        where: { usuarioId: user.id },
      });
      
      if (medico) {
        responseData.doctorId = medico.id;
      }
    }

    res.json(responseData);
  } catch (error) {
    console.error("Error validating user:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
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
 *               role:
 *                 type: string
 *                 enum: [admin, medico, empleado]
 *               centroId:
 *                 type: number
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, password, correo, role, centroId } = req.body;

    if (!username || !password || !correo || !role) {
      return res.status(400).json({
        message: "Username, password, correo y role son requeridos",
      });
    }

    // Verificar si el username ya existe
    const existingUser = await usuarioRepository.findOne({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "El username ya existe",
      });
    }

    // Verificar si el correo ya existe
    const existingEmail = await usuarioRepository.findOne({
      where: { correo },
    });

    if (existingEmail) {
      return res.status(400).json({
        message: "El correo ya existe",
      });
    }

    // Hashear password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const user = usuarioRepository.create({
      username,
      correo,
      password: hashedPassword,
      role,
      centroId: centroId || null,
    });

    const savedUser = await usuarioRepository.save(user);

    // Responder sin password
    res.status(201).json({
      id: savedUser.id,
      username: savedUser.username,
      correo: savedUser.correo,
      role: savedUser.role,
      centroId: savedUser.centroId,
      created_at: savedUser.created_at,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await usuarioRepository.find({
      relations: ["centro"],
      select: ["id", "username", "correo", "role", "centroId", "created_at"],
    });

    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
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
 *               role:
 *                 type: string
 *                 enum: [admin, medico, empleado]
 *               centroId:
 *                 type: number
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       404:
 *         description: Usuario no encontrado
 *       400:
 *         description: Datos inválidos
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, password, correo, role, centroId } = req.body;

    const user = await usuarioRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    // Verificar si el nuevo username ya existe (si se está cambiando)
    if (username && username !== user.username) {
      const existingUser = await usuarioRepository.findOne({
        where: { username },
      });

      if (existingUser) {
        return res.status(400).json({
          message: "El username ya existe",
        });
      }
    }

    // Verificar si el nuevo correo ya existe (si se está cambiando)
    if (correo && correo !== user.correo) {
      const existingEmail = await usuarioRepository.findOne({
        where: { correo },
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "El correo ya existe",
        });
      }
    }

    // Actualizar campos
    if (username) user.username = username;
    if (correo) user.correo = correo;
    if (role) user.role = role;
    if (centroId !== undefined) user.centroId = centroId;

    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      const saltRounds = 10;
      user.password = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await usuarioRepository.save(user);

    // Responder sin password
    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      correo: updatedUser.correo,
      role: updatedUser.role,
      centroId: updatedUser.centroId,
      created_at: updatedUser.created_at,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await usuarioRepository.findOne({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    await usuarioRepository.remove(user);

    res.json({
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

/**
 * @swagger
 * /usuarios/google-login:
 *   post:
 *     summary: Login con Google OAuth
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Google JWT token
 *     responses:
 *       200:
 *         description: Usuario válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 role:
 *                   type: string
 *                   enum: [admin, medico, empleado]
 *                 centroId:
 *                   type: number
 *                   nullable: true
 *       401:
 *         description: Usuario no registrado
 *       400:
 *         description: Token inválido
 */
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        message: "Token de Google es requerido",
      });
    }

    // Verificar y decodificar el token de Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      // En producción, deberías especificar tu CLIENT_ID aquí
      // audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({
        message: "Token de Google inválido",
      });
    }

    const googleUsername = payload.name; // Usar el nombre de Google como username
    const googleEmail = payload.email;

    if (!googleUsername) {
      return res.status(400).json({
        message: "No se pudo obtener el nombre del usuario de Google",
      });
    }

    // Buscar usuario por email (no por username)
    const user = await usuarioRepository.findOne({
      where: { correo: googleEmail },
      relations: ["centro"],
    });

    if (!user) {
      return res.status(401).json({
        message: `Usuario no registrado. El email '${googleEmail}' no existe en el sistema. Por favor, contacta al administrador para crear una cuenta.`,
        userInfo: {
          name: googleUsername,
          email: googleEmail,
        },
      });
    }

    // Responder con datos del usuario (sin password)
    let responseData: any = {
      id: user.id,
      role: user.role,
      centroId: user.centroId,
      username: user.username,
      correo: user.correo,
    };

    // Si es médico, incluir doctorId
    if (user.role === 'medico') {
      const medico = await medicoRepository.findOne({
        where: { usuarioId: user.id },
      });
      
      if (medico) {
        responseData.doctorId = medico.id;
      }
    }

    res.json(responseData);
  } catch (error) {
    console.error("Error en Google login:", error);
    res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};
