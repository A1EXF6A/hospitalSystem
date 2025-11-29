import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserSchema1764437374311 implements MigrationInterface {
    name = 'UpdateUserSchema1764437374311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First remove correo from medicos table
        await queryRunner.query(`ALTER TABLE "medicos" DROP COLUMN "correo"`);
        
        // Add correo column as nullable first
        await queryRunner.query(`ALTER TABLE "usuarios" ADD "correo" character varying(255)`);
        
        // Update existing users with default email addresses
        await queryRunner.query(`UPDATE "usuarios" SET "correo" = username || '@hospital.com' WHERE "correo" IS NULL`);
        
        // Now make the column NOT NULL
        await queryRunner.query(`ALTER TABLE "usuarios" ALTER COLUMN "correo" SET NOT NULL`);
        
        // Add unique constraint
        await queryRunner.query(`ALTER TABLE "usuarios" ADD CONSTRAINT "UQ_63665765c1a778a770c9bd585d3" UNIQUE ("correo")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove unique constraint
        await queryRunner.query(`ALTER TABLE "usuarios" DROP CONSTRAINT "UQ_63665765c1a778a770c9bd585d3"`);
        
        // Drop correo column from usuarios
        await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN "correo"`);
        
        // Add correo column back to medicos
        await queryRunner.query(`ALTER TABLE "medicos" ADD "correo" character varying(150) NOT NULL`);
    }

}
