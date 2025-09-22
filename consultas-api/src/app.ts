import express from "express";
import dotenv from "dotenv";
import routes from "./routes";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

dotenv.config();
const app = express();
app.use(express.json());

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

export default app;
