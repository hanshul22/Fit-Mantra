document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('workout-form');
    const workoutPlanSection = document.getElementById('workout-plan');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorMessage = document.getElementById('error-message');

    // Show error message
    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        loadingOverlay.style.display = 'none';
    };

    // Hide error message
    const hideError = () => {
        errorMessage.style.display = 'none';
    };

    // Format user input
    const formatUserInput = (input) => {
        if (!input) return '';
        
        // Handle special cases
        const specialCases = {
            'full_body': 'Full Body',
            'push_pull_legs': 'Push/Pull/Legs',
            'upper_lower': 'Upper/Lower',
            'bro_split': 'Bro Split'
        };
        
        if (specialCases[input]) {
            return specialCases[input];
        }
        
        // Standard formatting for other inputs
        return input.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Format workout data
    const formatWorkoutData = (data) => {
        if (!data) return {
            user: { name: 'N/A', goal: 'N/A', experience: 'N/A' },
            workoutSplit: 'N/A',
            sessions: []
        };
        
        return {
            ...data,
            user: {
                ...data.user,
                goal: data.user && data.user.goal ? formatUserInput(data.user.goal) : 'N/A',
                experience: data.user && data.user.experience ? formatUserInput(data.user.experience) : 'N/A'
            },
            workoutSplit: data.workoutSplit ? formatUserInput(data.workoutSplit) : 'N/A'
        };
    };

    // Display workout plan
    const displayWorkoutPlan = (workoutPlan) => {
        console.log('Received workout plan:', workoutPlan);
        
        try {
            if (!workoutPlan) {
                throw new Error('Workout plan is undefined or null');
            }
            
            if (!workoutPlan.user) {
                throw new Error('Workout plan user information is missing');
            }
            
            if (!workoutPlan.sessions || !Array.isArray(workoutPlan.sessions)) {
                throw new Error('Workout sessions are missing or not an array');
            }
            
            const formattedPlan = formatWorkoutData(workoutPlan);
            console.log('Formatted plan:', formattedPlan);
            
            // Update user info
            document.getElementById('user-name').textContent = formattedPlan.user.name || 'N/A';
            document.getElementById('user-goal').textContent = formattedPlan.user.goal || 'N/A';
            document.getElementById('user-experience').textContent = formattedPlan.user.experience || 'N/A';
            document.getElementById('workout-split').textContent = formattedPlan.workoutSplit || 'N/A';
            
            // Clear existing sessions
            const sessionsContainer = document.getElementById('workout-sessions');
            sessionsContainer.innerHTML = '';
            
            // Add each session
            formattedPlan.sessions.forEach((session, index) => {
                console.log(`Processing session ${index + 1}:`, session);
                
                // Skip sessions with missing data
                if (!session || !session.sections) {
                    console.warn(`Skipping session ${index + 1} due to missing data`);
                    return;
                }
                
                const sessionElement = document.createElement('div');
                sessionElement.className = 'workout-session';
                
                // Create HTML template with conditional checks for all data points
                let sessionHtml = `
                    <h3>Session ${session.session || (index + 1)} - ${session.date || 'Scheduled'}</h3>
                `;
                
                // Only add focus if available
                if (session.focus) {
                    sessionHtml += `
                        <p class="focus">Focus: ${formatUserInput(session.focus.primary || 'general')} + 
                            ${formatUserInput(session.focus.secondary || 'support')}</p>
                    `;
                }
                
                // Warm-up section with checks
                if (session.sections.warmup && Array.isArray(session.sections.warmup)) {
                    sessionHtml += `
                        <div class="section">
                            <h4>Warm-up</h4>
                            <ul>
                    `;
                    
                    // Add each warm-up exercise if data is valid
                    session.sections.warmup.forEach(exercise => {
                        if (exercise && exercise.name) {
                            sessionHtml += `<li>${exercise.name}${exercise.duration ? 
                                ` - ${exercise.duration}` : 
                                (exercise.sets && exercise.reps ? 
                                ` - ${exercise.sets} sets x ${exercise.reps} reps` : 
                                '')}</li>`;
                        }
                    });
                    
                    sessionHtml += `
                            </ul>
                        </div>
                    `;
                }
                
                // Main workout section with checks
                if (session.sections.main && Array.isArray(session.sections.main)) {
                    sessionHtml += `
                        <div class="section">
                            <h4>Main Workout</h4>
                            <ul>
                    `;
                    
                    // Add each main exercise if data is valid
                    session.sections.main.forEach(exercise => {
                        if (exercise && exercise.name) {
                            sessionHtml += `<li>${exercise.name}${exercise.sets ? 
                                ` - ${exercise.sets} sets x ` : 
                                ''}${exercise.reps ? 
                                `${exercise.reps} reps` : 
                                ''}${exercise.rest ? 
                                ` (Rest: ${exercise.rest})` : 
                                ''}</li>`;
                        }
                    });
                    
                    sessionHtml += `
                            </ul>
                        </div>
                    `;
                }
                
                // Circuit section with checks
                if (session.sections.circuit) {
                    sessionHtml += `
                        <div class="section">
                            <h4>Circuit Training</h4>
                            <p>${session.sections.circuit.rounds || 3} rounds with 
                               ${session.sections.circuit.rest_between_exercises || '30 seconds'} rest between exercises and 
                               ${session.sections.circuit.rest_between_rounds || '60 seconds'} between rounds</p>
                            <ul>
                    `;
                    
                    // Add each circuit exercise if available
                    if (session.sections.circuit.exercises && Array.isArray(session.sections.circuit.exercises)) {
                        session.sections.circuit.exercises.forEach(exercise => {
                            if (exercise && exercise.name) {
                                sessionHtml += `<li>${exercise.name}${exercise.reps ? 
                                    ` - ${exercise.reps} reps` : 
                                    ''}${exercise.time ? 
                                    ` or ${exercise.time}` : 
                                    ''}</li>`;
                            }
                        });
                    }
                    
                    sessionHtml += `
                            </ul>
                        </div>
                    `;
                }
                
                // Superset section with checks
                if (session.sections.superset && Array.isArray(session.sections.superset) && session.sections.superset.length > 0) {
                    sessionHtml += `
                        <div class="section">
                            <h4>Superset</h4>
                    `;
                    
                    // Add superset info if available
                    const superset = session.sections.superset[0];
                    if (superset) {
                        sessionHtml += `<p>${superset.rounds || 3} rounds</p>
                                      <ul>`;
                        
                        if (superset.exercises && Array.isArray(superset.exercises)) {
                            superset.exercises.forEach(exercise => {
                                if (exercise && exercise.name) {
                                    sessionHtml += `<li>${exercise.name}${exercise.sets ? 
                                        ` - ${exercise.sets} sets x ` : 
                                        ''}${exercise.reps ? 
                                        `${exercise.reps} reps` : 
                                        ''}${exercise.rest ? 
                                        ` (Rest: ${exercise.rest})` : 
                                        ''}</li>`;
                                }
                            });
                        }
                        
                        sessionHtml += `</ul>`;
                    }
                    
                    sessionHtml += `
                        </div>
                    `;
                }
                
                // Cool-down section with checks
                if (session.sections.cooldown && Array.isArray(session.sections.cooldown)) {
                    sessionHtml += `
                        <div class="section">
                            <h4>Cool-down</h4>
                            <ul>
                    `;
                    
                    // Add each cool-down exercise if data is valid
                    session.sections.cooldown.forEach(exercise => {
                        if (exercise && exercise.name) {
                            sessionHtml += `<li>${exercise.name}${exercise.duration ? 
                                ` - ${exercise.duration}` : 
                                ''}</li>`;
                        }
                    });
                    
                    sessionHtml += `
                            </ul>
                        </div>
                    `;
                }
                
                sessionElement.innerHTML = sessionHtml;
                sessionsContainer.appendChild(sessionElement);
            });
            
            // Show workout plan section
            workoutPlanSection.style.display = 'block';
            loadingOverlay.style.display = 'none';
            console.log('Workout plan displayed successfully');
        } catch (error) {
            console.error('Error displaying workout plan:', error);
            showError(`Failed to display workout plan: ${error.message}`);
            loadingOverlay.style.display = 'none';
        }
    };

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        
        // Show loading overlay
        loadingOverlay.style.display = 'flex';
        
        // Get form data
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            age: parseInt(formData.get('age')),
            gender: formData.get('gender'),
            goal: formData.get('goal'),
            experience: formData.get('experience'),
            equipment: Array.from(formData.getAll('equipment')),
            days_per_week: parseInt(formData.get('days_per_week'))
        };
        
        console.log('Submitting user data:', userData);
        
        try {
            // Make API call
            const response = await fetch('/api/generate-workout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            console.log('API response:', responseData);
            
            // Check if response was successful
            if (!responseData.success) {
                throw new Error(responseData.message || 'Failed to generate workout plan');
            }
            
            // Extract the workout plan from the data field
            const workoutPlan = responseData.data;
            
            // Display the workout plan
            displayWorkoutPlan(workoutPlan);
            
            // Store workout plan ID for export
            window.currentWorkoutPlanId = workoutPlan.id;
            
        } catch (error) {
            console.error('Error generating workout plan:', error);
            showError(`Failed to generate workout plan: ${error.message}`);
        }
    });

    // Handle export buttons
    document.getElementById('export-json').addEventListener('click', async () => {
        if (!window.currentWorkoutPlanId) {
            showError('No workout plan to export');
            return;
        }
        
        try {
            const response = await fetch(`/api/export-workout/${window.currentWorkoutPlanId}?format=json`);
            if (!response.ok) throw new Error('Export failed');
            
            const responseData = await response.json();
            
            // Check if response was successful
            if (!responseData.success) {
                throw new Error(responseData.message || 'Export failed');
            }
            
            // Convert the data to blob
            const blob = new Blob([JSON.stringify(responseData.data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'workout-plan.json';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to export workout plan');
        }
    });

    document.getElementById('export-pdf').addEventListener('click', async () => {
        if (!window.currentWorkoutPlanId) {
            showError('No workout plan to export');
            return;
        }
        
        try {
            const response = await fetch(`/api/export-workout/${window.currentWorkoutPlanId}?format=pdf`);
            if (!response.ok) throw new Error('Export failed');
            
            // PDF is returned directly as a blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'workout-plan.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to export workout plan');
        }
    });
});
