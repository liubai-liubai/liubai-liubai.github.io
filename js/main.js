document.addEventListener('DOMContentLoaded', function() {
    // 导航栏滚动效果
    const navbar = document.querySelector('.navbar');
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // 更新激活的导航链接
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const navItems = document.querySelectorAll('.nav-links a');
        
        // 获取当前滚动位置
        const scrollPosition = window.scrollY + 100; // 添加偏移量以提前激活
        
        // 找到当前可见的区域
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // 移除所有导航链接的激活状态
                navItems.forEach(item => item.classList.remove('active'));
                
                // 为当前区域对应的导航链接添加激活状态
                const correspondingNavItem = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
                if (correspondingNavItem) {
                    correspondingNavItem.classList.add('active');
                }
            }
        });
        
        // 特殊处理首页
        if (scrollPosition < sections[0].offsetTop) {
            navItems.forEach(item => item.classList.remove('active'));
            document.querySelector('.nav-links a[href="#"]').classList.add('active');
        }
    }
    
    // 滚动时改变导航栏样式
    function handleScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        updateActiveNavLink();
    }
    
    // 移动端菜单切换
    if (mobileToggle) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // 点击导航链接时关闭移动菜单并更新激活状态
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // 移除所有激活状态
            navItems.forEach(link => link.classList.remove('active'));
            // 添加当前点击项的激活状态
            this.classList.add('active');
            
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                if (mobileToggle) mobileToggle.classList.remove('active');
            }
        });
    });
    
    // 平滑滚动到锚点
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 监听滚动事件
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始化导航栏状态
    
    // 监听滚动以初始化动画
    const animatedElements = document.querySelectorAll('.fade-in');
    
    function checkScroll() {
        const triggerBottom = window.innerHeight * 0.85;
        
        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.style.opacity = '1';
            }
        });
    }
    
    window.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    window.addEventListener('load', checkScroll);
    
    // 邮箱复制功能
    document.querySelectorAll('.copy-email').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const email = this.getAttribute('data-email');
            
            // 创建临时输入框
            const tempInput = document.createElement('input');
            tempInput.value = email;
            document.body.appendChild(tempInput);
            
            // 选择并复制文本
            tempInput.select();
            document.execCommand('copy');
            
            // 移除临时输入框
            document.body.removeChild(tempInput);
            
            // 显示提示
            alert('邮箱已复制到剪贴板！');
        });
    });
    
    // 更新页脚年份
    const yearElement = document.querySelector('.current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // 模拟内容加载完成后移除页面加载动画
    setTimeout(() => {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            loader.classList.add('loaded');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }, 500);

    // 回到顶部按钮
    const scrollToTop = document.querySelector('.scroll-to-top');
    const progressCircle = document.querySelector('.progress-ring-circle');
    const circumference = 2 * Math.PI * 20; // 2πr，r=20

    // 更新进度环
    function updateProgress() {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const progress = scrolled / windowHeight;
        
        // 更新圆环进度
        const offset = circumference - (progress * circumference);
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = offset;
        }
        
        // 显示/隐藏按钮
        if (scrolled > 300) {
            scrollToTop.classList.add('visible');
        } else {
            scrollToTop.classList.remove('visible');
        }
    }

    // 点击回到顶部
    if (scrollToTop) {
        scrollToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // 监听滚动事件
    window.addEventListener('scroll', updateProgress);
    updateProgress(); // 初始化进度
}); 