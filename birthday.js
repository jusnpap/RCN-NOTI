/**
 * Birthday Experience for Niko Ortiz
 * Implements a 4-phase animation sequence using Canvas and DOM.
 */
const BirthdayExperience = {
    overlay: null,
    canvas: null,
    ctx: null,
    animationId: null,
    colors: ['#FF69B4', '#FF1744', '#FFD600', '#E040FB'],
    matrixColor: '#00FF41',

    start() {
        // Create Overlay
        this.overlay = document.createElement('div');
        this.overlay.id = 'birthday-overlay';
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            backgroundColor: 'black',
            zIndex: '99999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            fontFamily: "'Inter', sans-serif"
        });
        document.body.appendChild(this.overlay);

        // Create Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.overlay.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        window.addEventListener('resize', () => {
            if (this.canvas) {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
        });

        this.phase1();
    },

    // FASE 1: Flores Generativas
    phase1() {
        const startTime = Date.now();
        const duration = 4000;
        const flowers = [];
        const numFlowers = 12;

        for (let i = 0; i < numFlowers; i++) {
            flowers.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 30 + Math.random() * 50,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                petals: 5 + Math.floor(Math.random() * 5),
                delay: Math.random() * 1000,
                speed: 0.02 + Math.random() * 0.02
            });
        }

        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                cancelAnimationFrame(this.animationId);
                this.phase2();
                return;
            }

            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            flowers.forEach(f => {
                if (elapsed > f.delay) {
                    const progress = Math.min(1, (elapsed - f.delay) / 2000);
                    this.drawFlower(f.x, f.y, f.size * progress, f.petals, f.color);
                }
            });

            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    },

    drawFlower(x, y, radius, numPetals, color) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.8;

        for (let i = 0; i < numPetals; i++) {
            this.ctx.beginPath();
            this.ctx.rotate((Math.PI * 2) / numPetals);
            this.ctx.moveTo(0, 0);
            this.ctx.bezierCurveTo(radius, -radius, radius * 2, radius, 0, 0);
            this.ctx.fill();
        }

        // Center
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'white';
        this.ctx.fill();
        this.ctx.restore();
    },

    // FASE 2: Lluvia Matrix
    phase2() {
        const startTime = Date.now();
        const duration = 4000;
        const fontSize = 16;
        const columns = Math.floor(this.canvas.width / fontSize);
        const drops = new Array(columns).fill(1);
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@&?%'.split('');

        const animateMatrix = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                cancelAnimationFrame(this.animationId);
                this.phase3();
                return;
            }

            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = this.matrixColor;
            this.ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                this.ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > this.canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += (1 + Math.random() * 2); // Velocidad variable
            }

            this.animationId = requestAnimationFrame(animateMatrix);
        };
        animateMatrix();
    },

    // FASE 3: Contador Regresivo
    phase3() {
        this.canvas.style.display = 'none';
        const counterDiv = document.createElement('div');
        Object.assign(counterDiv.style, {
            fontSize: '120px',
            color: this.matrixColor,
            fontWeight: 'bold',
            textAlign: 'center',
            textShadow: '0 0 20px rgba(0, 255, 65, 0.8)',
            transform: 'scale(0.5)',
            opacity: '0',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });
        this.overlay.appendChild(counterDiv);

        let count = 3;
        const updateCounter = () => {
            if (count === 0) {
                counterDiv.remove();
                this.phase4();
                return;
            }

            counterDiv.textContent = count;
            counterDiv.style.opacity = '1';
            counterDiv.style.transform = 'scale(1.2)';
            
            setTimeout(() => {
                counterDiv.style.opacity = '0';
                counterDiv.style.transform = 'scale(0.5)';
                setTimeout(() => {
                    count--;
                    updateCounter();
                }, 500);
            }, 500);
        };

        updateCounter();
    },

    // FASE 4: Mensaje Final
    phase4() {
        const container = document.createElement('div');
        Object.assign(container.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem',
            textAlign: 'center'
        });
        this.overlay.appendChild(container);

        const textEl = document.createElement('h1');
        const fullText = "¡FELIZ CUMPLEAÑOS NIKO! 🎂🎉";
        Object.assign(textEl.style, {
            color: this.matrixColor,
            fontSize: window.innerWidth < 768 ? '28px' : '48px',
            fontWeight: '800',
            textShadow: '0 0 15px rgba(0, 255, 65, 0.6)',
            marginBottom: '2rem',
            lineHeight: '1.4'
        });
        container.appendChild(textEl);

        let charIndex = 0;
        const typeWriter = () => {
            if (charIndex < fullText.length) {
                textEl.textContent += fullText.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 80);
            } else {
                this.showContinueBtn(container);
            }
        };
        typeWriter();
        this.createConfetti();
    },

    showContinueBtn(container) {
        const btn = document.createElement('button');
        btn.textContent = "Continuar →";
        Object.assign(btn.style, {
            padding: '12px 30px',
            fontSize: '18px',
            background: 'transparent',
            color: this.matrixColor,
            border: `2px solid ${this.matrixColor}`,
            borderRadius: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            marginTop: '20px'
        });
        
        btn.onmouseover = () => {
            btn.style.background = this.matrixColor;
            btn.style.color = 'black';
            btn.style.boxShadow = `0 0 20px ${this.matrixColor}`;
        };
        btn.onmouseout = () => {
            btn.style.background = 'transparent';
            btn.style.color = this.matrixColor;
            btn.style.boxShadow = 'none';
        };

        btn.onclick = () => {
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                // We don't reload, we just let the app continue
                if (window.app && window.app.pendingView) {
                    window.app.navigateTo(window.app.pendingView);
                    window.app.pendingView = null;
                }
            }, 500);
        };
        container.appendChild(btn);
    },

    createConfetti() {
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            const size = Math.random() * 10 + 5 + 'px';
            Object.assign(confetti.style, {
                position: 'absolute',
                top: '-20px',
                left: Math.random() * 100 + 'vw',
                width: size,
                height: size,
                backgroundColor: this.colors[Math.floor(Math.random() * this.colors.length)],
                borderRadius: '50%',
                opacity: Math.random(),
                zIndex: '99998',
                pointerEvents: 'none'
            });
            this.overlay.appendChild(confetti);

            const duration = Math.random() * 3 + 2;
            confetti.animate([
                { transform: `translateY(0) rotate(0deg)`, opacity: 1 },
                { transform: `translateY(110vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                iterations: Infinity,
                delay: Math.random() * 5000
            });
        }
    }
};
