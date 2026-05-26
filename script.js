// Мобильное меню (открыть/закрыть сайдбар)
const toggleBtn = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');

if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        sidebar.classList.toggle('open');
        
        if (sidebar.classList.contains('open')) {
            toggleBtn.textContent = '✖ Закрыть';
        } else {
            toggleBtn.textContent = '☰ Меню';
        }
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth > 800) {
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (toggleBtn) toggleBtn.textContent = '☰ Меню';
            }
        }
    });
}

// Ссылка на заглавную страницу
const mainPageLink = document.getElementById('mainPageLink');
if (mainPageLink) {
    mainPageLink.addEventListener('click', function(e) {
        // Переход на index.html (это и есть главная)
        window.location.href = 'index.html';
    });
}

// Клик по логотипу — переход на главную
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
}