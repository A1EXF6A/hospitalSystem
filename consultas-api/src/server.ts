import { AppDataSource } from "./data-source";
import app from "./app";

AppDataSource.initialize()
  .then(() => {
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
      console.log(`Consultas API running on http://localhost:${port}`);
    });
  })
  .catch((err) => console.error("Error DB:", err));
