/**
 * Core service for generating workout plans
 */
const { v4: uuidv4 } = require('uuid');
const exerciseData = require('../models/exerciseData');
const { generateWorkoutDates, formatDate } = require('../utils/dateUtils');
const { 
  applyProgressiveOverload, 
  determineWorkoutSplit,
  determineMuscleGroupFocus
} = require('../utils/progressionUtils');

// In-memory storage for generated workout plans
const workoutPlans = {};

/**
 * Generates a complete workout plan based on user profile
 * @param {Object} userProfile - User profile data
 * @returns {Object} Complete workout plan
 */
const generateWorkoutPlan = (userProfile) => {
  // Extract user profile data
  const { 
    name, 
    age, 
    gender, 
    goal = 'general_fitness',
    experience = 'beginner', 
    equipment = ['bodyweight'], 
    days_per_week = 3
  } = userProfile;
  
  // Determine workout split
  const workoutSplit = determineWorkoutSplit(goal, experience);
  
  // Generate workout dates
  const workoutDates = generateWorkoutDates(days_per_week, 12);
  
  // Generate each session
  const sessions = [];
  for (let i = 0; i < 12; i++) {
    const sessionNumber = i + 1;
    const session = generateWorkoutSession({
      sessionNumber,
      date: workoutDates[i],
      workoutSplit,
      goal,
      experience,
      equipment
    });
    
    sessions.push(session);
  }
  
  // Create the complete workout plan
  const workoutPlan = {
    id: uuidv4(),
    user: {
      name,
      age,
      gender,
      goal,
      experience,
      equipment
    },
    workoutSplit,
    sessions,
    createdAt: new Date()
  };
  
  // Store the workout plan
  workoutPlans[workoutPlan.id] = workoutPlan;
  
  return workoutPlan;
};

/**
 * Generates a single workout session
 * @param {Object} options - Options for generating the workout session
 * @returns {Object} A complete workout session
 */
const generateWorkoutSession = ({
  sessionNumber,
  date,
  workoutSplit,
  goal,
  experience,
  equipment
}) => {
  // Determine muscle group focus for this session
  const { primary, secondary } = determineMuscleGroupFocus(workoutSplit, sessionNumber);
  
  // Generate each section of the workout
  const warmup = generateWarmupSection(primary, equipment);
  const main = generateMainSection(primary, secondary, goal, experience, equipment, sessionNumber);
  const cooldown = generateCooldownSection();
  
  // Add optional circuit or superset if appropriate
  const sections = {
    warmup,
    main,
    cooldown
  };
  
  if (sessionNumber % 4 === 0) {
    sections.circuit = generateCircuitSection(primary, secondary, experience, equipment);
  }
  
  if (sessionNumber % 3 === 0) {
    sections.superset = generateSupersetSection(primary, secondary, experience, equipment);
  }
  
  return {
    session: sessionNumber,
    date: formatDate(date),
    focus: {
      primary,
      secondary
    },
    sections
  };
};

/**
 * Generates the warm-up section of a workout
 * @param {string} focusArea - Primary muscle group focus
 * @param {Array} equipment - Available equipment
 * @returns {Array} Warm-up exercises
 */
const generateWarmupSection = (focusArea, equipment) => {
  const warmupExercises = exerciseData.getExercises({
    type: 'warmup',
    equipment
  });
  
  // Select 2-3 warm-up exercises
  const selectedWarmups = [];
  
  // Always include one general warm-up
  const generalWarmups = warmupExercises.filter(ex => 
    ex.muscle_group === 'full_body' || ex.muscle_group === 'cardio');
  
  if (generalWarmups.length > 0) {
    selectedWarmups.push(generalWarmups[Math.floor(Math.random() * generalWarmups.length)]);
  }
  
  // Add 1-2 focus-specific warm-ups
  const focusWarmups = warmupExercises.filter(ex => 
    exerciseData.muscleGroups[focusArea]?.includes(ex.muscle_group));
  
  if (focusWarmups.length > 0) {
    selectedWarmups.push(focusWarmups[Math.floor(Math.random() * focusWarmups.length)]);
    
    if (Math.random() > 0.5 && focusWarmups.length > 1) {
      let additionalWarmup;
      do {
        additionalWarmup = focusWarmups[Math.floor(Math.random() * focusWarmups.length)];
      } while (selectedWarmups.includes(additionalWarmup));
      
      selectedWarmups.push(additionalWarmup);
    }
  }
  
  return selectedWarmups;
};

/**
 * Generates the main section of a workout
 * @param {string} primary - Primary muscle group focus
 * @param {string} secondary - Secondary muscle group focus
 * @param {string} goal - User's fitness goal
 * @param {string} experience - User's experience level
 * @param {Array} equipment - Available equipment
 * @param {number} sessionNumber - Current session number
 * @returns {Array} Main exercises
 */
