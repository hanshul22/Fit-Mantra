/**
 * Utility functions for workout progression and planning
 */

/**
 * Determines the appropriate workout split based on goal and experience
 * @param {string} goal - User's fitness goal
 * @param {string} experience - User's experience level
 * @returns {string} Workout split type
 */
const determineWorkoutSplit = (goal, experience) => {
    if (experience === 'beginner') {
        return 'full_body';
    }

    switch (goal) {
        case 'strength':
            return 'push_pull_legs';
        case 'muscle_gain':
            return experience === 'advanced' ? 'bro_split' : 'upper_lower';
        case 'weight_loss':
            return 'full_body';
        case 'endurance':
            return 'full_body';
        default:
            return 'full_body';
    }
};

/**
 * Determines muscle group focus for a session
 * @param {string} split - Workout split type
 * @param {number} sessionNumber - Current session number
 * @returns {Object} Primary and secondary muscle groups
 */
const determineMuscleGroupFocus = (split, sessionNumber) => {
    switch (split) {
        case 'push_pull_legs':
            return getPushPullLegsFocus(sessionNumber);
        case 'upper_lower':
            return getUpperLowerFocus(sessionNumber);
        case 'bro_split':
            return getBroSplitFocus(sessionNumber);
        case 'full_body':
        default:
            return {
                primary: 'full_body',
                secondary: 'cardio'
            };
    }
};

/**
 * Gets muscle focus for push/pull/legs split
 * @param {number} sessionNumber - Current session number
 * @returns {Object} Primary and secondary muscle groups
 */
const getPushPullLegsFocus = (sessionNumber) => {
    const focusMap = {
        1: { primary: 'chest', secondary: 'shoulders' },
        2: { primary: 'back', secondary: 'arms' },
        3: { primary: 'legs', secondary: 'core' },
        4: { primary: 'shoulders', secondary: 'chest' },
        5: { primary: 'back', secondary: 'arms' },
        6: { primary: 'legs', secondary: 'core' }
    };

    return focusMap[(sessionNumber % 6) + 1];
};

/**
 * Gets muscle focus for upper/lower split
 * @param {number} sessionNumber - Current session number
 * @returns {Object} Primary and secondary muscle groups
 */
const getUpperLowerFocus = (sessionNumber) => {
    return sessionNumber % 2 === 0
        ? { primary: 'legs', secondary: 'core' }
        : { primary: 'chest', secondary: 'back' };
};

/**
 * Gets muscle focus for bro split
 * @param {number} sessionNumber - Current session number
 * @returns {Object} Primary and secondary muscle groups
 */
const getBroSplitFocus = (sessionNumber) => {
    const focusMap = {
        1: { primary: 'chest', secondary: 'triceps' },
        2: { primary: 'back', secondary: 'biceps' },
        3: { primary: 'legs', secondary: 'core' },
        4: { primary: 'shoulders', secondary: 'traps' },
        5: { primary: 'arms', secondary: 'forearms' },
        6: { primary: 'core', secondary: 'cardio' }
    };

    return focusMap[(sessionNumber % 6) + 1];
};

/**
 * Applies progressive overload to exercise parameters
 * @param {Object} exercise - Exercise to modify
 * @param {number} sessionNumber - Current session number
 * @param {string} experience - User's experience level
 * @returns {Object} Modified exercise with progression
 */
const applyProgressiveOverload = (exercise, sessionNumber, experience) => {
    const progression = {
        beginner: {
            sets: 0.5,
            reps: 2,
            rest: -5
        },
        intermediate: {
            sets: 1,
            reps: 1,
            rest: -10
        },
        advanced: {
            sets: 1,
            reps: 2,
            rest: -15
        }
    };

    const level = progression[experience];
    const weeks = Math.floor(sessionNumber / 3);

    if (exercise.sets) {
        exercise.sets = Math.max(1, Math.floor(exercise.sets + (weeks * level.sets)));
    }
    if (exercise.reps) {
        exercise.reps = Math.max(1, Math.floor(exercise.reps + (weeks * level.reps)));
    }
    if (exercise.rest) {
        const currentRest = parseInt(exercise.rest);
        exercise.rest = `${Math.max(30, currentRest + (weeks * level.rest))} seconds`;
    }

    return exercise;
};

module.exports = {
    determineWorkoutSplit,
    determineMuscleGroupFocus,
    applyProgressiveOverload
};