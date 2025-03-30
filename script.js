class LotterySystem {
    constructor() {
        this.participants = [];
        this.bubbles = [];
        this.isRunning = false;
        this.currentIndex = 0;
        this.interval = null;
        this.speed = 100; // 初始速度（毫秒）
        
        // DOM元素
        this.bubblesContainer = document.getElementById('bubblesContainer');
        this.winnerDisplay = document.getElementById('winnerDisplay');
        this.winnerImage = document.getElementById('winnerImage');
        this.winnerName = document.getElementById('winnerName');
        
        // 创建烟花容器
        this.createFireworkContainer();
        
        // 背景音乐实例
        this.backgroundMusic = null;
        
        // 预加载音频
        this.preloadAudio();
        
        // 绑定键盘事件
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // 点击获奖者显示框关闭它
        this.winnerDisplay.addEventListener('click', () => {
            this.winnerDisplay.style.display = 'none';
        });
        
        // 初始化
        this.init();
    }
    
    // 创建烟花容器
    createFireworkContainer() {
        this.fireworkContainer = document.createElement('div');
        this.fireworkContainer.className = 'firework';
        document.body.appendChild(this.fireworkContainer);
    }
    
    // 预加载音频
    preloadAudio() {
        // 更简单直接的方式加载音频
        this.winnerAudio = new Audio('music/3.mp3');
        
        // 监听错误事件
        this.winnerAudio.onerror = (e) => {
            console.error('音频加载错误：', e);
        };
        
        // 监听加载事件
        this.winnerAudio.oncanplaythrough = () => {
            console.log('音频已成功加载');
        };
        
        // 强制加载
        this.winnerAudio.load();
        
        // 备用音频准备
        this.backupAudio = new Audio('audio/2013-preview.mp3');
        this.backupAudio.load();
        
        // 初始化AudioContext作为最后的备用
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            console.warn('无法创建AudioContext:', e);
        }
        
        // 初始化背景音乐
        this.backgroundMusic = new Audio('music/3.mp3');
        this.backgroundMusic.loop = true; // 循环播放
        this.backgroundMusic.volume = 0.5; // 默认音量50%
        
        // 音频加载错误处理
        this.backgroundMusic.onerror = (e) => {
            console.error('背景音乐加载错误：', e);
        };
    }
    
    // 处理键盘事件
    handleKeyPress(event) {
        // 空格键或回车键
        if (event.code === 'Space' || event.code === 'Enter') {
            event.preventDefault(); // 防止页面滚动
            if (this.isRunning) {
                this.stop();
            } else {
                this.start();
            }
        }
    }
    
    async init() {
        try {
            // 直接使用get_images.php获取图片
            const response = await fetch('get_images.php');
            const data = await response.json();
            
            console.log('获取图片响应:', data); // 添加调试日志
            
            if (data.success && data.participants && data.participants.length > 0) {
                // 直接使用返回的参与者数据
                this.participants = data.participants;
                
                // 创建泡泡
                this.createBubbles();
                
                console.log(`已加载 ${this.participants.length} 名参与者`);
                
                // 显示状态信息
                if (document.getElementById('loadStatus')) {
                    document.getElementById('loadStatus').textContent = 
                        `已成功加载 ${this.participants.length} 名参与者`;
                }
            } else {
                // 详细的错误日志
                console.error('未找到参与者图片', data);
                
                // 显示更详细的错误信息
                alert(`未找到参与者图片。调试信息：${JSON.stringify(data.debug || '无额外信息')}`);
                
                throw new Error('未找到参与者图片');
            }
        } catch (error) {
            console.error('初始化失败:', error);
            
            // 更详细的错误处理
            let errorMessage = '加载参与者信息失败。';
            if (error instanceof TypeError) {
                errorMessage += ' 网络错误或服务器响应异常。';
            } else if (error instanceof SyntaxError) {
                errorMessage += ' 服务器返回的数据格式不正确。';
            }
            
            alert(errorMessage);
            
            // 显示错误信息
            if (document.getElementById('loadStatus')) {
                document.getElementById('loadStatus').textContent = errorMessage;
                document.getElementById('loadStatus').style.backgroundColor = 'rgba(255,0,0,0.2)';
            }
        }
    }
    
    createBubbles() {
        const containerWidth = this.bubblesContainer.clientWidth;
        const containerHeight = this.bubblesContainer.clientHeight;
        
        // 清空已有的泡泡（如果有）
        this.bubblesContainer.innerHTML = '';
        this.bubbles = [];
        
        this.participants.forEach((participant, index) => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            
            // 为每个气泡设置随机的CSS变量，用于控制动画
            for (let i = 1; i <= 8; i++) {
                const randomValue = Math.floor(Math.random() * 20) - 10; // -10 到 10 的随机值
                bubble.style.setProperty(`--random${i}`, randomValue);
            }
            
            // 随机初始位置
            const x = Math.random() * (containerWidth - 100); // 100px是气泡宽度
            const y = Math.random() * (containerHeight - 100); // 100px是气泡高度
            
            bubble.style.left = `${x}px`;
            bubble.style.top = `${y}px`;
            
            // 添加图片
            const img = document.createElement('img');
            img.src = participant.image;
            img.alt = participant.name;
            img.draggable = false; // 防止拖拽
            img.onerror = () => {
                // 图片加载失败时显示默认头像
                img.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20fill%3D%22%23ddd%22%20width%3D%22200%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%23666%22%20font-family%3D%22Arial%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dominant-baseline%3D%22middle%22%3E' + participant.name + '%3C%2Ftext%3E%3C%2Fsvg%3E';
            };
            bubble.appendChild(img);
            
            // 点击气泡也可以开始/停止抽奖
            bubble.addEventListener('click', () => {
                if (this.isRunning) {
                    this.stop();
                } else {
                    this.start();
                }
            });
            
            this.bubblesContainer.appendChild(bubble);
            this.bubbles.push(bubble);
        });
    }
    
    start() {
        if (this.isRunning || this.bubbles.length === 0) {
            if (this.bubbles.length === 0) {
                alert('没有参与者数据，无法开始抽奖');
            }
            return;
        }
        
        this.isRunning = true;
        this.winnerDisplay.style.display = 'none';
        this.speed = 100; // 重置初始速度
        
        // 清空烟花
        this.fireworkContainer.innerHTML = '';
        
        // 重置所有泡泡
        this.bubbles.forEach(bubble => bubble.classList.remove('active'));
        
        // 开始抽奖动画
        this.interval = setInterval(() => {
            // 移除上一个泡泡的高亮
            if (this.currentIndex > 0) {
                this.bubbles[this.currentIndex - 1].classList.remove('active');
            } else if (this.currentIndex === 0 && this.bubbles.length > 0) {
                this.bubbles[this.bubbles.length - 1].classList.remove('active');
            }
            
            // 高亮当前泡泡
            this.bubbles[this.currentIndex].classList.add('active');
            
            // 更新索引
            this.currentIndex = (this.currentIndex + 1) % this.bubbles.length;
            
            // 逐渐减慢速度
            if (this.speed < 300) {
                this.speed += 5;
                clearInterval(this.interval);
                this.interval = setInterval(() => this.update(), this.speed);
            }
        }, this.speed);
    }
    
    stop() {
        if (!this.isRunning) return;
        
        // 停止背景音乐
        this.stopBackgroundMusic();
        
        clearInterval(this.interval);
        this.isRunning = false;
        
        // 获取获奖者信息
        const winner = this.participants[this.currentIndex];
        
        // 先触发用户交互，然后播放音频（解决移动设备限制）
        const userInteraction = () => {
            // 移除事件监听器
            document.body.removeEventListener('click', userInteraction);
            document.body.removeEventListener('touchstart', userInteraction);
            
            // 确保音频上下文已恢复
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // 播放获奖音效并显示烟花
            this.playWinnerSound();
        };
        
        // 添加一次性事件监听器来触发用户交互
        document.body.addEventListener('click', userInteraction, { once: true });
        document.body.addEventListener('touchstart', userInteraction, { once: true });
        
        // 强制立即触发一次交互事件
        setTimeout(() => {
            const event = new Event('click');
            document.body.dispatchEvent(event);
        }, 10);
        
        // 显示烟花
        this.showFireworks();
        
        // 显示获奖者
        this.winnerImage.src = winner.image;
        this.winnerName.textContent = winner.name;
        this.winnerDisplay.style.display = 'block';
    }
    
    playWinnerSound() {
        console.log('尝试播放音频...');
        
        try {
            // 使用更简单的方法
            this.winnerAudio.currentTime = 0;
            this.winnerAudio.volume = 1.0;
            
            // 直接播放
            this.winnerAudio.play().then(() => {
                console.log('音频播放成功');
            }).catch(error => {
                console.warn('无法播放主音频:', error);
                
                // 尝试用新实例播放
                try {
                    const tempAudio = new Audio('music/3.mp3?' + new Date().getTime());
                    tempAudio.volume = 1.0;
                    tempAudio.play().catch(err => {
                        console.warn('备用播放也失败:', err);
                        this.playBackupSound();
                    });
                } catch (e) {
                    console.error('所有方法都失败:', e);
                    this.playBackupSound();
                }
            });
        } catch (error) {
            console.error('音频播放异常:', error);
            this.playBackupSound();
        }
    }
    
    // 简化备用声音
    playBackupSound() {
        try {
            this.backupAudio.currentTime = 0;
            this.backupAudio.play().catch(e => {
                console.warn('备用音频也无法播放:', e);
                this.playBackupTone();
            });
        } catch (e) {
            console.error('备用音频异常:', e);
            this.playBackupTone();
        }
    }
    
    // 使用AudioContext生成简单的声音作为最终备用
    playBackupTone() {
        if (!this.audioContext) {
            console.error('无法播放任何音效');
            return;
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5音
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // 设置音量渐变
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.8, this.audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1.5);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 1.5);
        } catch (e) {
            console.error('备用音效生成也失败:', e);
        }
    }
    
    showFireworks() {
        // 清空之前的烟花
        this.fireworkContainer.innerHTML = '';
        
        // 创建更多烟花
        for (let i = 0; i < 30; i++) { // 增加到30个烟花
            setTimeout(() => {
                this.createFirework();
            }, i * 150); // 缩短间隔，更快速密集
        }
        
        // 第二轮延迟烟花
        setTimeout(() => {
            for (let i = 0; i < 15; i++) {
                setTimeout(() => {
                    this.createFirework();
                }, i * 200 + 1000); // 第二波烟花
            }
        }, 3000);
    }
    
    createFirework() {
        // 随机位置
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight * 0.8; // 覆盖更大区域
        
        // 扩展颜色范围
        const colors = [
            '#ff0000', '#ffff00', '#00ff00', '#00ffff', 
            '#0000ff', '#ff00ff', '#ff5500', '#55ff00',
            '#ff8800', '#00ffaa', '#aa00ff', '#ffaa00',
            '#ff2222', '#ffee22', '#22ff22', '#22ffee',
            '#2222ff', '#ee22ff', '#ffcc44', '#44ffcc',
            'gold', 'silver', '#ff88cc', '#cc88ff'
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // 创建更明亮的爆炸中心点
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
        explosion.style.boxShadow = `0 0 20px 5px ${color}`; // 更大更明亮的阴影
        
        this.fireworkContainer.appendChild(explosion);
        
        // 创建更多粒子
        const particleCount = 60 + Math.floor(Math.random() * 40); // 60-100个粒子
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            
            // 随机粒子大小
            const size = 2 + Math.random() * 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // 随机粒子颜色（有时使用白色增加亮度）
            particle.style.backgroundColor = Math.random() > 0.3 ? color : '#ffffff';
            
            // 随机方向和距离
            const angle = Math.random() * Math.PI * 2;
            const distance = 70 + Math.random() * 200; // 更大的扩散范围
            const xMove = Math.cos(angle) * distance;
            const yMove = Math.sin(angle) * distance;
            
            particle.style.setProperty('--x', `${xMove}px`);
            particle.style.setProperty('--y', `${yMove}px`);
            
            // 随机动画持续时间，增加变化感
            const duration = 0.8 + Math.random() * 0.7;
            particle.style.animationDuration = `${duration}s`;
            
            this.fireworkContainer.appendChild(particle);
            
            // 自动移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, duration * 1000);
        }
        
        // 自动移除爆炸中心
        setTimeout(() => {
            if (explosion.parentNode) {
                explosion.parentNode.removeChild(explosion);
            }
        }, 1000);
    }
    
    update() {
        // 移除上一个泡泡的高亮
        if (this.currentIndex > 0) {
            this.bubbles[this.currentIndex - 1].classList.remove('active');
        } else if (this.currentIndex === 0 && this.bubbles.length > 0) {
            this.bubbles[this.bubbles.length - 1].classList.remove('active');
        }
        
        // 高亮当前泡泡
        this.bubbles[this.currentIndex].classList.add('active');
        
        // 更新索引
        this.currentIndex = (this.currentIndex + 1) % this.bubbles.length;
    }
    
    // 播放背景音乐
    playBackgroundMusic() {
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.currentTime = 0; // 从头开始
                this.backgroundMusic.play().then(() => {
                    console.log('背景音乐播放成功');
                }).catch(error => {
                    console.warn('背景音乐播放失败:', error);
                });
            } catch (error) {
                console.error('背景音乐播放异常:', error);
            }
        }
    }
    
    // 停止背景音乐
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
}