const generateMainSection = (primary, secondary, goal, experience, equipment, sessionNumber) => {
  const mainExercises = exerciseData.getExercises({
    type: 'main',
    equipment
  });
  
  // Filter exercises for primary and secondary muscle groups
  const primaryExercises = mainExercises.filter(ex => 
    exerciseData.muscleGroups[primary]?.includes(ex.muscle_group));
  
  const secondaryExercises = mainExercises.filter(ex => 
    exerciseData.muscleGroups[secondary]?.includes(ex.muscle_group));
  
  // Select exercises
  const selectedExercises = [];
  
  // Add 3-4 primary exercises
  const numPrimary = Math.min(4, Math.max(3, primaryExercises.length));
  for (let i = 0; i < numPrimary; i++) {
    if (primaryExercises.length > 0) {
      const exercise = primaryExercises[Math.floor(Math.random() * primaryExercises.length)];
      selectedExercises.push(applyProgressiveOverload({...exercise}, sessionNumber, experience));
    }
  }
  
  // Add 2-3 secondary exercises
  const numSecondary = Math.min(3, Math.max(2, secondaryExercises.length));
  for (let i = 0; i < numSecondary; i++) {
    if (secondaryExercises.length > 0) {
      const exercise = secondaryExercises[Math.floor(Math.random() * secondaryExercises.length)];
      selectedExercises.push(applyProgressiveOverload({...exercise}, sessionNumber, experience));
    }
  }
  
  return selectedExercises;
};

/**
 * Generates the cool-down section of a workout
 * @returns {Array} Cool-down exercises
 */
const generateCooldownSection = () => {
  return exerciseData.getExercises({
    type: 'cooldown'
  });
};

/**
 * Generates a circuit training section
 * @param {string} primary - Primary muscle group focus
 * @param {string} secondary - Secondary muscle group focus
 * @param {string} experience - User's experience level
 * @param {Array} equipment - Available equipment
 * @returns {Object} Circuit training section
 */
const generateCircuitSection = (primary, secondary, experience, equipment) => {
  const exercises = exerciseData.getExercises({
    type: 'main',
    equipment
  });
  
  const circuitExercises = exercises
    .filter(ex => 
      exerciseData.muscleGroups[primary]?.includes(ex.muscle_group) ||
      exerciseData.muscleGroups[secondary]?.includes(ex.muscle_group))
    .slice(0, 4);
  
  return {
    rounds: experience === 'beginner' ? 2 : 3,
    rest_between_exercises: '30 seconds',
    rest_between_rounds: '90 seconds',
    exercises: circuitExercises.map(ex => ({
      name: ex.name,
      reps: ex.reps || 10,
      time: ex.duration || '30 seconds'
    }))
  };
};

/**
 * Generates a superset section
 * @param {string} primary - Primary muscle group focus
 * @param {string} secondary - Secondary muscle group focus
 * @param {string} experience - User's experience level
 * @param {Array} equipment - Available equipment
 * @returns {Array} Superset exercises
 */
const generateSupersetSection = (primary, secondary, experience, equipment) => {
    const exercises = exerciseData.getExercises({
        type: 'main',
        equipment
    });
    
    const primaryExercises = exercises.filter(ex => 
        exerciseData.muscleGroups[primary]?.includes(ex.muscle_group));
    
    const secondaryExercises = exercises.filter(ex => 
        exerciseData.muscleGroups[secondary]?.includes(ex.muscle_group));
    
    // Check if we have enough exercises for a superset
    if (primaryExercises.length === 0 || secondaryExercises.length === 0) {
        return null;
    }
    
    // Get random exercises from each group
    const primaryExercise = primaryExercises[Math.floor(Math.random() * primaryExercises.length)];
    const secondaryExercise = secondaryExercises[Math.floor(Math.random() * secondaryExercises.length)];
    
    // Check if we got valid exercises
    if (!primaryExercise || !secondaryExercise) {
        return null;
    }
    
    return [{
        name: `${primary} + ${secondary} Superset`,
        rounds: experience === 'beginner' ? 2 : 3,
        exercises: [
            {
                name: primaryExercise.name,
                sets: primaryExercise.sets || 3,
                reps: primaryExercise.reps || 10,
                rest: '60 seconds'
            },
            {
                name: secondaryExercise.name,
                sets: secondaryExercise.sets || 3,
                reps: secondaryExercise.reps || 10,
                rest: '60 seconds'
            }
        ]
    }];
};

/**
 * Retrieves a stored workout plan
 * @param {string} id - Workout plan ID
 * @returns {Object|null} The workout plan or null if not found
 */
const getWorkoutPlan = (id) => {
  return workoutPlans[id] || null;
};

module.exports = {
  generateWorkoutPlan,
  getWorkoutPlan
};