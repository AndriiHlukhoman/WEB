let timer = {
    startTime: 0,
    elapsedTime: 0,
    timerInterval: null,
    isRunning: false,
    isPaused: false
};

let userData = {
    isLoggedIn: false,
    username: '',
    email: '',
    gender: '',
    birthdate: '',
    totalHours: 0,
    currentMonth: 0,
    activeProjects: 2,
    averageHours: 7
};

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimerDisplay() {
    const timerElement = document.querySelector('.timer_counter h1');
    if (timerElement) {
        if (timer.isRunning) {
            const currentTime = Date.now();
            const totalElapsed = timer.elapsedTime + (currentTime - timer.startTime);
            timerElement.textContent = formatTime(totalElapsed);
        } else {
            timerElement.textContent = formatTime(timer.elapsedTime);
        }
    }
}

function startTimer() {
    if (!timer.isRunning) {
        timer.startTime = Date.now();
        timer.isRunning = true;
        timer.isPaused = false;
        timer.timerInterval = setInterval(updateTimerDisplay, 1000);
        console.log('Таймер запущено');
        showNotification('Таймер запущено!', 'success');
    }
}

function pauseTimer() {
    if (timer.isRunning) {
        timer.elapsedTime += Date.now() - timer.startTime;
        timer.isRunning = false;
        timer.isPaused = true;
        clearInterval(timer.timerInterval);
        console.log('Таймер на паузі');
        showNotification('Таймер на паузі', 'warning');
    }
}

function stopTimer() {
    if (timer.isRunning || timer.isPaused) {
        if (timer.isRunning) {
            timer.elapsedTime += Date.now() - timer.startTime;
        }
        const sessionHours = timer.elapsedTime / (1000 * 60 * 60);
        userData.totalHours += sessionHours;
        userData.currentMonth += sessionHours;
        saveWorkSession();
        timer.startTime = 0;
        timer.elapsedTime = 0;
        timer.isRunning = false;
        timer.isPaused = false;
        clearInterval(timer.timerInterval);
        updateTimerDisplay();
        console.log(`Робочу сесію завершено. Відпрацьовано: ${formatTime(timer.elapsedTime)}`);
        showNotification(`Сесія завершена! Відпрацьовано: ${formatTime(timer.elapsedTime)}`, 'success');
    }
}

function saveWorkSession() {
    const selectedProject = document.querySelector('select[name="project"]')?.value || 'project1';
    const sessionData = {
        project: selectedProject,
        duration: timer.elapsedTime,
        date: new Date().toISOString(),
        formattedDuration: formatTime(timer.elapsedTime)
    };
    const sessions = JSON.parse(localStorage.getItem('workSessions') || '[]');
    sessions.push(sessionData);
    localStorage.setItem('workSessions', JSON.stringify(sessions));
    console.log('Робоча сесія збережена:', sessionData);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#4CAF50';
            break;
        case 'warning':
            notification.style.backgroundColor = '#FF9800';
            break;
        case 'error':
            notification.style.backgroundColor = '#F44336';
            break;
        default:
            notification.style.backgroundColor = '#2196F3';
    }
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function handleRegistration(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const username = formData.get('username');
    const email = formData.get('email');
    const gender = formData.get('gender');
    const birthdate = formData.get('birthdate');
    if (!username || !email || !birthdate) {
        showNotification('Будь ласка, заповніть всі обов\'язкові поля', 'error');
        return;
    }
    if (!email.includes('@')) {
        showNotification('Введіть правильний email адрес', 'error');
        return;
    }
    userData.username = username;
    userData.email = email;
    userData.gender = gender || 'не вказано';
    userData.birthdate = birthdate;
    userData.isLoggedIn = true;
    localStorage.setItem('userData', JSON.stringify(userData));
    showNotification('Реєстрація успішна! Перенаправлення...', 'success');
    setTimeout(() => {
        window.location.href = 'tracker.html';
    }, 2000);
}

function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const email = formData.get('email');
    const password = formData.get('password');
    if (!email || !password) {
        showNotification('Будь ласка, заповніть всі поля', 'error');
        return;
    }
    if (!email.includes('@')) {
        showNotification('Введіть правильний email адрес', 'error');
        return;
    }
    if (password.length < 6) {
        showNotification('Пароль повинен містити щонайменше 6 символів', 'error');
        return;
    }
    userData.email = email;
    userData.isLoggedIn = true;
    const savedData = localStorage.getItem('userData');
    if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.email === email) {
            userData = { ...userData, ...parsed };
        }
    }
    localStorage.setItem('userData', JSON.stringify(userData));
    showNotification('Вхід успішний! Перенаправлення...', 'success');
    setTimeout(() => {
        window.location.href = 'tracker.html';
    }, 2000);
}

function updateProfile() {
    const savedData = localStorage.getItem('userData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
    const profileTable = document.querySelector('.profile-table');
    if (profileTable) {
        const rows = profileTable.querySelectorAll('tr');
        if (rows.length >= 2 && userData.username) {
            rows[0].querySelector('td').textContent = userData.username;
        }
        if (rows.length >= 3 && userData.email) {
            rows[1].querySelector('td').textContent = userData.email;
        }
        if (rows.length >= 4) {
            rows[2].querySelector('td').textContent = Math.round(userData.currentMonth) + ' годин';
        }
    }
}

function initPage() {
    const currentPage = window.location.pathname.split('/').pop();
    const savedData = localStorage.getItem('userData');
    if (savedData) {
        userData = JSON.parse(savedData);
    }
    switch(currentPage) {
        case 'register.html':
            const registerForm = document.querySelector('form');
            if (registerForm) {
                registerForm.addEventListener('submit', handleRegistration);
            }
            break;
        case 'login.html':
            const loginForm = document.querySelector('form');
            if (loginForm) {
                loginForm.addEventListener('submit', handleLogin);
            }
            break;
        case 'tracker.html':
            const icons = document.querySelectorAll('.icon');
            if (icons.length >= 3) {
                icons[0].addEventListener('click', stopTimer);
                icons[1].addEventListener('click', startTimer);
                icons[2].addEventListener('click', pauseTimer);
            }
            updateTimerDisplay();
            break;
        case 'profile.html':
            updateProfile();
            break;
    }
}

function getWorkStatistics() {
    const sessions = JSON.parse(localStorage.getItem('workSessions') || '[]');
    return {
        totalSessions: sessions.length,
        totalTime: sessions.reduce((total, session) => total + session.duration, 0),
        todaysSessions: sessions.filter(session => {
            const sessionDate = new Date(session.date);
            const today = new Date();
            return sessionDate.toDateString() === today.toDateString();
        }).length
    };
}

function clearAllData() {
    localStorage.clear();
    userData = {
        isLoggedIn: false,
        username: '',
        email: '',
        gender: '',
        birthdate: '',
        totalHours: 0,
        currentMonth: 0,
        activeProjects: 2,
        averageHours: 7
    };
    showNotification('Всі дані очищено', 'info');
}

document.addEventListener('DOMContentLoaded', initPage);
console.log('JavaScript для трекера робочого часу завантажено');

window.timerControls = {
    start: startTimer,
    pause: pauseTimer,
    stop: stopTimer,
    getStats: getWorkStatistics,
    clearData: clearAllData
};
