const mysql = require('mysql2/promise');

class Database {
    constructor() {
        this.connection = null;
        this.config = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'tasks'
        };
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection(this.config);
            console.log('Connected to MySQL database');
            await this.initializeTables();
        } catch (error) {
            console.error('Error connecting to database:', error.message);
            throw error;
        }
    }

    async initializeTables() {
        try {
            const createTasksTable = `
        CREATE TABLE IF NOT EXISTS tasks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          external_id VARCHAR(255),
          title VARCHAR(500) NOT NULL,
          description TEXT,
          project VARCHAR(255),
          project_id VARCHAR(50),
          status VARCHAR(100) DEFAULT 'pending',
          assignee VARCHAR(255),
          responsible VARCHAR(255),
          priority VARCHAR(100),
          estimated_hours DECIMAL(8,2),
          spent_hours DECIMAL(8,2),
          related_to TEXT,
          op_created_at DATETIME,
          op_updated_at DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_external_id (external_id),
          INDEX idx_status (status),
          INDEX idx_project (project),
          INDEX idx_project_id (project_id),
          INDEX idx_assignee (assignee),
          INDEX idx_op_updated_at (op_updated_at),
          INDEX idx_priority (priority)
        )
      `;

            await this.connection.execute(createTasksTable);
            console.log('Tasks table created successfully');
        } catch (error) {
            console.error('Error creating tasks table:', error.message);
            throw error;
        }
    }

    getConnection() {
        return this.connection;
    }

    async close() {
        try {
            if (this.connection) {
                await this.connection.end();
                console.log('Database connection closed');
            }
        } catch (error) {
            console.error('Error closing database:', error.message);
            throw error;
        }
    }
}

module.exports = new Database();