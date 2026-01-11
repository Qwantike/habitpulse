const db = require('../config/db');

class HabitLog {
    static async upsert(habitId, date, value) {
        const habitIdInt = parseInt(habitId, 10);
        if (isNaN(habitIdInt)) {
            throw new Error('Invalid habit ID');
        }

        // ✅ S'assurer que 'date' est au format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
        }

        const query = `
            INSERT INTO habit_logs (habit_id, date, value)
            VALUES ($1, $2::date, $3)
            ON CONFLICT (habit_id, date) 
            DO UPDATE SET value = EXCLUDED.value, created_at = CURRENT_TIMESTAMP
            RETURNING id, habit_id, date, value, created_at
        `;
        try {
            const result = await db.query(query, [habitIdInt, date, value]);
            return result.rows[0];
        } catch (error) {
            console.error('HabitLog.upsert error:', error);
            throw new Error(`Failed to log habit: ${error.message}`);
        }
    }

    static async findAllByUser(userId) {
        const query = `
            SELECT 
                l.id, 
                l.habit_id, 
                l.date::text as date,
                l.value, 
                l.created_at
            FROM habit_logs l
            JOIN habits h ON l.habit_id = h.id
            WHERE h.user_id = $1
            ORDER BY l.date DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    static async findByHabitId(habitId) {
        const habitIdInt = parseInt(habitId, 10);
        if (isNaN(habitIdInt)) {
            throw new Error('Invalid habit ID');
        }

        const query = `
            SELECT id, habit_id, date, value, created_at
            FROM habit_logs
            WHERE habit_id = $1
            ORDER BY date DESC
        `;
        const result = await db.query(query, [habitIdInt]);
        return result.rows;
    }

    static async findByHabitAndDateRange(habitId, startDate, endDate) {
        const habitIdInt = parseInt(habitId, 10);
        if (isNaN(habitIdInt)) {
            throw new Error('Invalid habit ID');
        }

        const query = `
            SELECT id, habit_id, date, value, created_at
            FROM habit_logs
            WHERE habit_id = $1 AND date BETWEEN $2 AND $3
            ORDER BY date ASC
        `;
        const result = await db.query(query, [habitIdInt, startDate, endDate]);
        return result.rows;
    }

    static async delete(id, userId) {
        const logIdInt = parseInt(id, 10);
        if (isNaN(logIdInt)) {
            throw new Error('Invalid log ID');
        }

        // Vérifier que le log appartient à l'utilisateur avant de supprimer
        const query = `
            DELETE FROM habit_logs l
            USING habits h
            WHERE l.id = $1 AND l.habit_id = h.id AND h.user_id = $2
        `;
        const result = await db.query(query, [logIdInt, userId]);
        return result.rowCount > 0;
    }
}

module.exports = HabitLog;
