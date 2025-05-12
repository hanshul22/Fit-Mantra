/**
 * Utility functions for date handling
 */

/**
 * Generates workout dates based on frequency and number of sessions
 * @param {number} daysPerWeek - Number of workout days per week
 * @param {number} numberOfSessions - Total number of sessions to generate
 * @returns {Array} Array of Date objects
 */
const generateWorkoutDates = (daysPerWeek, numberOfSessions) => {
    const dates = [];
    const today = new Date();
    let currentDate = new Date(today);

    // Skip to next Monday if today is weekend
    while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Generate dates for the specified number of sessions
    for (let i = 0; i < numberOfSessions; i++) {
        dates.push(new Date(currentDate));
        
        // Calculate next workout date
        const daysToAdd = Math.ceil(7 / daysPerWeek);
        currentDate.setDate(currentDate.getDate() + daysToAdd);
        
        // Skip weekends
        while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }

    return dates;
};

/**
 * Formats a date into a readable string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
};

module.exports = {
    generateWorkoutDates,
    formatDate
};