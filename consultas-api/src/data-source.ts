import "reflect-metadata";
import { DataSource } from "typeorm";
import { Consulta } from "./entities/Consulta";

export const AppDataSource = new DataSource({
  type: "mariadb", // o postgres si prefieres
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3307,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "consultas_db",
  synchronize: true, // ⚠️ en prod: false, usar migraciones
  logging: true,
  entities: [Consulta],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
});
