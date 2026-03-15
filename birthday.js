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

    // FASE 1: Flores Generativas (Neon Style with Hearts & Stars)
    phase1() {
        const startTime = Date.now();
        const duration = 12000; 
        const flowers = [];
        const numFlowers = 15;
        const hearts = [];
        const stars = [];

        // Generate Stars
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                opacity: Math.random(),
                speed: 0.2 + Math.random() * 0.5
            });
        }

        // Generate Hearts
        for (let i = 0; i < 20; i++) {
            hearts.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 50,
                size: 10 + Math.random() * 20,
                speed: 1 + Math.random() * 2,
                drift: (Math.random() - 0.5) * 1,
                opacity: 0.3 + Math.random() * 0.5,
                hasRing: Math.random() > 0.6
            });
        }

        for (let i = 0; i < numFlowers; i++) {
            let x;
            let attempts = 0;
            let tooClose;
            do {
                x = 50 + Math.random() * (this.canvas.width - 100);
                tooClose = flowers.some(f => Math.abs(f.x - x) < 120);
                attempts++;
            } while (tooClose && attempts < 50);

            const groundY = this.canvas.height + 50;
            const targetY = 100 + Math.random() * (this.canvas.height - 350);
            
            flowers.push({
                x: x,
                groundY: groundY,
                targetY: targetY,
                stemLength: 0,
                maxStemLength: groundY - targetY,
                size: 50 + Math.random() * 60,
                color: Math.random() > 0.5 ? '#FF00FF' : '#FF69B4',
                petals: 5 + Math.floor(Math.random() * 3),
                delay: Math.random() * 5000,
                bloomProgress: 0,
                rotation: (Math.random() - 0.5) * 1,
                stemControlX: x + (Math.random() - 0.5) * 200,
                leaves: [
                    { pos: 0.35, size: 25, side: 1 },
                    { pos: 0.2, size: 20, side: -1 },
                    { pos: 0.55, size: 18, side: -1 },
                    { pos: 0.45, size: 15, side: 1 }
                ]
            });
        }

        const animate = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed > duration) {
                cancelAnimationFrame(this.animationId);
                this.phase2();
                return;
            }

            this.ctx.fillStyle = '#050510';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            stars.forEach(s => {
                const twinkle = Math.abs(Math.sin(elapsed / 1000 + s.x));
                this.ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * twinkle})`;
                this.ctx.shadowBlur = 5 * twinkle;
                this.ctx.shadowColor = 'white';
                this.ctx.beginPath();
                this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            this.ctx.shadowBlur = 0;

            hearts.forEach(h => {
                h.y -= h.speed;
                h.x += Math.sin(elapsed / 1000 + h.y / 100) * 0.8;
                if (h.y < -100) h.y = this.canvas.height + 100;
                this.drawNeonHeart(h);
            });

            flowers.forEach(f => {
                if (elapsed > f.delay) {
                    const growthElapsed = elapsed - f.delay;
                    const stemProgress = Math.min(1, growthElapsed / 4000);
                    f.stemLength = f.maxStemLength * stemProgress;

                    if (stemProgress > 0.5) {
                        f.bloomProgress = Math.min(1, (growthElapsed - 2000) / 2500);
                    }
                    this.drawNeonOrganicFlower(f);
                }
            });

            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    },

    // FASE 2 & 3: Lluvia Matrix Persistente y Contador
    phase2() {
        const startTime = Date.now();
        const duration = 12000; // Combined duration for Matrix + Countdown
        const fontSize = 10;
        const columns = Math.floor(this.canvas.width / fontSize);
        const drops = new Array(columns).fill(1).map(() => Math.random() * -150);
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$#@&?%¡!ｦｱｳｴｵｶｷｸｹｺ'.split('');
        
        // Countdown values
        let countdownStarted = false;
        let countdownValue = 3;
        const counterDiv = document.createElement('div');
        Object.assign(counterDiv.style, {
            position: 'absolute',
            fontSize: '180px',
            color: this.matrixColor,
            fontWeight: '900',
            textAlign: 'center',
            textShadow: `0 0 40px ${this.matrixColor}`,
            transform: 'scale(0.5)',
            opacity: '0',
            transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            zIndex: '100'
        });
        this.overlay.appendChild(counterDiv);

        const animateMatrix = () => {
            const elapsed = Date.now() - startTime;
            
            // Start countdown at 7 seconds into the Matrix effect
            if (elapsed > 6000 && !countdownStarted) {
                countdownStarted = true;
                this.startCountdown(counterDiv);
            }

            if (elapsed > duration) {
                cancelAnimationFrame(this.animationId);
                counterDiv.remove();
                this.phase4();
                return;
            }

            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = this.matrixColor;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = this.matrixColor;
            this.ctx.font = `bold ${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                this.ctx.fillText(text, x, y);

                if (Math.random() > 0.6) {
                    this.ctx.fillStyle = 'white';
                    this.ctx.fillText(text, x, y);
                    this.ctx.fillStyle = this.matrixColor;
                }

                if (drops[i] * fontSize > this.canvas.height && Math.random() > 0.95) {
                    drops[i] = 0;
                }
                drops[i] += (3 + Math.random() * 4);
            }
            this.ctx.shadowBlur = 0;
            this.animationId = requestAnimationFrame(animateMatrix);
        };
        animateMatrix();
    },

    startCountdown(div) {
        let count = 3;
        const update = () => {
            if (count === 0) return;
            div.textContent = count;
            div.style.opacity = '1';
            div.style.transform = 'scale(1.4)';
            
            setTimeout(() => {
                div.style.opacity = '0';
                div.style.transform = 'scale(0.6)';
                setTimeout(() => {
                    count--;
                    if (count > 0) update();
                }, 400);
            }, 600);
        };
        update();
    },

    // Simplified phase3 as it's merged into phase2
    phase3() {
        // This is handled in phase2 loop now
    },

    drawNeonHeart(h) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.globalAlpha = h.opacity;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FF007F';
        ctx.fillStyle = '#FF69B4';
        
        ctx.beginPath();
        const s = h.size;
        ctx.moveTo(0, s / 4);
        ctx.bezierCurveTo(0, 0, -s, 0, -s, s / 2);
        ctx.bezierCurveTo(-s, s, 0, s * 1.5, 0, s * 2);
        ctx.bezierCurveTo(0, s * 1.5, s, s, s, s / 2);
        ctx.bezierCurveTo(s, 0, 0, 0, 0, s / 4);
        ctx.fill();

        if (h.hasRing) {
            ctx.beginPath();
            ctx.arc(0, s, s * 1.8, 0, Math.PI * 2);
            ctx.strokeStyle = '#FF69B4';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
        
        ctx.restore();
    },

    drawNeonOrganicFlower(f) {
        const ctx = this.ctx;
        ctx.save();
        
        const cpX = f.stemControlX;
        const cpY = f.groundY - f.maxStemLength * 0.5;
        const t = Math.min(1, f.stemLength / f.maxStemLength);
        
        const qx = (1 - t) * (1 - t) * f.x + 2 * (1 - t) * t * cpX + t * t * f.x;
        const qy = (1 - t) * (1 - t) * f.groundY + 2 * (1 - t) * t * cpY + t * t * f.targetY;

        ctx.shadowBlur = 12;
        ctx.shadowColor = '#39FF14';
        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#20FF70'; 
        ctx.lineCap = 'round';
        ctx.moveTo(f.x, f.groundY);
        ctx.quadraticCurveTo(cpX, cpY, qx, qy);
        ctx.stroke();

        f.leaves.forEach(leaf => {
            const lpT = leaf.pos;
            if (t > lpT) {
                const lx = (1 - lpT) * (1 - lpT) * f.x + 2 * (1 - lpT) * lpT * cpX + lpT * lpT * f.x;
                const ly = (1 - lpT) * (1 - lpT) * f.groundY + 2 * (1 - lpT) * lpT * cpY + lpT * lpT * f.targetY;
                const leafScale = Math.min(1, (t - lpT) * 5);
                
                ctx.save();
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#00FF00';
                this.drawLeaf(lx, ly, leaf.size * leafScale, leaf.side);
                ctx.restore();
            }
        });

        if (f.bloomProgress > 0) {
            this.drawNeonBloom(qx, qy, f.size * f.bloomProgress, f.petals, f.color, f.rotation);
        }

        ctx.restore();
    },

    drawLeaf(x, y, size, side) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(side * Math.PI / 4);
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(side * size, -size, side * size * 1.5, size, 0, 0);
        ctx.fill();
        ctx.restore();
    },

    drawNeonBloom(x, y, radius, numPetals, color, rotation) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        ctx.shadowBlur = 25;
        ctx.shadowColor = color;

        for (let i = 0; i < numPetals; i++) {
            ctx.beginPath();
            ctx.rotate((Math.PI * 2) / numPetals);
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.9;
            
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(
                -radius * 0.9, -radius * 1.3,
                radius * 0.9, -radius * 1.3,
                0, 0
            );
            ctx.fill();
            
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.globalAlpha = 0.4;
            ctx.arc(0, -radius * 0.6, radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 20;
        ctx.shadowColor = 'white';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFF33'; 
        ctx.fill();

        ctx.restore();
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
