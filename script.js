// v1.2.5 - 修复句子倒计时显示、设置窗口滚动和关闭按钮位置
document.addEventListener('DOMContentLoaded', function () {
    // ==================== 原有功能代码 ====================
    const generateBtn = document.getElementById('generate-btn');
    const linkBtn = document.getElementById('link-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const quoteElement = document.getElementById('quote');
    const currentTimeElement = document.getElementById('current-time');
    const countdownElement = document.getElementById('countdown');
    const countdownNumberElement = document.getElementById('countdown-number'); // 新增独立秒数显示
    const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.querySelector('.close');
    const settingsKeyInput = document.getElementById('settings-key');
    const jumpBtn1 = document.getElementById('jump-btn1');
    const jumpBtn2 = document.getElementById('jump-btn2');
    const colorToggle = document.getElementById('color-toggle');
    const quoteCountElement = document.getElementById('quote-count');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmClose = document.querySelector('.close-confirm');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');

    let countdownInterval;
    let countdownValue = 15;
    let typingInterval;
    let secretKey = 'fhy2025';

    // 原有事件监听
    generateBtn.addEventListener('click', fetchQuotes);
    linkBtn.addEventListener('click', () => confirmModal.style.display = 'block');
    confirmYesBtn.addEventListener('click', () => {
        window.open('https://www.wenjuan.com/s/UZBZJvJ0BR/', '_blank');
        confirmModal.style.display = 'none';
    });
    confirmNoBtn.addEventListener('click', () => confirmModal.style.display = 'none');
    confirmClose.addEventListener('click', () => confirmModal.style.display = 'none');
    settingsBtn.addEventListener('click', () => settingsModal.style.display = 'block');
    closeModal.addEventListener('click', () => settingsModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.style.display = 'none';
        if (e.target === confirmModal) confirmModal.style.display = 'none';
    });
    settingsKeyInput.addEventListener('input', () => secretKey = settingsKeyInput.value);
    colorToggle.addEventListener('change', () => {
        if (colorToggle.checked) linkBtn.classList.add('color-pulse');
        else linkBtn.classList.remove('color-pulse');
    });
    jumpBtn1.addEventListener('click', () => window.open('https://github.com/Fhy1024/echo_cave', '_blank'));
    jumpBtn2.addEventListener('click', () => window.open('https://fhy1234.dpdns.org/', '_blank'));

    // 原有功能函数
    function updateTime() {
        const now = new Date();
        currentTimeElement.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    }
    setInterval(updateTime, 1000);
    updateTime();

    async function fetchQuotes() {
        try {
            const response = await fetch('./encrypted-quotes.json');
            if (!response.ok) throw new Error(`HTTP 错误哦~状态码: ${response.status}`);
            const encryptedQuotes = await response.json();
            quoteCountElement.textContent = `（已收集 ${encryptedQuotes.length} 声`;
            const randomEncryptedQuote = encryptedQuotes[Math.floor(Math.random() * encryptedQuotes.length)];
            const decryptedQuote = decryptData(randomEncryptedQuote, secretKey);
            quoteElement.textContent = '';
            if (typingInterval) clearInterval(typingInterval);
            typeWriter(decryptedQuote);
            adjustFontSize(decryptedQuote);
            resetCountdown();
        } catch (error) {
            console.error('TAT加载失败:', error);
            quoteElement.textContent = '糟了，加载失败了...等一会再试试吧~';
        }
    }

    function decryptData(encryptedData, key) {
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedData, key);
            const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
            if (!decryptedText) throw new Error('解密结果怎么是空的?一定是出现了bug！');
            return decryptedText;
        } catch (error) {
            console.error('TwT解密失败:', error);
            return '一不小心加载失败了，快看看密钥对不对吧！';
        }
    }

    function typeWriter(text) {
        clearInterval(typingInterval);
        document.querySelector('.quote-container').classList.add('typing');
        let i = 0;
        typingInterval = setInterval(() => {
            if (i < text.length) {
                quoteElement.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typingInterval);
                setTimeout(() => {
                    document.querySelector('.quote-container').classList.remove('typing');
                }, 100);
            }
        }, 50);
    }

    // ==================== 新增功能 ====================
    // 动态调整字体大小
    function adjustFontSize(text) {
        const length = text.length;
        if (length < 20) {
            quoteElement.style.fontSize = '22px';
        } else if (length > 50) {
            quoteElement.style.fontSize = '16px';
        } else {
            quoteElement.style.fontSize = '18px';
        }
    }

    // 图片轮播相关元素
    const photoCountElement = document.getElementById('photo-count');
    const slidesWrapper = document.getElementById('slidesWrapper');
    const indicatorsContainer = document.getElementById('indicators');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    const galleryEffectSelect = document.getElementById('gallery-effect');
    const blurSlider = document.getElementById('blur-slider');
    const blurValue = document.getElementById('blur-value');
    
    // 进度条相关元素
    const galleryProgressContainer = document.getElementById('gallery-progress-container');
    const galleryProgressBar = document.getElementById('gallery-progress-bar');
    const quoteProgressContainer = document.getElementById('quote-progress-container');
    const quoteProgressBar = document.getElementById('quote-progress-bar');
    const galleryProgressToggle = document.getElementById('gallery-progress-toggle');
    const countdownDisplayType = document.getElementById('countdown-display-type');

    // 图片数据配置 - 改为从外部文件加载
    let galleryImages = [];

    // 画廊状态
    let currentSlideIndex = 0;
    let currentEffectName = 'random';
    let autoPlayInterval = null;
    let galleryProgressInterval = null;

    // 效果选择监听
    galleryEffectSelect.addEventListener('change', function() {
        currentEffectName = this.value;
        slidesWrapper.className = `slides-wrapper effect-${currentEffectName}`;
    });

    // 背景模糊控制 - 默认值5px
    const backgroundLayer = document.querySelector('.background-layer');
    backgroundLayer.style.filter = 'blur(5px)';
    blurSlider.addEventListener('input', function() {
        const blurAmount = this.value;
        blurValue.textContent = `${blurAmount}px`;
        backgroundLayer.style.filter = blurAmount > 0 ? `blur(${blurAmount}px)` : 'none';
    });

    // 图片进度条控制
    galleryProgressToggle.addEventListener('change', function() {
        if (this.checked) {
            galleryProgressContainer.style.display = 'block';
        } else {
            galleryProgressContainer.style.display = 'none';
        }
    });

    // 倒计时显示类型控制
    countdownDisplayType.addEventListener('change', function() {
        updateCountdownDisplay();
    });

    // 更新倒计时显示方式
    function updateCountdownDisplay() {
        const displayType = countdownDisplayType.value;
        if (displayType === 'progress') {
            quoteProgressContainer.style.display = 'block';
            countdownNumberElement.style.display = 'none';
        } else {
            quoteProgressContainer.style.display = 'none';
            countdownNumberElement.style.display = 'inline';
        }
    }

    // 从外部文件加载图片数据
    async function loadGalleryImages() {
        try {
            const response = await fetch('./gallery-images.json');
            if (!response.ok) throw new Error('无法加载图片数据');
            galleryImages = await response.json();
            photoCountElement.innerHTML = ` ${galleryImages.length} 像）`;
            initializeGallerySlides();
            startAutoPlay();
        } catch (error) {
            console.error('加载图片数据失败:', error);
            // 使用默认图片作为后备
            galleryImages = [
                { src: 'https://cdn.pixabay.com/photo/2021/10/11/04/08/university-6699377_1280.jpg', alt: '默认图片1' },
                { src: 'https://cdn.pixabay.com/photo/2018/05/13/15/06/road-3396764_1280.jpg', alt: '默认图片2' },
                { src: 'https://cdn.pixabay.com/photo/2017/09/26/04/28/classroom-2787754_1280.jpg', alt: '默认图片3' }
            ];
            photoCountElement.innerHTML = ` ${galleryImages.length} 像）`;
            initializeGallerySlides();
            startAutoPlay();
        }
    }

    // 初始化幻灯片
    function initializeGallerySlides() {
        slidesWrapper.innerHTML = '';
        indicatorsContainer.innerHTML = '';
        
        if (galleryImages.length === 0) {
            const placeholder = document.createElement('div');
            placeholder.className = 'slide active';
            placeholder.innerHTML = '<div class="image-placeholder">暂无图片<br>请检查图片数据文件</div>';
            slidesWrapper.appendChild(placeholder);
            return;
        }
        
        galleryImages.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;
            
            // 创建图片容器，确保图片适应容器
            const imgContainer = document.createElement('div');
            imgContainer.className = 'image-container';
            
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt;
            img.onload = function() {
                // 图片加载完成后，确保适应容器
                this.style.maxWidth = '100%';
                this.style.maxHeight = '100%';
                this.style.objectFit = 'contain';
            };
            img.onerror = function() {
                slide.innerHTML = '<div class="image-placeholder">图片无法加载<br>请检查路径</div>';
            };
            
            imgContainer.appendChild(img);
            slide.appendChild(imgContainer);
            slidesWrapper.appendChild(slide);
            
            const indicator = document.createElement('div');
            indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicator.onclick = () => goToSlide(index);
            indicatorsContainer.appendChild(indicator);
        });
        
        currentSlideIndex = 0;
        updateGalleryNavButtons();
        scrollToActiveIndicator();
    }

    // 导航功能 - 修复：实现循环切换
    function navigateSlide(direction) {
        if (galleryImages.length <= 1) return;
        
        const slides = document.querySelectorAll('.slide');
        const indicators = document.querySelectorAll('.indicator');
        
        let effectToUse = currentEffectName;
        if (currentEffectName === 'random') {
            const effects = ['fade', 'slide', 'zoom', 'rotate', 'flip'];
            effectToUse = effects[Math.floor(Math.random() * effects.length)];
            slidesWrapper.className = `slides-wrapper effect-${effectToUse}`;
        }
        
        slides[currentSlideIndex].classList.remove('active');
        indicators[currentSlideIndex].classList.remove('active');
        
        if (direction === 1 && effectToUse === 'slide') {
            slides[currentSlideIndex].classList.add('prev');
        }
        
        // 修复：实现循环切换
        if (direction === 1) {
            currentSlideIndex = (currentSlideIndex + 1) % galleryImages.length;
        } else {
            currentSlideIndex = (currentSlideIndex - 1 + galleryImages.length) % galleryImages.length;
        }
        
        setTimeout(() => {
            slides[currentSlideIndex].classList.add('active');
            indicators[currentSlideIndex].classList.add('active');
            slides.forEach(slide => slide.classList.remove('prev'));
            
            // 滚动到当前激活的指示器
            scrollToActiveIndicator();
            
            // 重置自动播放计时
            resetAutoPlay();
        }, 50);
        
        updateGalleryNavButtons();
    }

    prevBtn.addEventListener('click', () => navigateSlide(-1));
    nextBtn.addEventListener('click', () => navigateSlide(1));

    // 跳转到指定幻灯片
    window.goToSlide = function(index) {
        const slides = document.querySelectorAll('.slide');
        const indicators = document.querySelectorAll('.indicator');
        
        slides[currentSlideIndex].classList.remove('active');
        indicators[currentSlideIndex].classList.remove('active');
        
        currentSlideIndex = index;
        
        setTimeout(() => {
            slides[currentSlideIndex].classList.add('active');
            indicators[currentSlideIndex].classList.add('active');
            
            // 滚动到当前激活的指示器
            scrollToActiveIndicator();
            
            // 重置自动播放计时
            resetAutoPlay();
        }, 50);
        
        updateGalleryNavButtons();
    }

    // 更新导航按钮状态 - 修复：移除禁用状态，允许循环切换
    function updateGalleryNavButtons() {
        if (galleryImages.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
            // 修复：移除禁用状态，允许循环切换
            prevBtn.disabled = false;
            nextBtn.disabled = false;
        }
    }

    // 滚动到当前激活的指示器
    function scrollToActiveIndicator() {
        const activeIndicator = document.querySelector('.indicator.active');
        if (activeIndicator) {
            // 使用scrollIntoView使当前激活的指示器居中
            activeIndicator.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    }

    // 图片进度条动画
    function startGalleryProgress() {
        // 重置进度条
        galleryProgressBar.style.transition = 'none';
        galleryProgressBar.style.width = '0%';
        
        // 强制重绘
        galleryProgressBar.offsetHeight;
        
        // 开始动画
        galleryProgressBar.style.transition = 'width 4s linear';
        galleryProgressBar.style.width = '100%';
    }

    function stopGalleryProgress() {
        galleryProgressBar.style.transition = 'none';
        galleryProgressBar.style.width = '0%';
    }

    // 重置自动播放 - 修复：手动切换后重置计时
    function resetAutoPlay() {
        stopAutoPlay();
        startAutoPlay();
    }

    // 自动播放
    function startAutoPlay() {
        if (galleryImages.length <= 1) return;
        
        stopAutoPlay();
        
        // 启动图片进度条
        if (galleryProgressToggle.checked) {
            startGalleryProgress();
        }
        
        autoPlayInterval = setInterval(() => {
            navigateSlide(1);
        }, 4000);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
        stopGalleryProgress();
    }

    // 句子倒计时功能 - 修复：同时更新两个倒计时显示
    function startCountdown() {
        countdownValue = 15;
        countdownElement.textContent = `${countdownValue}`;
        countdownNumberElement.textContent = `${countdownValue}`;
        countdownInterval = setInterval(() => {
            countdownValue--;
            if (countdownValue <= 0) {
                clearInterval(countdownInterval);
                countdownElement.textContent = '...';
                countdownNumberElement.textContent = '...';
                fetchQuotes();
            } else {
                countdownElement.textContent = `${countdownValue}`;
                countdownNumberElement.textContent = `${countdownValue}`;
                
                // 更新句子进度条
                if (countdownDisplayType.value === 'progress') {
                    const progress = (15 - countdownValue) / 15 * 100;
                    quoteProgressBar.style.width = `${progress}%`;
                }
            }
        }, 1000);
    }

    function resetCountdown() {
        clearInterval(countdownInterval);
        
        // 重置句子进度条
        quoteProgressBar.style.width = '0%';
        
        startCountdown();
    }

    // 触摸滑动支持
    let touchStartX = 0;
    slidesWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    slidesWrapper.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? navigateSlide(1) : navigateSlide(-1);
        }
    });

    // 鼠标悬停暂停
    slidesWrapper.addEventListener('mouseenter', stopAutoPlay);
    slidesWrapper.addEventListener('mouseleave', startAutoPlay);
    
    // ==================== 修复：页面加载完成后自动初始化 ====================
    // 初始化加载第一条句子
    fetchQuotes();
    
    // 加载图片数据并初始化轮播
    loadGalleryImages();
    
    // 初始化投稿按钮颜色效果
    if (colorToggle.checked) {
        linkBtn.classList.add('color-pulse');
    }
    
    // 初始化倒计时显示方式
    updateCountdownDisplay();
});