// ========== ПОИСКОВАЯ СИСТЕМА ==========
// Данные для поиска загружаются из файла search.js
// Переменная SEARCH_DATA определена в search.js

let searchData = [];

// Загружаем данные из search.js
function loadSearchData() {
    if (typeof SEARCH_DATA !== 'undefined') {
        searchData = SEARCH_DATA;
        console.log(`✅ Поиск загружен: ${searchData.length} страниц в индексе`);
    } else {
        console.warn('⚠️ Файл search.js не найден. Поиск не будет работать.');
        searchData = [];
    }
}

// Расширенный поиск с релевантностью
function performSearch(query) {
    if (!query || query.trim().length === 0) {
        searchResults.classList.remove('show');
        return [];
    }
    
    const lowerQuery = query.toLowerCase().trim();
    const searchWords = lowerQuery.split(/\s+/).filter(word => word.length > 0);
    
    // Вычисляем релевантность для каждой страницы
    const results = searchData.map(page => {
        let relevanceScore = 0;
        
        // Поиск в заголовке (высокий приоритет)
        if (page.title.toLowerCase().includes(lowerQuery)) {
            relevanceScore += 10;
        }
        
        // Проверка каждого слова в заголовке
        searchWords.forEach(word => {
            if (page.title.toLowerCase().includes(word)) {
                relevanceScore += 5;
            }
        });
        
        // Поиск в описании
        if (page.description.toLowerCase().includes(lowerQuery)) {
            relevanceScore += 3;
        }
        
        searchWords.forEach(word => {
            if (page.description.toLowerCase().includes(word)) {
                relevanceScore += 2;
            }
        });
        
        // Поиск в содержимом
        if (page.content.toLowerCase().includes(lowerQuery)) {
            relevanceScore += 2;
        }
        
        // Поиск по ключевым словам
        if (page.keywords) {
            page.keywords.forEach(keyword => {
                if (lowerQuery.includes(keyword) || keyword.includes(lowerQuery)) {
                    relevanceScore += 4;
                }
                searchWords.forEach(word => {
                    if (keyword.includes(word)) {
                        relevanceScore += 2;
                    }
                });
            });
        }
        
        return {
            ...page,
            relevanceScore: relevanceScore
        };
    });
    
    // Фильтруем только релевантные результаты
    const relevantResults = results.filter(r => r.relevanceScore > 0);
    
    // Сортируем по релевантности
    relevantResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Берём топ-5 результатов
    const topResults = relevantResults.slice(0, 5);
    
    // Отображаем результаты
    displaySearchResults(topResults, lowerQuery);
    
    return topResults;
}

// Подсветка совпадений в тексте
function highlightText(text, query) {
    if (!query || query.length === 0) return text;
    
    const words = query.split(/\s+/);
    let highlightedText = text;
    
    words.forEach(word => {
        if (word.length > 0) {
            const regex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<span class="search-result-highlight">$1</span>');
        }
    });
    
    return highlightedText;
}

// Отображение результатов поиска
function displaySearchResults(results, query) {
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">Ничего не найдено</div>';
        searchResults.classList.add('show');
        return;
    }
    
    const resultsHtml = results.map(result => {
        let preview = result.description || result.content.substring(0, 120);
        if (preview.length >= 120) preview += '...';
        
        // Показываем ключевые слова для контекста
        const keywordsPreview = result.keywords ? result.keywords.slice(0, 3).join(', ') : '';
        
        return `
            <div class="search-result-item" data-url="${result.url}" data-title="${result.title}">
                <div class="search-result-title">${highlightText(result.title, query)}</div>
                <div class="search-result-preview">${highlightText(preview, query)}</div>
                ${keywordsPreview ? `<div class="search-result-meta">📌 ${keywordsPreview}</div>` : ''}
            </div>
        `;
    }).join('');
    
    searchResults.innerHTML = resultsHtml;
    searchResults.classList.add('show');
    
    // Обработчики кликов
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const url = item.dataset.url;
            if (url) {
                window.location.href = url;
            }
        });
    });
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
let searchTimeout = null;

// Загружаем данные поиска при загрузке страницы
loadSearchData();

