/**
 * Exercise database and utility functions
 */

// Muscle group definitions
const muscleGroups = {
    chest: ['chest', 'shoulders', 'triceps'],
    back: ['back', 'biceps', 'rear_deltoids'],
    legs: ['quadriceps', 'hamstrings', 'calves', 'glutes'],
    shoulders: ['shoulders', 'traps', 'triceps'],
    arms: ['biceps', 'triceps', 'forearms'],
    core: ['abs', 'obliques', 'lower_back'],
    full_body: ['full_body'],
    cardio: ['cardio']
};

// Exercise database
const exercises = [
    // Warm-up exercises
    {
        name: 'Light Jogging',
        type: 'warmup',
        muscle_group: 'cardio',
        equipment: ['bodyweight'],
        duration: '5 minutes'
    },
    {
        name: 'Jumping Jacks',
        type: 'warmup',
        muscle_group: 'cardio',
        equipment: ['bodyweight'],
        duration: '2 minutes'
    },
    {
        name: 'Arm Circles',
        type: 'warmup',
        muscle_group: 'shoulders',
        equipment: ['bodyweight'],
        duration: '1 minute'
    },
    {
        name: 'Bodyweight Squats',
        type: 'warmup',
        muscle_group: 'legs',
        equipment: ['bodyweight'],
        sets: 2,
        reps: 10
    },

    // Main exercises
    {
        name: 'Push-ups',
        type: 'main',
        muscle_group: 'chest',
        equipment: ['bodyweight'],
        sets: 3,
        reps: 12,
        rest: '60 seconds'
    },
    {
        name: 'Pull-ups',
        type: 'main',
        muscle_group: 'back',
        equipment: ['bodyweight'],
        sets: 3,
        reps: 8,
        rest: '90 seconds'
    },
    {
        name: 'Dumbbell Bench Press',
        type: 'main',
        muscle_group: 'chest',
        equipment: ['dumbbells'],
        sets: 4,
        reps: 10,
        rest: '90 seconds'
    },
    {
        name: 'Barbell Squats',
        type: 'main',
        muscle_group: 'legs',
        equipment: ['barbell'],
        sets: 4,
        reps: 8,
        rest: '120 seconds'
    },
    {
        name: 'Dumbbell Shoulder Press',
        type: 'main',
        muscle_group: 'shoulders',
        equipment: ['dumbbells'],
        sets: 3,
        reps: 12,
        rest: '60 seconds'
    },
    {
        name: 'Bent Over Rows',
        type: 'main',
        muscle_group: 'back',
        equipment: ['dumbbells', 'barbell'],
        sets: 3,
        reps: 12,
        rest: '90 seconds'
    },

    // Cool-down exercises
    {
        name: 'Light Stretching',
        type: 'cooldown',
        muscle_group: 'full_body',
        equipment: ['bodyweight'],
        duration: '5 minutes'
    },
    {
        name: 'Deep Breathing',
        type: 'cooldown',
        muscle_group: 'full_body',
        equipment: ['bodyweight'],
        duration: '2 minutes'
    }
];

/**
 * Get exercises based on filters
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered exercises
 */
const getExercises = (filters = {}) => {
    return exercises.filter(exercise => {
        // Filter by type
        if (filters.type && exercise.type !== filters.type) {
            return false;
        }

        // Filter by equipment
        if (filters.equipment && !filters.equipment.some(eq => exercise.equipment.includes(eq))) {
            return false;
        }

        // Filter by muscle group
        if (filters.muscleGroup && exercise.muscle_group !== filters.muscleGroup) {
            return false;
        }

        return true;
    });
};

module.exports = {
    muscleGroups,
    getExercises
};