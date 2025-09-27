import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: string;
        centroId?: number;
        username: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-key-that-must-be-at-least-32-characters-long-for-security';

  jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }

    req.user = {
      id: decoded.nameid || decoded.id,
      role: decoded.role,
      centroId: decoded.centroId ? parseInt(decoded.centroId) : undefined,
      username: decoded.unique_name || decoded.username
    };

    next();
  });
};

export const requireMedicoOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  if (req.user.role !== 'medico' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Solo médicos y administradores pueden acceder a este recurso' });
  }

  next();
};

export const filterByCentro = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  // Si es admin, puede acceder a todo
  if (req.user.role === 'admin') {
    next();
    return;
  }

  // Si es médico, debe tener centroId y se filtrará por ese centro
  if (req.user.role === 'medico') {
    if (!req.user.centroId) {
      return res.status(403).json({ message: 'Usuario médico debe estar asociado a un centro' });
    }
    
    // Agregar filtro por centroId en los query parameters
    req.query.centroId = req.user.centroId.toString();
    next();
    return;
  }

  // Otros roles no tienen acceso
  return res.status(403).json({ message: 'Acceso denegado' });
};