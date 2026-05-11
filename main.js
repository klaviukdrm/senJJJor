// Очищаємо URL від "index.html", якщо він там є
const cleanPath = window.location.pathname.replace(/index\.html$/, '');

// Використовуємо хеш-роутинг, щоб сторінка не ламалася при перезавантаженні
if (!window.location.hash || window.location.hash === '#') {
    history.replaceState(null, null, cleanPath + '#information');
}

function setLang(lang) {
    // Меняем язык документа, что автоматически скрывает/показывает нужный текст через CSS
    document.documentElement.lang = lang;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
}

// Логика виджета оценки (Emoji Rating)
const emojiBtns = document.querySelectorAll('.emoji-btn');
const ratingLabels = document.querySelectorAll('.rating-label');
let currentRating = 0;
let ratingLocked = false; // Прапорець, що блокує зміну після першого кліку

function updateRatingUI(value) {
    // Подсвечиваем только выбранный эмодзи
    emojiBtns.forEach((btn) => {
        btn.classList.toggle('active', parseInt(btn.dataset.value) === value);
    });

    // Обновляем текст с красивым blur-эффектом
    ratingLabels.forEach(label => {
        label.classList.toggle('active', parseInt(label.dataset.state) === value);
    });
}

// Відновлюємо оцінку з пам'яті браузера (якщо користувач вже голосував)
const savedRating = localStorage.getItem('userRating');
if (savedRating) {
    currentRating = parseInt(savedRating);
    ratingLocked = true; // Блокуємо зміну
    updateRatingUI(currentRating); // Підсвічуємо збережений смайлик
    document.querySelector('.emoji-container').classList.add('locked'); // Вмикаємо ефекти заблокованого віджета
}

emojiBtns.forEach(btn => {
    const val = parseInt(btn.dataset.value);
    btn.addEventListener('mouseenter', () => {
        if (!ratingLocked) { // Дозволяємо підсвічування лише якщо оцінка ще не вибрана
            updateRatingUI(val);
        }
    });
    btn.addEventListener('mouseleave', () => {
        if (!ratingLocked) { // Повертаємо до поточного вибраного стану (або 0, якщо нічого не вибрано)
            updateRatingUI(currentRating);
        }
    });
    btn.addEventListener('click', () => {
        if (!ratingLocked) {
            currentRating = val; // Зберігаємо вибір
            ratingLocked = true; // Блокуємо подальші зміни
            updateRatingUI(currentRating); // Оновлюємо інтерфейс, щоб показати фінальний вибір

            // Зберігаємо вибір у локальне сховище браузера на майбутнє
            localStorage.setItem('userRating', currentRating);

            // Додаємо клас "locked" до контейнера, щоб увімкнути світіння та згасання інших
            document.querySelector('.emoji-container').classList.add('locked');

            // Показуємо спливаюче повідомлення
            const toast = document.getElementById('toast');
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
    });
});

// Логика кастомного курсора (заменяет React useMotionValue)
if (window.matchMedia("(pointer: fine)").matches) {
    const customCursor = document.getElementById('custom-cursor');
    const cursorFollow = document.getElementById('cursor-follow');
    let isHovering = false;
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        
        customCursor.style.opacity = '1';
        if (isHovering) {
            cursorFollow.style.opacity = '1';
        } else {
            cursorFollow.style.opacity = '0';
        }
        
        // Позиционируем главный курсор точно в мышь (со смещением до кончика SVG)
        customCursor.style.transform = `translate(${x - 2}px, ${y - 4}px)`;
        // Бейдж следует за мышью с отступом (bottom-right offset)
        cursorFollow.style.transform = `translate(${x + 16}px, ${y + 16}px)`;
    });

    // Прячем курсор, если мышь ушла за пределы окна браузера
    document.addEventListener('mouseleave', () => {
        customCursor.style.opacity = '0';
        cursorFollow.style.opacity = '0';
    });

    // Логика появления бейджа с текстом
    document.querySelectorAll('[data-cursor-uk]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            isHovering = true;
            cursorFollow.innerHTML = `<span class="lang-uk">${el.dataset.cursorUk}</span><span class="lang-en">${el.dataset.cursorEn}</span>`;
            cursorFollow.style.opacity = '1';
        });
        el.addEventListener('mouseleave', () => {
            isHovering = false;
            cursorFollow.style.opacity = '0';
        });
    });
}
