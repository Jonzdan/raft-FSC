import pg from 'pg';
import fs from 'fs';
const PGPASSWORD = process.env.MODE == 'dev' ? fs.readFileSync(process.env.PGPASSFILE, 'utf-8').trim() : process.env.PGPASSWORD_LOCAL;

class DatabaseClient {
    constructor() {
        this.pool = new pg.Pool({
            user: process.env.PGUSER,
            password: PGPASSWORD,
            host: process.env.PGHOST,
            port: process.env.PGPORT,
            database: process.env.PGDATABASE,
        });
        this.pool.on("error", (err, client) => {
            console.error("Unexpected error in db pool", err)
            process.exit(1)
        })
        this.pool.once('open', () => console.log("Connected to db"));
        this.tablesInitialized = false;
    }

    async createTables() {
        const query = `
            CREATE TABLE IF NOT EXISTS guests (
                id SERIAL PRIMARY KEY,
                guestname VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(61) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS check_ins (
                id SERIAL PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                message VARCHAR(200) NOT NULL,
                phone_number VARCHAR(20) NOT NULL UNIQUE,
                date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                guest_id INT NOT NULL,
                FOREIGN KEY (guest_id) REFERENCES guests(id) on DELETE CASCADE
            );
        `;
        const client = await this.pool.connect();
        try {
            await client.query(query);
            this.tablesInitialized = true;
        } catch (error) {
            console.error("Error encountered creating db tables", error);
        } finally {
            client.release();
        }
    }

    async query(query, params=null) {
        if (!this.tablesInitialized) {
            await this.createTables();
        }

        const paramsToUse = params || [];
        if (!query) return null;

        try {
            const { rows, rowCount } = await this.pool.query(query, paramsToUse);
            return [rows, rowCount];

        } catch (err) {
            console.error("Error occurred in function DatabaseClient.query", err);
        }
        return null;
    }

    async mutate(mutation, params=null) {
        if (!this.tablesInitialized) {
            await this.createTables();
        }

        const paramsToUse = params || [];
        if (!mutation) return null;

        try {
            const { rowCount } = await this.pool.query(mutation, paramsToUse);
            return rowCount
        } catch (err) {
            console.error("Error occurred in function DatabaseClient.mutate", err)
            return null;
        }
    }

    async getClientConnection() {
        if (!this.tablesInitialized) {
            await this.createTables();
        }
        return await this.pool.connect()
    }

    async closeClientConnection(client) {
        if (!this.tablesInitialized) {
            await this.createTables();
        }
        return await client.release();
    }

    async endPool() {
        if (!this.pool.ended) {
            await this.pool.end()
        }
    }

}

export const db = new DatabaseClient();