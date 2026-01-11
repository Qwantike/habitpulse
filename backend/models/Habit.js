const db = require('../config/db');

class Habit {
    static async create(userId, data) {
        const { title, description, type, period, goal, unit, color } = data;
        const query = `
            INSERT INTO habits (user_id, title, description, type, period, goal, unit, color)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, user_id, title, description, type, period, goal, unit, color, created_at
        `;
        try {
            const result = await db.query(query, [
                userId,
                title,
                description || null,
                type,
                period,
                goal || null,
                unit || null,
                color
            ]);
            return result.rows[0];
        } catch (error) {
            console.error('Habit.create error:', error);
            throw new Error(`Failed to create habit: ${error.message}`);
        }
    }

    static async findAllByUserId(userId) {
        const query = `
            SELECT id, user_id, title, description, type, period, goal, unit, color, created_at
            FROM habits
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const result = await db.query(query, [userId]);
        return result.rows;
    }

    static async findById(id) {
        // ✅ Assurer que id est un entier
        const idInt = parseInt(id, 10);
        if (isNaN(idInt)) {
            throw new Error('Invalid habit ID');
        }

        const query = `
            SELECT id, user_id, title, description, type, period, goal, unit, color, created_at
            FROM habits
            WHERE id = $1
        `;
        const result = await db.query(query, [idInt]);
        return result.rows[0];
    }

    static async delete(id, userId) {
        const idInt = parseInt(id, 10);
        if (isNaN(idInt)) {
            throw new Error('Invalid habit ID');
        }

        const query = 'DELETE FROM habits WHERE id = $1 AND user_id = $2';
        const result = await db.query(query, [idInt, userId]);

        if (result.rowCount === 0) {
            throw new Error('Habit not found or not authorized');
        }
    }

    static async update(id, userId, data) {
        const { title, description, type, period, goal, unit, color } = data;
        const idInt = parseInt(id, 10);
        if (isNaN(idInt)) {
            throw new Error('Invalid habit ID');
        }

        const query = `
            UPDATE habits
            SET title = $2, description = $3, type = $4, period = $5, goal = $6, unit = $7, color = $8
            WHERE id = $1 AND user_id = $9
            RETURNING id, user_id, title, description, type, period, goal, unit, color, created_at
        `;
        const result = await db.query(query, [
            idInt,
            title,
            description || null,
            type,
            period,
            goal || null,
            unit || null,
            color,
            userId
        ]);

        if (result.rows.length === 0) {
            throw new Error('Habit not found or not authorized');
        }

        return result.rows[0];
    }
}

module.exports = Habit;
