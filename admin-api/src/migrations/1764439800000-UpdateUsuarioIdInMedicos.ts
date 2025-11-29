import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsuarioIdInMedicos1764439800000 implements MigrationInterface {
    name = 'UpdateUsuarioIdInMedicos1764439800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Actualizar las relaciones usuario-médico basándose en los datos de semillas
        await queryRunner.query(`
            UPDATE medicos SET "usuarioId" = 2 WHERE nombre = 'Dr. Carlos Rodriguez';
        `);
        
        await queryRunner.query(`
            UPDATE medicos SET "usuarioId" = 3 WHERE nombre = 'Dra. Ana Martinez';
        `);
        
        await queryRunner.query(`
            UPDATE medicos SET "usuarioId" = 4 WHERE nombre = 'Dr. Luis Lopez';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir los cambios
        await queryRunner.query(`
            UPDATE medicos SET "usuarioId" = NULL WHERE "usuarioId" IN (2, 3, 4);
        `);
    }
}