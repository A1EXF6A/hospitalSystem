import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedTestData1764436000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert consultas de prueba
        await queryRunner.query(`
            INSERT INTO consultas (paciente, "doctorId", "centroId", fecha, notas, estado, created_at) VALUES
            ('Juan Pérez', 1, 1, '2024-12-01 09:00:00', 'Consulta de rutina cardiológica. Presión arterial normal.', 'completada', NOW()),
            ('María González', 3, 1, '2024-12-01 10:30:00', 'Control pediátrico. Vacunas al día.', 'completada', NOW()),
            ('Carlos Rodríguez', 1, 1, '2024-12-02 14:00:00', 'Seguimiento post-infarto. Evolución favorable.', 'completada', NOW()),
            ('Ana López', 4, 3, '2024-12-02 11:00:00', 'Control ginecológico anual.', 'completada', NOW()),
            ('Pedro Martínez', 5, 4, '2024-12-03 08:30:00', 'Fractura de muñeca. Requiere seguimiento.', 'en_proceso', NOW()),
            ('Sofía Castro', 2, 2, '2024-12-03 16:00:00', 'Evaluación neurológica por migrañas frecuentes.', 'programada', NOW()),
            ('Diego Herrera', 6, 2, '2024-12-04 09:15:00', 'Consulta de medicina general.', 'programada', NOW()),
            ('Carmen Vargas', 7, 3, '2024-12-04 13:45:00', 'Evaluación psiquiátrica inicial.', 'programada', NOW()),
            ('Roberto Silva', 8, 1, '2024-12-05 10:00:00', 'Dermatitis atópica. Control dermatológico.', 'programada', NOW()),
            ('Lucia Morales', 3, 1, '2024-12-05 15:30:00', 'Control pediátrico de crecimiento y desarrollo.', 'programada', NOW()),
            ('Fernando Torres', 1, 1, '2024-12-06 08:00:00', 'Consulta cardiológica preventiva.', 'programada', NOW()),
            ('Isabel Ruiz', 4, 3, '2024-12-06 14:30:00', 'Control prenatal rutinario.', 'programada', NOW()),
            ('Andrés Mejía', 5, 4, '2024-12-09 11:00:00', 'Rehabilitación post-cirugía de rodilla.', 'programada', NOW()),
            ('Monica Jiménez', 6, 2, '2024-12-09 16:15:00', 'Consulta de medicina general por síntomas gripales.', 'programada', NOW()),
            ('Rafael Ospina', 2, 2, '2024-12-10 09:30:00', 'Evaluación neurológica por mareos recurrentes.', 'programada', NOW())
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM consultas`);
    }
}