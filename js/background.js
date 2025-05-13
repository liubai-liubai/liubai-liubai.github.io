document.addEventListener('DOMContentLoaded', function() {
    // 主Canvas对象
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');
    const debugElement = document.getElementById('debug');
    
    // 初始化动画标志
    let animationStarted = false;
    
    // 调整Canvas大小
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // 初始化时也需要调整粒子和波形点的位置
        if (particles) {
            particles.forEach(p => {
                // 保持粒子在画布内
                p.x = Math.min(Math.max(p.x, 0), canvas.width);
                p.y = Math.min(Math.max(p.y, 0), canvas.height);
            });
        }
        
        if (wavePoints) {
            generateWavePoints();
        }
        
        // 重新生成颜色梯度
        generateColorGradient();
    }
    
    // 监听窗口大小变化
    window.addEventListener('resize', resizeCanvas);
    
    // 颜色主题
    const colorTheme = {
        backgroundStart: '#0a1128',
        backgroundEnd: '#16193b',
        particleColors: ['#73defe', '#5e60ce', '#4ea8de', '#5c64e3', '#3e7ac0'],
        waveColorStart: 'rgba(115, 222, 254, 0.2)',
        waveColorEnd: 'rgba(94, 96, 206, 0.05)'
    };
    
    // 生成颜色梯度
    let backgroundGradient;
    function generateColorGradient() {
        backgroundGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        backgroundGradient.addColorStop(0, colorTheme.backgroundStart);
        backgroundGradient.addColorStop(1, colorTheme.backgroundEnd);
    }
    
    // 粒子系统
    const particleCount = 80;
    let particles = [];
    let animationFrameId = null;
    
    // 生成粒子
    function createParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            // 确保每个粒子都有一个明确的速度
            const xVel = (Math.random() - 0.5) * 1.0; // 增大初始速度
            const yVel = (Math.random() - 0.5) * 1.0;
            
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 3 + 1,
                color: colorTheme.particleColors[Math.floor(Math.random() * colorTheme.particleColors.length)],
                xVelocity: xVel, 
                yVelocity: yVel,
                alpha: Math.random() * 0.5 + 0.5,
                pulseSpeed: Math.random() * 0.02 + 0.01,
                pulseDirection: Math.random() > 0.5 ? 1 : -1,
                connections: [],
                lastMoved: Date.now() // 跟踪上次移动时间
            });
        }
        
        console.log("已创建", particles.length, "个粒子");
    }
    
    // 连接附近的粒子
    function connectParticles() {
        const maxDistance = 120; // 减小最大连接距离
        
        // 清空之前的连接
        particles.forEach(p => p.connections = []);
        
        // 寻找邻近粒子
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    // 只有当两个粒子距离适中时才连接
                    // 太近或太远都不连接
                    if (distance > 15) { // 增加最小连接距离
                        particles[i].connections.push({
                            particle: particles[j],
                            distance: distance,
                            alpha: 1 - (distance / maxDistance)
                        });
                    }
                }
            }
        }
        
        // 限制每个粒子的连接数量，避免形成网状结构
        const maxConnections = 3; // 每个粒子最多3个连接
        particles.forEach(p => {
            if (p.connections.length > maxConnections) {
                // 根据alpha值(距离)排序连接，保留较近的连接
                p.connections.sort((a, b) => b.alpha - a.alpha);
                p.connections = p.connections.slice(0, maxConnections);
            }
        });
    }
    
    // 波形系统
    const waveConfig = {
        pointCount: 10,
        amplitude: 20,
        frequency: 0.02,
        speed: 0.03
    };
    
    let wavePoints = [];
    let ripples = [];
    
    // 生成波形点
    function generateWavePoints() {
        wavePoints = [];
        
        // 生成水平波形
        for (let i = 0; i <= waveConfig.pointCount; i++) {
            const x = canvas.width * i / waveConfig.pointCount;
            
            wavePoints.push({
                x: x,
                y: canvas.height * 0.5,
                originalY: canvas.height * 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    // 创建波纹
    function createRipple(x, y, strength = 1) {
        ripples.push({
            x: x,
            y: y,
            size: 0,
            maxSize: Math.min(canvas.width, canvas.height) * 0.5,
            strength: strength,
            alpha: 1
        });
    }
    
    // 交互 - 鼠标移动只影响粒子，不生成波纹
    let mouseX = 0, mouseY = 0, mouseActive = false;
    
    // 添加鼠标移动事件监听
    document.addEventListener('mousemove', e => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        mouseActive = true;
        
        // 移除波纹生成功能
        // 仅保留粒子交互效果
    });
    
    // 只在点击时生成波纹（保留这个交互）
    document.addEventListener('click', e => {
        createRipple(e.clientX, e.clientY, 5);
    });
    
    canvas.addEventListener('mouseout', () => {
        mouseActive = false;
    });
    
    // 调试辅助 - 在屏幕上显示粒子速度
    function logParticleDebug() {
        if(particles.length > 0) {
            const avgXVel = particles.reduce((sum, p) => sum + Math.abs(p.xVelocity), 0) / particles.length;
            const avgYVel = particles.reduce((sum, p) => sum + Math.abs(p.yVelocity), 0) / particles.length;
            console.log(`平均X速度: ${avgXVel.toFixed(4)}, 平均Y速度: ${avgYVel.toFixed(4)}`);
            
            // 检查是否有静止粒子
            const stuckParticles = particles.filter(p => 
                Math.abs(p.xVelocity) < 0.001 && Math.abs(p.yVelocity) < 0.001
            );
            console.log(`静止粒子数量: ${stuckParticles.length}/${particles.length}`);
        }
    }
    
    // 更新所有效果
    function update(deltaTime) {
        // 确保有时间增量
        const timeScale = deltaTime / 16; // 基于16ms标准帧
        
        // 更新粒子
        particles.forEach(p => {
            // 添加随机扰动，确保粒子不会完全静止
            p.xVelocity += (Math.random() - 0.5) * 0.03 * timeScale;
            p.yVelocity += (Math.random() - 0.5) * 0.03 * timeScale;
            
            // 限制速度但确保最小速度
            const minSpeed = 0.05; // 最小速度阈值
            const maxSpeed = 1.5;  // 最大速度阈值
            
            // 计算当前速度大小
            const currentSpeed = Math.sqrt(p.xVelocity * p.xVelocity + p.yVelocity * p.yVelocity);
            
            // 如果速度太小，增加速度
            if (currentSpeed < minSpeed) {
                // 随机一个新方向
                const angle = Math.random() * Math.PI * 2;
                p.xVelocity = Math.cos(angle) * minSpeed;
                p.yVelocity = Math.sin(angle) * minSpeed;
            } 
            // 如果速度太大，降低速度
            else if (currentSpeed > maxSpeed) {
                p.xVelocity = (p.xVelocity / currentSpeed) * maxSpeed;
                p.yVelocity = (p.yVelocity / currentSpeed) * maxSpeed;
            }
            
            // 鼠标对粒子的影响 - 保留这个交互效果
            if (mouseActive) {
                const dx = p.x - mouseX;
                const dy = p.y - mouseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) * 0.001 * timeScale;
                    p.xVelocity += dx * force;
                    p.yVelocity += dy * force;
                }
            }
            
            // 应用速度更新位置
            p.x += p.xVelocity * timeScale;
            p.y += p.yVelocity * timeScale;
            
            // 边界检查 - 环绕效果
            if (p.x < -50) p.x = canvas.width + 50;
            if (p.x > canvas.width + 50) p.x = -50;
            if (p.y < -50) p.y = canvas.height + 50;
            if (p.y > canvas.height + 50) p.y = -50;
            
            // 呼吸效果
            p.alpha += p.pulseSpeed * p.pulseDirection * timeScale;
            if (p.alpha >= 1) {
                p.alpha = 1;
                p.pulseDirection = -1;
            } else if (p.alpha <= 0.5) {
                p.alpha = 0.5;
                p.pulseDirection = 1;
            }
            
            // 更新移动时间戳
            p.lastMoved = Date.now();
        });
        
        // 定期重新计算粒子间连接 (每300ms左右)
        if (Math.random() < 0.05 * timeScale) {
            connectParticles();
        }
        
        // 周期性地记录粒子调试信息
        if (Math.random() < 0.01) {
            logParticleDebug();
        }
        
        // 更新波形点
        for (let i = 0; i < wavePoints.length; i++) {
            const point = wavePoints[i];
            
            // 基础波形运动
            point.phase += waveConfig.speed * timeScale;
            point.y = point.originalY + Math.sin(point.phase) * waveConfig.amplitude;
            
            // 波纹对波形点的影响
            ripples.forEach(ripple => {
                const dx = point.x - ripple.x;
                const dy = point.originalY - ripple.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 计算波纹效应
                if (distance < ripple.size && distance > ripple.size - 60) {
                    const impact = Math.sin((ripple.size - distance) / 60 * Math.PI) * ripple.strength * ripple.alpha;
                    point.y += impact * 20;
                }
            });
        }
        
        // 更新波纹
        for (let i = ripples.length - 1; i >= 0; i--) {
            const ripple = ripples[i];
            ripple.size += 2.5 * timeScale;
            ripple.alpha -= 0.01 * timeScale;
            
            if (ripple.alpha <= 0 || ripple.size > ripple.maxSize) {
                ripples.splice(i, 1);
            }
        }
        
        // 检查并修复任何距离过远的连接
        const screenDiagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
        let longConnectionsFound = false;
        
        particles.forEach(p => {
            for (let i = p.connections.length - 1; i >= 0; i--) {
                const conn = p.connections[i];
                const distX = p.x - conn.particle.x;
                const distY = p.y - conn.particle.y;
                const dist = Math.sqrt(distX * distX + distY * distY);
                
                // 如果发现距离超过屏幕对角线的一半，移除连接
                if (dist > screenDiagonal * 0.25) {
                    p.connections.splice(i, 1);
                    longConnectionsFound = true;
                }
            }
        });
        
        // 如果发现长连接，立即重新计算所有连接
        if (longConnectionsFound) {
            connectParticles();
        }
    }
    
    // 渲染所有效果
    function render() {
        // 绘制背景
        ctx.fillStyle = backgroundGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制粒子连接线
        particles.forEach(particle => {
            particle.connections.forEach(connection => {
                // 检查连接的粒子是否在画布可见区域附近
                // 防止绘制超长线条
                const otherParticle = connection.particle;
                if (otherParticle.x < -100 || otherParticle.x > canvas.width + 100 ||
                    otherParticle.y < -100 || otherParticle.y > canvas.height + 100) {
                    return; // 跳过不在可见区域的连接
                }
                
                const gradient = ctx.createLinearGradient(
                    particle.x, particle.y,
                    connection.particle.x, connection.particle.y
                );
                
                // 获取粒子原始颜色的RGB值
                const color1 = particle.color;
                const color2 = connection.particle.color;
                
                // 降低连接线的不透明度，使其更加柔和
                const alpha = connection.alpha * 0.4; // 减小透明度，使线条不那么突出
                
                gradient.addColorStop(0, color1.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
                gradient.addColorStop(1, color2.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
                
                ctx.beginPath();
                ctx.strokeStyle = gradient;
                // 减小线条宽度
                ctx.lineWidth = connection.alpha * 1.0; // 从1.5减小到1.0
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(connection.particle.x, connection.particle.y);
                ctx.stroke();
            });
        });
        
        // 绘制粒子
        particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color.replace(')', `, ${p.alpha})`).replace('rgb', 'rgba');
            ctx.fill();
            
            // 添加光晕效果
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3);
            glow.addColorStop(0, p.color.replace(')', ', 0.3)').replace('rgb', 'rgba'));
            glow.addColorStop(1, p.color.replace(')', ', 0)').replace('rgb', 'rgba'));
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();
        });
        
        // 绘制波形
        if (wavePoints.length > 1) {
            for (let j = 0; j < 2; j++) { // 绘制多层波形
                ctx.beginPath();
                
                const waveGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
                waveGradient.addColorStop(0, j === 0 ? colorTheme.waveColorStart : colorTheme.waveColorEnd);
                waveGradient.addColorStop(1, 'rgba(94, 96, 206, 0)');
                
                ctx.fillStyle = waveGradient;
                
                // 移动到第一个点
                ctx.moveTo(wavePoints[0].x, wavePoints[0].y + (j * 50));
                
                // 绘制曲线
                for (let i = 0; i < wavePoints.length - 1; i++) {
                    const xc = (wavePoints[i].x + wavePoints[i + 1].x) / 2;
                    const yc = (wavePoints[i].y + wavePoints[i + 1].y) / 2 + (j * 50);
                    ctx.quadraticCurveTo(wavePoints[i].x, wavePoints[i].y + (j * 50), xc, yc);
                }
                
                // 完成路径
                ctx.lineTo(canvas.width, canvas.height);
                ctx.lineTo(0, canvas.height);
                ctx.closePath();
                ctx.fill();
            }
        }
        
        // 绘制波纹
        ripples.forEach(ripple => {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(115, 222, 254, ${ripple.alpha * 0.5})`;
            ctx.lineWidth = 2;
            ctx.arc(ripple.x, ripple.y, ripple.size, 0, Math.PI * 2);
            ctx.stroke();
        });
        
        // 绘制顶部光晕效果
        const topGlow = ctx.createRadialGradient(
            canvas.width * 0.5, 0, 0,
            canvas.width * 0.5, 0, canvas.height * 0.6
        );
        topGlow.addColorStop(0, 'rgba(115, 222, 254, 0.1)');
        topGlow.addColorStop(1, 'rgba(115, 222, 254, 0)');
        
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 显示调试信息 - 包括波纹数量
        if (debugElement) {
            const fps = Math.round(1000 / (performance.now() - lastTimestamp));
            debugElement.textContent = `粒子: ${particles.length} | 波纹: ${ripples.length} | FPS: ${fps} | 动画正在运行`;
        }
    }
    
    // 初始化
    let lastTimestamp = 0;
    function initialize() {
        if (animationStarted) return; // 防止重复初始化
        
        console.log("初始化动画...");
        animationStarted = true;
        
        resizeCanvas();
        generateColorGradient();
        createParticles();
        connectParticles();
        generateWavePoints();
        
        // 开始动画循环
        lastTimestamp = performance.now();
        animationLoop();
        
        console.log("动画已开始运行");
    }
    
    // 清除旧的动画帧
    function stopAnimation() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
    
    // 动画循环
    function animationLoop() {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastTimestamp;
        
        // 确保deltaTime有效且不会太大(如果标签页不活跃)
        const clampedDelta = Math.min(deltaTime, 100);
        
        update(clampedDelta);
        render();
        
        lastTimestamp = currentTime;
        
        // 保存动画ID以便在需要时停止
        animationFrameId = requestAnimationFrame(animationLoop);
    }
    
    // 启动
    initialize();
    
    // 添加可见性变化事件，在标签页切换时暂停/恢复动画
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            // 标签页不可见时暂停动画
            stopAnimation();
            console.log("动画已暂停");
        } else {
            // 标签页可见时继续动画
            if (!animationFrameId && animationStarted) {
                lastTimestamp = performance.now();
                animationFrameId = requestAnimationFrame(animationLoop);
                console.log("动画已恢复");
            }
        }
    });
    
    // 用户交互时检查动画是否运行
    document.addEventListener('click', function() {
        if (!animationFrameId && animationStarted) {
            console.log("检测到用户交互，确保动画运行...");
            lastTimestamp = performance.now();
            animationFrameId = requestAnimationFrame(animationLoop);
        }
    });
    
    // 检查动画是否正在运行的函数
    function checkAnimation() {
        if (!animationFrameId && animationStarted && !document.hidden) {
            console.log("检测到动画停止，重新启动...");
            lastTimestamp = performance.now();
            animationFrameId = requestAnimationFrame(animationLoop);
        }
    }
    
    // 定期检查动画是否运行
    setInterval(checkAnimation, 5000);
}); 