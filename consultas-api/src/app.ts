import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();
const app = express();

/* Configuración de CORS global
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});*/

// Configuración de CORS para permitir solicitudes desde el frontend de react
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // o "*" si no quieres restringir
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Responder a preflight
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});


// Configuración de middleware con timeouts más largos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Timeout middleware
app.use((req, res, next) => {
  req.setTimeout(60000); // 60 segundos
  res.setTimeout(60000);
  next();
});

// Swagger config
const specs = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: { title: "Consultas API", version: "1.0.0" },
  },
  apis: ["./src/routes/*.ts"],
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs));
app.use("/", routes);

// Middleware global de manejo de errores
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error in consultas-api:', error);
  if (!res.headersSent) {
    res.status(500).json({ 
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default app;
