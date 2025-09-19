const database = require('../db');

class Task {
    constructor() {
        this.getConnection = () => database.getConnection();
    }

    async findAll() {
        try {
            const connection = this.getConnection();
            const query = `
        SELECT * FROM tasks 
        ORDER BY op_updated_at DESC
      `;

            const [rows] = await connection.execute(query);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            const connection = this.getConnection();
            const query = `SELECT * FROM tasks WHERE id = ?`;

            const [rows] = await connection.execute(query, [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    async findByExternalId(externalId) {
        try {
            const connection = this.getConnection();
            const query = `SELECT * FROM tasks WHERE external_id = ?`;

            const [rows] = await connection.execute(query, [externalId]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    async create(taskData) {
        try {
            const connection = this.getConnection();
            const {
                external_id,
                title,
                description,
                project,
                project_id,
                status,
                assignee,
                responsible,
                priority,
                estimated_hours,
                spent_hours,
                related_to,
                op_created_at,
                op_updated_at
            } = taskData;

            const query = `
        INSERT INTO tasks (
          external_id, title, description, project, project_id, status,
          assignee, responsible, priority, estimated_hours, spent_hours,
          related_to, op_created_at, op_updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

            const [result] = await connection.execute(query, [
                external_id, title, description, project, project_id, status,
                assignee, responsible, priority, estimated_hours, spent_hours,
                related_to, op_created_at, op_updated_at
            ]);

            return { id: result.insertId, ...taskData };
        } catch (error) {
            throw error;
        }
    }

    async update(id, taskData) {
        try {
            const connection = this.getConnection();
            const {
                external_id,
                title,
                description,
                project,
                project_id,
                status,
                assignee,
                responsible,
                priority,
                estimated_hours,
                spent_hours,
                related_to,
                op_created_at,
                op_updated_at
            } = taskData;

            const query = `
        UPDATE tasks 
        SET external_id = ?, title = ?, description = ?, project = ?, project_id = ?, 
            status = ?, assignee = ?, responsible = ?, priority = ?, 
            estimated_hours = ?, spent_hours = ?, related_to = ?, 
            op_created_at = ?, op_updated_at = ?
        WHERE id = ?
      `;

            const [result] = await connection.execute(query, [
                external_id, title, description, project, project_id, status,
                assignee, responsible, priority, estimated_hours, spent_hours,
                related_to, op_created_at, op_updated_at, id
            ]);

            return { id, changes: result.affectedRows, ...taskData };
        } catch (error) {
            throw error;
        }
    }

    async upsertByExternalId(taskData) {
        try {
            const existingTask = await this.findByExternalId(taskData.external_id);

            if (existingTask) {
                return await this.update(existingTask.id, taskData);
            } else {
                return await this.create(taskData);
            }
        } catch (error) {
            throw error;
        }
    }

    async findRelated(id, searchTerms) {
        try {
            if (!searchTerms || searchTerms.length === 0) {
                return [];
            }

            const connection = this.getConnection();
            const likeConditions = searchTerms.map(() =>
                '(title LIKE ? OR description LIKE ?)'
            ).join(' OR ');

            const query = `
        SELECT * FROM tasks 
        WHERE id != ? AND (${likeConditions})
        ORDER BY op_updated_at DESC, updated_at DESC
        LIMIT 10
      `;

            const params = [id];
            searchTerms.forEach(term => {
                const searchPattern = `%${term}%`;
                params.push(searchPattern, searchPattern);
            });

            const [rows] = await connection.execute(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async findByAssignee(assignee, limit = 50) {
        try {
            const connection = this.getConnection();
            const query = `
        SELECT * FROM tasks 
        WHERE assignee = ? 
        ORDER BY op_updated_at DESC, updated_at DESC
        LIMIT ?
      `;

            const [rows] = await connection.execute(query, [assignee, limit]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async findByProject(projectId, limit = 50) {
        try {
            const connection = this.getConnection();
            const query = `
        SELECT * FROM tasks 
        WHERE project_id = ? 
        ORDER BY op_updated_at DESC, updated_at DESC
        LIMIT ?
      `;

            const [rows] = await connection.execute(query, [projectId, limit]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async findByStatus(status, limit = 50) {
        try {
            const connection = this.getConnection();
            const query = `
        SELECT * FROM tasks 
        WHERE status = ? 
        ORDER BY op_updated_at DESC, updated_at DESC
        LIMIT ?
      `;

            const [rows] = await connection.execute(query, [status, limit]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    async getStats() {
        try {
            const connection = this.getConnection();
            const queries = {
                total: 'SELECT COUNT(*) as count FROM tasks',
                byStatus: 'SELECT status, COUNT(*) as count FROM tasks GROUP BY status',
                byAssignee: 'SELECT assignee, COUNT(*) as count FROM tasks WHERE assignee IS NOT NULL GROUP BY assignee ORDER BY count DESC LIMIT 10',
                byProject: 'SELECT project, COUNT(*) as count FROM tasks WHERE project IS NOT NULL GROUP BY project ORDER BY count DESC LIMIT 10',
                byPriority: 'SELECT priority, COUNT(*) as count FROM tasks WHERE priority IS NOT NULL GROUP BY priority',
                recentlyUpdated: 'SELECT COUNT(*) as count FROM tasks WHERE op_updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)'
            };

            const stats = {};
            for (const [key, query] of Object.entries(queries)) {
                const [rows] = await connection.execute(query);
                stats[key] = rows;
            }

            return stats;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const connection = this.getConnection();
            const query = `DELETE FROM tasks WHERE id = ?`;

            const [result] = await connection.execute(query, [id]);
            return { deleted: result.affectedRows > 0, changes: result.affectedRows };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new Task();