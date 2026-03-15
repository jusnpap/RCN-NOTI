/**
 * Birthday Experience for Niko Ortiz
 * Implements a 4-phase animation sequence using Canvas and DOM.
 */
const BirthdayExperience = {
    overlay: null,
    canvas: null,
    ctx: null,
    animationId: null,
    colors: ['#FF69B4', '#FF1493', '#C71585', '#DB7093', '#FFB6C1'], // Pink palette
    matrixColor: '#FF69B4', // Hot Pink for Matrix

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

    // FASE 1: Flores Generativas (Style refined to be more organic)
    phase1() {
        const startTime = Date.now();
        const duration = 6000;
        const flowers = [];
        const numFlowers = 15;

        for (let i = 0; i < numFlowers; i++) {
            flowers.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 40 + Math.random() * 60,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                petals: 5 + Math.floor(Math.random() * 7),
                delay: Math.random() * 2000,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.01
            });
        }

        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                cancelAnimationFrame(this.animationId);
                this.phase2();
                return;
            }

            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            flowers.forEach(f => {
                if (elapsed > f.delay) {
                    const progress = Math.min(1, (elapsed - f.delay) / 3000);
                    f.rotation += f.rotationSpeed;
                    this.drawFlower(f.x, f.y, f.size * progress, f.petals, f.color, f.rotation);
                }
            });

            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    },

    drawFlower(x, y, radius, numPetals, color, rotation) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        
        // Petals
        for (let i = 0; i < numPetals; i++) {
            this.ctx.beginPath();
            this.ctx.rotate((Math.PI * 2) / numPetals);
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = 0.6;
            
            // More organic petal shape
            this.ctx.moveTo(0, 0);
            this.ctx.bezierCurveTo(
                radius * 0.5, -radius * 1.5,
                radius * 1.5, -radius * 0.5,
                0, 0
            );
            this.ctx.fill();
            
            // Inner detail
            this.ctx.beginPath();
            this.ctx.strokeStyle = 'white';
            this.ctx.globalAlpha = 0.2;
            this.ctx.lineWidth = 2;
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(0, -radius);
            this.ctx.stroke();
        }

        // Center
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFFACD'; // Lemon Chiffon for center
        this.ctx.globalAlpha = 1;
        this.ctx.fill();
        
        // Center shadow
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        this.ctx.stroke();

        this.ctx.restore();
    },

    // FASE 2: Lluvia Matrix (Pink style)
    phase2() {
        const startTime = Date.now();
        const duration = 5000;
        const fontSize = 18;
        const columns = Math.floor(this.canvas.width / fontSize);
        const drops = new Array(columns).fill(1);
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@&?%¡!'.split('');

        const animateMatrix = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                cancelAnimationFrame(this.animationId);
                this.phase3();
                return;
            }

            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = this.matrixColor;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = this.matrixColor;
            this.ctx.font = `bold ${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                this.ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > this.canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += (1.5 + Math.random() * 2);
            }
            this.ctx.shadowBlur = 0; // Reset for next frame

            this.animationId = requestAnimationFrame(animateMatrix);
        };
        animateMatrix();
    },

    // FASE 3: Contador Regresivo
    phase3() {
        const counterDiv = document.createElement('div');
        Object.assign(counterDiv.style, {
            position: 'absolute',
            fontSize: '150px',
            color: this.matrixColor,
            fontWeight: '900',
            textAlign: 'center',
            textShadow: `0 0 30px ${this.matrixColor}`,
            transform: 'scale(0.5)',
            opacity: '0',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: '100'
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
            counterDiv.style.transform = 'scale(1.3)';
            
            setTimeout(() => {
                counterDiv.style.opacity = '0';
                counterDiv.style.transform = 'scale(0.5)';
                setTimeout(() => {
                    count--;
                    updateCounter();
                }, 400);
            }, 600);
        };

        updateCounter();
    },

    // FASE 4: Mensaje Final
    phase4() {
        this.canvas.style.display = 'none';
        const container = document.createElement('div');
        Object.assign(container.style, {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem',
            textAlign: 'center',
            zIndex: '101'
        });
        this.overlay.appendChild(container);

        const textEl = document.createElement('h1');
        const fullText = "¡FELIZ CUMPLEAÑOS NIKO! 🎂🎉";
        Object.assign(textEl.style, {
            color: this.matrixColor,
            fontSize: window.innerWidth < 768 ? '36px' : '64px',
            fontWeight: '900',
            textShadow: `0 0 20px ${this.matrixColor}`,
            marginBottom: '2.5rem',
            lineHeight: '1.2',
            letterSpacing: '2px'
        });
        container.appendChild(textEl);

        let charIndex = 0;
        const typeWriter = () => {
            if (charIndex < fullText.length) {
                textEl.textContent += fullText.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 100);
            } else {
                this.showContinueBtn(container);
            }
        };
        textEl.textContent = ""; // Clear initial
        typeWriter();
        this.createConfetti();
    },

    showContinueBtn(container) {
        const btn = document.createElement('button');
        btn.textContent = "Continuar →";
        Object.assign(btn.style, {
            padding: '15px 40px',
            fontSize: '20px',
            background: 'transparent',
            color: this.matrixColor,
            border: `3px solid ${this.matrixColor}`,
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            fontWeight: '900',
            marginTop: '30px',
            boxShadow: `0 0 10px ${this.matrixColor}`
        });
        
        btn.onmouseover = () => {
            btn.style.background = this.matrixColor;
            btn.style.color = 'black';
            btn.style.boxShadow = `0 0 30px ${this.matrixColor}`;
            btn.style.transform = 'scale(1.05)';
        };
        btn.onmouseout = () => {
            btn.style.background = 'transparent';
            btn.style.color = this.matrixColor;
            btn.style.boxShadow = `0 0 10px ${this.matrixColor}`;
            btn.style.transform = 'scale(1)';
        };

        btn.onclick = () => {
            this.overlay.style.opacity = '0';
            this.overlay.style.transition = 'opacity 0.8s ease';
            setTimeout(() => {
                this.overlay.remove();
                if (window.app && window.app.pendingView) {
                    window.app.navigateTo(window.app.pendingView);
                    window.app.pendingView = null;
                }
            }, 800);
        };
        container.appendChild(btn);
    },

    createConfetti() {
        for (let i = 0; i < 150; i++) {
            const confetti = document.createElement('div');
            const size = Math.random() * 12 + 6 + 'px';
            Object.assign(confetti.style, {
                position: 'absolute',
                top: '-20px',
                left: Math.random() * 100 + 'vw',
                width: size,
                height: size,
                backgroundColor: this.colors[Math.floor(Math.random() * this.colors.length)],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                opacity: Math.random(),
                zIndex: '99998',
                pointerEvents: 'none'
            });
            this.overlay.appendChild(confetti);

            const duration = Math.random() * 3 + 3;
            confetti.animate([
                { transform: `translateY(0) rotate(0deg) translateX(0)`, opacity: 1 },
                { transform: `translateY(110vh) rotate(${Math.random() * 720}deg) translateX(${(Math.random() - 0.5) * 200}px)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                iterations: Infinity,
                delay: Math.random() * 5000
            });
        }
    }
};
