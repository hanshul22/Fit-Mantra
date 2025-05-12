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
        return input.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Format workout data
    const formatWorkoutData = (data) => {
        return {
            ...data,
            user: {
                ...data.user,
                goal: formatUserInput(data.user.goal),
                experience: formatUserInput(data.user.experience)
            },
            workoutSplit: formatUserInput(data.workoutSplit)
        };
    };

    // Display workout plan
    const displayWorkoutPlan = (workoutPlan) => {
        const formattedPlan = formatWorkoutData(workoutPlan);
        
        // Update user info
        document.getElementById('user-name').textContent = formattedPlan.user.name;
        document.getElementById('user-goal').textContent = formattedPlan.user.goal;
        document.getElementById('user-experience').textContent = formattedPlan.user.experience;
        document.getElementById('workout-split').textContent = formattedPlan.workoutSplit;
        
        // Clear existing sessions
        const sessionsContainer = document.getElementById('workout-sessions');
        sessionsContainer.innerHTML = '';
        
        // Add each session
        formattedPlan.sessions.forEach(session => {
            const sessionElement = document.createElement('div');
            sessionElement.className = 'workout-session';
            sessionElement.innerHTML = `
                <h3>Session ${session.session} - ${session.date}</h3>
                <p class="focus">Focus: ${formatUserInput(session.focus.primary)} + ${formatUserInput(session.focus.secondary)}</p>
                
                <div class="section">
                    <h4>Warm-up</h4>
                    <ul>
                        ${session.sections.warmup.map(exercise => `
                            <li>${exercise.name}${exercise.duration ? ` - ${exercise.duration}` : ` - ${exercise.sets} sets x ${exercise.reps} reps`}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="section">
                    <h4>Main Workout</h4>
                    <ul>
                        ${session.sections.main.map(exercise => `
                            <li>${exercise.name} - ${exercise.sets} sets x ${exercise.reps} reps (Rest: ${exercise.rest})</li>
                        `).join('')}
                    </ul>
                </div>
                
                ${session.sections.circuit ? `
                    <div class="section">
                        <h4>Circuit Training</h4>
                        <p>${session.sections.circuit.rounds} rounds with ${session.sections.circuit.rest_between_exercises} rest between exercises and ${session.sections.circuit.rest_between_rounds} between rounds</p>
                        <ul>
                            ${session.sections.circuit.exercises.map(exercise => `
                                <li>${exercise.name} - ${exercise.reps} reps</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${session.sections.superset ? `
                    <div class="section">
                        <h4>Superset</h4>
                        <p>${session.sections.superset[0].rounds} rounds</p>
                        <ul>
                            ${session.sections.superset[0].exercises.map(exercise => `
                                <li>${exercise.name} - ${exercise.sets} sets x ${exercise.reps} reps (Rest: ${exercise.rest})</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="section">
                    <h4>Cool-down</h4>
                    <ul>
                        ${session.sections.cooldown.map(exercise => `
                            <li>${exercise.name}${exercise.duration ? ` - ${exercise.duration}` : ''}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
            sessionsContainer.appendChild(sessionElement);
        });
        
        // Show workout plan section
        workoutPlanSection.style.display = 'block';
        loadingOverlay.style.display = 'none';
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
        
        try {
            // Make API call
            const response = await fetch('/api/generate-workout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const workoutPlan = await response.json();
            displayWorkoutPlan(workoutPlan);
            
            // Store workout plan ID for export
            window.currentWorkoutPlanId = workoutPlan.id;
            
        } catch (error) {
            console.error('Error:', error);
            showError('Failed to generate workout plan. Please try again.');
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
            
            const blob = await response.blob();
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
