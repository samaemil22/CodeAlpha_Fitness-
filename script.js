// Fitness Tracker App - Complete with localStorage

// Data structure
let workouts = [];
let currentFilter = 'all';

// DOM Elements
const totalStepsEl = document.getElementById('totalSteps');
const totalCaloriesEl = document.getElementById('totalCalories');
const totalWorkoutsEl = document.getElementById('totalWorkouts');
const activeDaysEl = document.getElementById('activeDays');
const progressBarsEl = document.getElementById('progressBars');
const workoutListEl = document.getElementById('workoutList');
const exerciseType = document.getElementById('exerciseType');
const duration = document.getElementById('duration');
const calories = document.getElementById('calories');
const steps = document.getElementById('steps');
const workoutDate = document.getElementById('workoutDate');
const addBtn = document.getElementById('addWorkoutBtn');
const clearBtn = document.getElementById('clearDataBtn');

// Load data from localStorage
function loadData() {
    const saved = localStorage.getItem('fitnessData');
    if (saved) {
        try {
            workouts = JSON.parse(saved);
        } catch (e) {
            workouts = [];
        }
    } else {
        // Add sample data for demo
        workouts = getSampleData();
        saveData();
    }
    updateAll();
}

// Get sample data
function getSampleData() {
    const today = new Date();
    const data = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        data.push({
            id: Date.now() + i,
            type: ['Walking', 'Running', 'Cycling', 'Yoga', 'Weight Training'][i % 5],
            duration: 20 + (i * 5),
            calories: 100 + (i * 30),
            steps: 2000 + (i * 800),
            date: dateStr
        });
    }
    return data;
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('fitnessData', JSON.stringify(workouts));
}

// Generate unique ID
function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Get today's date string
function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

// Set default date to today
function setDefaultDate() {
    workoutDate.value = getTodayString();
}

// Add workout
function addWorkout() {
    const type = exerciseType.value;
    const durationVal = parseInt(duration.value);
    const caloriesVal = parseInt(calories.value);
    const stepsVal = parseInt(steps.value) || 0;
    const date = workoutDate.value || getTodayString();

    // Validation
    if (!durationVal || durationVal <= 0) {
        alert('⚠️ Please enter a valid duration!');
        duration.focus();
        return;
    }

    if (!caloriesVal || caloriesVal <= 0) {
        alert('⚠️ Please enter calories burned!');
        calories.focus();
        return;
    }

    const workout = {
        id: generateId(),
        type: type,
        duration: durationVal,
        calories: caloriesVal,
        steps: stepsVal,
        date: date
    };

    workouts.push(workout);
    saveData();
    updateAll();

    // Clear inputs (keep type and date)
    duration.value = '';
    calories.value = '';
    steps.value = '';
    duration.focus();

    // Show success feedback
    showNotification('✅ Workout logged successfully!');
}

// Delete workout
function deleteWorkout(id) {
    if (!confirm('Delete this workout entry?')) return;
    workouts = workouts.filter(w => w.id !== id);
    saveData();
    updateAll();
    showNotification('🗑️ Workout deleted');
}

// Get unique dates
function getUniqueDates() {
    const dates = new Set(workouts.map(w => w.date));
    return Array.from(dates);
}

// Calculate stats
function calculateStats() {
    const totalSteps = workouts.reduce((sum, w) => sum + (w.steps || 0), 0);
    const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
    const totalWorkouts = workouts.length;
    const activeDays = getUniqueDates().length;

    return { totalSteps, totalCalories, totalWorkouts, activeDays };
}

// Get workouts by day (last 7 days)
function getWeeklyData() {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        const dayWorkouts = workouts.filter(w => w.date === dateStr);
        const totalCalories = dayWorkouts.reduce((sum, w) => sum + w.calories, 0);
        
        weekData.push({
            date: dateStr,
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
            calories: totalCalories,
            count: dayWorkouts.length
        });
    }
    return weekData;
}

// Update dashboard
function updateDashboard() {
    const stats = calculateStats();
    totalStepsEl.textContent = stats.totalSteps.toLocaleString();
    totalCaloriesEl.textContent = stats.totalCalories.toLocaleString();
    totalWorkoutsEl.textContent = stats.totalWorkouts;
    activeDaysEl.textContent = stats.activeDays;
}

// Update progress bars
function updateProgress() {
    const weekData = getWeeklyData();
    const maxCalories = Math.max(...weekData.map(d => d.calories), 100);

    progressBarsEl.innerHTML = weekData.map(data => {
        const percentage = maxCalories > 0 ? (data.calories / maxCalories * 100) : 0;
        return `
            <div class="progress-item">
                <span class="day-label">${data.day}</span>
                <div class="bar-wrapper">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
                <span class="bar-value">${data.calories} cal</span>
            </div>
        `;
    }).join('');
}

// Update workout list
function updateWorkoutList() {
    let filtered = workouts;
    if (currentFilter !== 'all') {
        filtered = workouts.filter(w => w.type === currentFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

    if (filtered.length === 0) {
        workoutListEl.innerHTML = `
            <div class="empty-message">
                ${workouts.length === 0 ? 'No workouts logged yet. Start tracking today! 🏃' : 'No workouts found for this filter.'}
            </div>
        `;
        return;
    }

    workoutListEl.innerHTML = filtered.map(w => `
        <div class="workout-item">
            <div class="workout-info">
                <span class="workout-type">${getEmoji(w.type)} ${w.type}</span>
                <span class="workout-details">
                    ⏱️ ${w.duration} min · 🔥 ${w.calories} cal
                    ${w.steps ? `· 🚶 ${w.steps.toLocaleString()} steps` : ''}
                    · 📅 ${formatDate(w.date)}
                </span>
            </div>
            <div class="workout-actions">
                <button class="delete-workout" onclick="deleteWorkout(${w.id})" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Get emoji for exercise type
function getEmoji(type) {
    const emojis = {
        'Walking': '🚶',
        'Running': '🏃',
        'Cycling': '🚴',
        'Swimming': '🏊',
        'Yoga': '🧘',
        'Weight Training': '🏋️',
        'Dancing': '💃',
        'Other': '📝'
    };
    return emojis[type] || '📝';
}

// Format date
function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Update all UI
function updateAll() {
    updateDashboard();
    updateProgress();
    updateWorkoutList();
}

// Show notification
function showNotification(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        color: '#fff',
        padding: '12px 30px',
        borderRadius: '50px',
        fontSize: '0.95rem',
        zIndex: '1000',
        opacity: '0',
        transition: 'all 0.4s ease',
        border: '1px solid rgba(255,255,255,0.08)'
    });
    document.body.appendChild(toast);

    setTimeout(() => { toast.style.opacity = '1'; }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 2500);
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.dataset.filter;
        updateWorkoutList();
    });
});

// Clear all data
clearBtn.addEventListener('click', function() {
    if (!confirm('⚠️ Delete ALL workout data? This cannot be undone!')) return;
    workouts = [];
    saveData();
    updateAll();
    showNotification('🗑️ All data cleared');
});

// Add workout event
addBtn.addEventListener('click', addWorkout);

// Enter key support
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        addWorkout();
    }
});

// Initialize
setDefaultDate();
loadData();
console.log('💪 Fitness Tracker Loaded!');
console.log(`📊 ${workouts.length} workouts tracked`);