// 初始化抽奖系统
document.addEventListener('DOMContentLoaded', () => {
    new LotterySystem();
});

// 动态调整气泡大小和位置
function calculateBubbleSizes() {
    const containerWidth = document.querySelector('.bubbles-container').clientWidth;
    const containerHeight = document.querySelector('.bubbles-container').clientHeight;
    const bubbleBaseSize = Math.min(containerWidth, containerHeight) * 0.15; // 基础大小为容器的15%
    const maxBubbles = Math.floor(containerWidth / (bubbleBaseSize * 1.5)); // 根据容器宽度计算最大气泡数
    return { bubbleBaseSize, maxBubbles };
}

// 生成气泡的函数
function generateBubbles(participants) {
    const bubblesContainer = document.getElementById('bubblesContainer');
    bubblesContainer.innerHTML = ''; // 清空现有气泡

    const { bubbleBaseSize, maxBubbles } = calculateBubbleSizes();
    const shuffledParticipants = participants.sort(() => 0.5 - Math.random());

    // 限制气泡数量
    const displayParticipants = shuffledParticipants.slice(0, maxBubbles);

    displayParticipants.forEach((participant) => {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        // 动态设置气泡大小
        bubble.style.width = `${bubbleBaseSize}px`;
        bubble.style.height = `${bubbleBaseSize}px`;

        // 使用整个浏览器窗口作为放置区域
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 完全随机位置，减去气泡大小以防止溢出
        const x = Math.random() * (windowWidth - bubbleBaseSize);
        const y = Math.random() * (windowHeight - bubbleBaseSize);

        bubble.style.position = 'fixed'; // 使用fixed定位，相对于浏览器窗口
        bubble.style.left = `${x}px`;
        bubble.style.top = `${y}px`;

        const img = document.createElement('img');
        img.src = participant.image;
        img.alt = participant.name;
        
        bubble.appendChild(img);
        bubblesContainer.appendChild(bubble);

        // 添加点击事件
        bubble.addEventListener('click', () => {
            selectWinner(participant);
        });
    });
}

// 窗口大小变化时重新生成气泡
window.addEventListener('resize', () => {
    if (window.currentParticipants) {
        generateBubbles(window.currentParticipants);
    }
}); 