if (searchInput) {
    // Поиск при вводе (с задержкой для оптимизации)
    searchInput.addEventListener('input', (e) => {
        if (searchTimeout) clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 200);
    });
    
    // Закрытие результатов при клике вне
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('show');
        }
    });
    
    // Закрытие по Escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchResults.classList.remove('show');
            searchInput.blur();
        }
    });
}

// ========== МОБИЛЬНОЕ МЕНЮ ==========
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
    
    sidebar.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && window.innerWidth <= 800) {
            sidebar.classList.remove('open');
            if (toggleBtn) toggleBtn.textContent = '☰ Меню';
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

// ========== ССЫЛКИ НАВИГАЦИИ ==========
const mainPageLink = document.getElementById('mainPageLink');
if (mainPageLink) {
    mainPageLink.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'index.html';
    });
}

// Случайная статья (использует данные из search.js)
const randomPageLink = document.getElementById('randomPageLink');
if (randomPageLink) {
    randomPageLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (searchData.length > 0) {
            const randomIndex = Math.floor(Math.random() * searchData.length);
            const randomArticle = searchData[randomIndex];
            window.location.href = randomArticle.url;
        } else {
            alert('Нет доступных статей');
        }
    });
}

const recentChangesLink = document.getElementById('recentChangesLink');
if (recentChangesLink) {
    recentChangesLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Свежие правки (демо-режим)');
    });
}

// Логотип - переход на главную
const logo = document.getElementById('homeLogo');
if (logo) {
    logo.addEventListener('click', function() {
        window.location.href = 'index.html';
    });
}

// Выводим информацию о загруженном индексе в консоль
console.log('🔍 Поисковая система Infopedia готова к работе');
// ========== УНИВЕРСАЛЬНАЯ ЗАГРУЗКА МЕДИАФАЙЛОВ ==========

// Функция проверки существования файла на сервере
function fileExists(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            callback(xhr.status === 200);
        }
    };
    xhr.send();
}

// Автоматическая подстановка заглушек для отсутствующих изображений
function setupImageFallbacks() {
    document.querySelectorAll('.infobox-img').forEach(img => {
        img.addEventListener('error', function() {
            console.warn(`Изображение не найдено: ${this.src}`);
            // Если изображение не найдено, пробуем другие расширения
            const currentSrc = this.src;
            const extensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
            const currentExt = currentSrc.slice(currentSrc.lastIndexOf('.'));
            
            // Пробуем подставить другое расширение
            for (const ext of extensions) {
                if (ext !== currentExt) {
                    const newSrc = currentSrc.replace(currentExt, ext);
                    this.src = newSrc;
                    return;
                }
            }
            
            // Если ничего не подошло - ставим заглушку
            this.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"%3E%3Crect width="200" height="150" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EНет изображения%3C/text%3E%3C/svg%3E';
            this.style.opacity = '0.7';
        });
    });
}

// Автоматическая проверка аудиофайлов
function setupAudioFallbacks() {
    document.querySelectorAll('.infobox-audio-player').forEach(audio => {
        const sources = audio.querySelectorAll('source');
        let hasValidSource = false;
        
        sources.forEach(source => {
            const src = source.src;
            if (src && src !== '') {
                hasValidSource = true;
            }
        });
        
        if (!hasValidSource) {
            audio.style.display = 'none';
            const caption = audio.parentElement.querySelector('.infobox-audio-caption');
            if (caption) {
                caption.innerHTML += ' (аудиофайл не найден)';
                caption.style.color = '#d33';
            }
        }
    });
}

// Функция для динамической загрузки изображения по пути
function loadImage(imagePath, containerId, caption = '') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const img = document.createElement('img');
    img.src = imagePath;
    img.className = 'infobox-img infobox-img-single';
    img.alt = caption;
    
    img.onerror = () => {
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect width="200" height="150" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EИзображение не загружено%3C/text%3E%3C/svg%3E';
    };
    
    container.innerHTML = '';
    container.appendChild(img);
    
    if (caption) {
        const captionDiv = document.createElement('div');
        captionDiv.className = 'infobox-image-caption';
        captionDiv.textContent = caption;
        container.appendChild(captionDiv);
    }
}

// Вызываем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    setupImageFallbacks();
    setupAudioFallbacks();
    
    console.log('✅ Медиафайлы проверены');
});