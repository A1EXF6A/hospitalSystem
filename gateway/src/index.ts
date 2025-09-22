import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Gateway healthcheck
app.get("/health", (_req, res) => {
  res.json({ status: "ok", gateway: true });
});

// Rutas hacia admin-api
app.use(
  "/admin",
  createProxyMiddleware({
    target: process.env.ADMIN_API_URL || "http://admin-api:3000",
    changeOrigin: true,
    pathRewrite: { "^/admin": "" },
  })
);

// Rutas hacia consultas-api
app.use(
  "/consultas",
  createProxyMiddleware({
    target: process.env.CONSULTAS_API_URL || "http://consultas-api:4000",
    changeOrigin: true,
    pathRewrite: { "^/consultas": "" },
  })
);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Gateway running on http://localhost:${port}`);
});
