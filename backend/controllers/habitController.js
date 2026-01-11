const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

exports.getHabits = async (req, res) => {
    try {
        const habits = await Habit.findAllByUserId(req.user.id);
        // Conversion des IDs en string pour correspondre au frontend
        const formatted = habits.map(h => ({
            ...h,
            id: h.id.toString(),
            userId: h.user_id.toString()
        }));
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createHabit = async (req, res) => {
    try {
        // ✅ Passer directement req.body au create, qui retourne l'objet créé
        const newHabit = await Habit.create(req.user.id, req.body);

        // ✅ Formater et retourner directement (ne pas refetcher)
        res.status(201).json({
            ...newHabit,
            id: newHabit.id.toString(),
            userId: newHabit.user_id.toString()
        });
    } catch (error) {
        console.error('Error creating habit:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteHabit = async (req, res) => {
    try {
        await Habit.delete(req.params.id, req.user.id);
        res.json({ message: 'Habitude supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = await HabitLog.findAllByUser(req.user.id);
        // ❌ PROBLÈME: new Date(l.date) peut causer un décalage TZ
        const formatted = logs.map(l => {
            // ✅ CORRECTION: Traiter comme date UTC
            const dateStr = typeof l.date === 'string'
                ? l.date
                : new Date(l.date).toISOString().split('T')[0];

            return {
                id: l.id.toString(),
                habitId: l.habit_id.toString(),
                date: dateStr,  // Garder le format YYYY-MM-DD
                value: l.value
            };
        });
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logHabit = async (req, res) => {
    const { habitId, date, value } = req.body;
    console.log('📝 LOG REQUEST:', { habitId, date, value });  // ✅ Debug

    try {
        const habitIdInt = parseInt(habitId, 10);
        const habit = await Habit.findById(habitIdInt);

        if (!habit || habit.user_id !== req.user.id) {
            return res.status(403).json({ message: 'Non autorisé' });
        }

        const log = await HabitLog.upsert(habitIdInt, date, value);

        const dateStr = typeof log.date === 'string'
            ? log.date
            : new Date(log.date).toISOString().split('T')[0];

        console.log('✅ LOG SAVED:', { date, dateStr, value });  // ✅ Debug

        res.json({
            id: log.id.toString(),
            habitId: log.habit_id.toString(),
            date: dateStr,
            value: log.value
        });
    } catch (error) {
        console.error('❌ ERROR:', error);
        res.status(500).json({ message: error.message });
    }
};
