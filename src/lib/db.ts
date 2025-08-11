import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || '181.115.207.243',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'coosapac',
  user: process.env.DB_USER || 'coosapac',
  password: process.env.DB_PASSWORD || '123456',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
};

let pool: mysql.Pool;

export function getConnection() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export interface Lectura {
  num_lectura: number;
  mes: number;
  gestion: number;
  cod_accion: string;
  lectura_ant: number;
  lectura: number;
  condicion: number;
  consumo: number;
  monto: number;
  fecha: string;
  num_factura: number;
  observaciones: string;
  tipo_lec: string;
  fecha_reg: string;
  lecturador: string;
}

export default getConnection;
