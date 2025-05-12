/**
 * Controller for workout-related routes
 */
const workoutService = require('../services/workoutService');
const PDFDocument = require('pdfkit');

/**
 * Handles request to generate a workout plan
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const generateWorkoutPlan = (req, res) => {
  try {
    // Validate required fields
    const { name, age, gender, goal, experience, equipment, days_per_week } = req.body;
    
    if (!name || !age || !gender || !goal || !experience) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Generate the workout plan
    const workoutPlan = workoutService.generateWorkoutPlan(req.body);
    
    // Return the workout plan
    return res.status(200).json({
      success: true,
      message: 'Workout plan generated successfully',
      data: workoutPlan
    });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating workout plan',
      error: error.message
    });
  }
};

/**
 * Handles request to export a workout plan as JSON or PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const exportWorkoutPlan = (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.query;
    
    // Get the workout plan
    const workoutPlan = workoutService.getWorkoutPlan(id);
    
    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found'
      });
    }
    
    // Export based on requested format
    if (format.toLowerCase() === 'pdf') {
      // Create a PDF document
      const doc = new PDFDocument();
      
      // Set response headers for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=workout_plan_${id}.pdf`);
      
      // Pipe the PDF to the response
      doc.pipe(res);
      
      // Add content to the PDF
      generatePDF(doc, workoutPlan);
      
      // Finalize the PDF and end the stream
      doc.end();
    } else {
      // Default to JSON format
      return res.status(200).json({
        success: true,
        data: workoutPlan
      });
    }
  } catch (error) {
    console.error('Error exporting workout plan:', error);
    return res.status(500).json({
      success: false,
      message: 'Error exporting workout plan',
      error: error.message
    });
  }
};

/**
 * Generates a PDF document for a workout plan
 * @param {PDFDocument} doc - PDF document
 * @param {Object} workoutPlan - Workout plan
 */
const generatePDF = (doc, workoutPlan) => {
  // Add title
  doc.fontSize(25).text('Personalized Workout Plan', {
    align: 'center'
  });
  
  // Add user info
  doc.moveDown();
  doc.fontSize(14).text('User Information:');
  doc.fontSize(12).text(`Name: ${workoutPlan.user.name}`);
  doc.text(`Age: ${workoutPlan.user.age}`);
  doc.text(`Gender: ${workoutPlan.user.gender}`);
  doc.text(`Goal: ${formatGoal(workoutPlan.user.goal)}`);
  doc.text(`Experience Level: ${formatExperience(workoutPlan.user.experience)}`);
  doc.text(`Available Equipment: ${workoutPlan.user.equipment.join(', ')}`);
  doc.text(`Workout Split: ${formatWorkoutSplit(workoutPlan.workoutSplit)}`);
  
  // Add each workout session
  doc.moveDown();
  workoutPlan.sessions.forEach((session, index) => {
    // Page break after every 2 sessions except the first one
    if (index > 0 && index % 2 === 0) {
      doc.addPage();
    }
    
    // Session header
    doc.fontSize(16).text(`Workout Session ${session.session} - ${session.date}`, {
      underline: true
    });
    
    // Focus areas
    doc.fontSize(12).text(`Focus: ${formatMuscleGroup(session.focus.primary)} (Primary), ${formatMuscleGroup(session.focus.secondary)} (Secondary)`);
    
    // Warm-up section
    doc.moveDown(0.5);
    doc.fontSize(14).text('Warm-Up:');
    session.sections.warmup.forEach(exercise => {
      if (exercise.duration) {
        doc.text(`• ${exercise.name} - ${exercise.duration}`);
      } else {
        doc.text(`• ${exercise.name} - ${exercise.sets} sets x ${exercise.reps} reps`);
      }
    });
    
    // Main section
    doc.moveDown(0.5);
    doc.fontSize(14).text('Main Exercises:');
    session.sections.main.forEach(exercise => {
      let exerciseText = `• ${exercise.name} - ${exercise.sets} sets x `;
      
      if (exercise.reps) {
        exerciseText += `${exercise.reps} reps`;
      } else if (exercise.duration) {
        exerciseText += exercise.duration;
      }
      
      if (exercise.rest) {
        exerciseText += `, rest: ${exercise.rest}`;
      }
      
      if (exercise.tempo) {
        exerciseText += `, tempo: ${exercise.tempo}`;
      }
      
      doc.text(exerciseText);
    });
    
    // Custom sections
    if (session.sections.circuit) {
      doc.moveDown(0.5);
      doc.fontSize(14).text('Circuit Training:');
      doc.text(`Perform ${session.sections.circuit.rounds} rounds with ${session.sections.circuit.rest_between_exercises} rest between exercises and ${session.sections.circuit.rest_between_rounds} rest between rounds.`);
      
      session.sections.circuit.exercises.forEach(exercise => {
        doc.text(`• ${exercise.name} - ${exercise.reps} reps or ${exercise.time}`);
      });
    }
    
    if (session.sections.superset) {
      doc.moveDown(0.5);
      doc.fontSize(14).text('Supersets:');
      
      session.sections.superset.forEach(superset => {
        doc.text(`• Superset: ${superset.name} - ${superset.rounds} rounds`);
        superset.exercises.forEach((exercise, i) => {
          doc.text(`  ${i + 1}. ${exercise.name} - ${exercise.sets} sets x ${exercise.reps} reps, rest: ${exercise.rest}`);
        });
      });
    }
    
    // Cool-down section
    doc.moveDown(0.5);
    doc.fontSize(14).text('Cool-Down:');
    session.sections.cooldown.forEach(exercise => {
      doc.text(`• ${exercise.name} - ${exercise.duration}`);
    });
    
    // Add some space between sessions
    doc.moveDown(1.5);
  });
  
  // Add footer
  const currentDate = new Date().toLocaleDateString();
  doc.fontSize(10).text(`Generated on ${currentDate}`, {
    align: 'center'
  });
};

