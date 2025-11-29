import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class SeedTestData1764436000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert centros médicos
        await queryRunner.query(`
            INSERT INTO centros (nombre, direccion, ciudad, telefono, created_at) VALUES
            ('Hospital Central', 'Calle 123 #45-67', 'Bogotá', '601-234-5678', NOW()),
            ('Clínica Norte', 'Carrera 45 #123-89', 'Medellín', '604-987-6543', NOW()),
            ('Centro Médico Sur', 'Avenida 68 #23-45', 'Cali', '602-876-5432', NOW()),
            ('Hospital Universitario', 'Calle 67 #89-12', 'Barranquilla', '605-345-6789', NOW())
        `);

        // Insert especialidades
        await queryRunner.query(`
            INSERT INTO especialidades (nombre, descripcion) VALUES
            ('Cardiología', 'Especialidad médica que se ocupa del corazón y sistema circulatorio'),
            ('Neurología', 'Especialidad que trata enfermedades del sistema nervioso'),
            ('Pediatría', 'Especialidad dedicada al cuidado de niños y adolescentes'),
            ('Ginecología', 'Especialidad que trata la salud de la mujer'),
            ('Traumatología', 'Especialidad que trata lesiones del aparato locomotor'),
            ('Medicina General', 'Atención médica integral y primaria'),
            ('Psiquiatría', 'Especialidad que trata trastornos mentales'),
            ('Dermatología', 'Especialidad que trata enfermedades de la piel')
        `);

        // Hash passwords
        const adminPassword = await bcrypt.hash('admin123', 10);
        const defaultPassword = await bcrypt.hash('password123', 10);

        // Insert usuarios con contraseñas hasheadas
        await queryRunner.query(`
            INSERT INTO usuarios (username, password, role, "centroId", created_at) VALUES
            ('admin', '${adminPassword}', 'admin', NULL, NOW()),
            ('dr.rodriguez', '${defaultPassword}', 'medico', 1, NOW()),
            ('dr.martinez', '${defaultPassword}', 'medico', 2, NOW()),
            ('dr.lopez', '${defaultPassword}', 'medico', 1, NOW()),
            ('enfermera.garcia', '${defaultPassword}', 'empleado', 3, NOW()),
            ('recepcion.silva', '${defaultPassword}', 'empleado', 4, NOW())
        `);

        // Insert médicos
        await queryRunner.query(`
            INSERT INTO medicos (nombre, cedula, correo, telefono, especialidad_id, centro_id) VALUES
            ('Dr. Carlos Rodriguez', '12345678', 'carlos.rodriguez@hospital.com', '300-123-4567', 1, 1),
            ('Dra. Ana Martinez', '23456789', 'ana.martinez@clinica.com', '301-234-5678', 2, 2),
            ('Dr. Luis Lopez', '34567890', 'luis.lopez@hospital.com', '302-345-6789', 3, 1),
            ('Dra. Maria Gonzalez', '45678901', 'maria.gonzalez@centro.com', '303-456-7890', 4, 3),
            ('Dr. Pedro Ramirez', '56789012', 'pedro.ramirez@hospital.com', '304-567-8901', 5, 4),
            ('Dra. Sofia Castro', '67890123', 'sofia.castro@clinica.com', '305-678-9012', 6, 2),
            ('Dr. Diego Herrera', '78901234', 'diego.herrera@centro.com', '306-789-0123', 7, 3),
            ('Dra. Carmen Vargas', '89012345', 'carmen.vargas@hospital.com', '307-890-1234', 8, 1)
        `);

        // Insert empleados
        await queryRunner.query(`
            INSERT INTO empleados (nombre, cedula, cargo, centro_id) VALUES
            ('Patricia Garcia', '11111111', 'Enfermera Jefe', 1),
            ('Roberto Silva', '22222222', 'Recepcionista', 2),
            ('Lucia Morales', '33333333', 'Auxiliar de Enfermería', 1),
            ('Fernando Torres', '44444444', 'Administrativo', 3),
            ('Isabel Ruiz', '55555555', 'Coordinadora', 4),
            ('Andres Mejia', '66666666', 'Técnico en Sistemas', 2),
            ('Monica Jimenez', '77777777', 'Secretaria Médica', 3),
            ('Rafael Ospina', '88888888', 'Auxiliar Administrativo', 4)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete in reverse order to avoid foreign key constraints
        await queryRunner.query(`DELETE FROM empleados`);
        await queryRunner.query(`DELETE FROM medicos`);
        await queryRunner.query(`DELETE FROM usuarios`);
        await queryRunner.query(`DELETE FROM especialidades`);
        await queryRunner.query(`DELETE FROM centros`);
    }
}