/**
 * Format goal string for display
 * @param {string} goal - Goal identifier
 * @returns {string} Formatted goal
 */
const formatGoal = (goal) => {
  const goals = {
    'muscle_gain': 'Muscle Gain',
    'fat_loss': 'Fat Loss',
    'strength': 'Strength',
    'endurance': 'Endurance',
    'general_fitness': 'General Fitness'
  };
  
  return goals[goal] || goal;
};

/**
 * Format experience level for display
 * @param {string} experience - Experience level identifier
 * @returns {string} Formatted experience level
 */
const formatExperience = (experience) => {
  const levels = {
    'beginner': 'Beginner',
    'intermediate': 'Intermediate',
    'advanced': 'Advanced'
  };
  
  return levels[experience] || experience;
};

/**
 * Format workout split for display
 * @param {string} split - Workout split identifier
 * @returns {string} Formatted workout split
 */
const formatWorkoutSplit = (split) => {
  const splits = {
    'fullbody': 'Full Body',
    'full_body': 'Full Body',
    'upper_lower': 'Upper/Lower',
    'push_pull_legs': 'Push/Pull/Legs',
    'bro_split': 'Bro Split',
    'ppl': 'Push/Pull/Legs'
  };
  
  return splits[split] || split;
};

/**
 * Format muscle group for display
 * @param {string} muscleGroup - Muscle group identifier
 * @returns {string} Formatted muscle group
 */
const formatMuscleGroup = (muscleGroup) => {
  const groups = {
    'chest': 'Chest',
    'back': 'Back',
    'legs': 'Legs',
    'shoulders': 'Shoulders',
    'arms': 'Arms',
    'core': 'Core',
    'cardio': 'Cardio',
    'full_body': 'Full Body',
    'push': 'Push (Chest, Shoulders, Triceps)',
    'pull': 'Pull (Back, Biceps)',
    'triceps': 'Triceps',
    'biceps': 'Biceps',
    'traps': 'Traps',
    'forearms': 'Forearms'
  };
  
  return groups[muscleGroup] || muscleGroup;
};

module.exports = {
  generateWorkoutPlan,
  exportWorkoutPlan
};