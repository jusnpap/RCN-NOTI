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
        const duration = 10000; // Longer for better appreciation
        const flowers = [];
        const numFlowers = 10;
        const hearts = [];
        const stars = [];

        // Generate Stars
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                opacity: Math.random()
            });
        }

        // Generate Hearts
        for (let i = 0; i < 15; i++) {
            hearts.push({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + 50,
                size: 10 + Math.random() * 15,
                speed: 0.5 + Math.random() * 1.5,
                drift: (Math.random() - 0.5) * 1,
                opacity: 0.2 + Math.random() * 0.5,
                hasRing: Math.random() > 0.7
            });
        }

        for (let i = 0; i < numFlowers; i++) {
            const x = 50 + Math.random() * (this.canvas.width - 100);
            const groundY = this.canvas.height + 20;
            const targetY = 150 + Math.random() * (this.canvas.height - 400);
            
            flowers.push({
                x: x,
                groundY: groundY,
                targetY: targetY,
                stemLength: 0,
                maxStemLength: groundY - targetY,
                size: 60 + Math.random() * 40,
                color: '#FF00FF', // Neon Magenta
                petals: 5,
                delay: Math.random() * 4000,
                bloomProgress: 0,
                rotation: (Math.random() - 0.5) * 0.5,
                stemControlX: x + (Math.random() - 0.5) * 150,
                leaves: [
                    { pos: 0.4, size: 25, side: 1 },
                    { pos: 0.25, size: 20, side: -1 },
                    { pos: 0.6, size: 15, side: -1 }
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

            // Draw deep space background
            this.ctx.fillStyle = '#050510';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Draw Stars
            stars.forEach(s => {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * Math.abs(Math.sin(elapsed / 1000 + s.x))})`;
                this.ctx.beginPath();
                this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                this.ctx.fill();
            });

            // Draw Hearts
            hearts.forEach(h => {
                h.y -= h.speed;
                h.x += Math.sin(elapsed / 1000 + h.y / 100) * 0.5;
                if (h.y < -50) h.y = this.canvas.height + 50;
                this.drawNeonHeart(h);
            });

            flowers.forEach(f => {
                if (elapsed > f.delay) {
                    const growthElapsed = elapsed - f.delay;
                    const stemProgress = Math.min(1, growthElapsed / 3000);
                    f.stemLength = f.maxStemLength * stemProgress;

                    if (stemProgress > 0.6) {
                        f.bloomProgress = Math.min(1, (growthElapsed - 1800) / 2000);
                    }
                    this.drawNeonOrganicFlower(f);
                }
            });

            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    },

    drawNeonHeart(h) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(h.x, h.y);
        ctx.globalAlpha = h.opacity;
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FF69B4';
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
            ctx.arc(0, s, s * 2, 0, Math.PI * 2);
            ctx.strokeStyle = '#FF69B4';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        
        ctx.restore();
    },

    drawNeonOrganicFlower(f) {
        const ctx = this.ctx;
        ctx.save();
        
        // Draw Neon Stem
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00FF41';
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#20FF70'; 
        ctx.lineCap = 'round';
        
        const cpX = f.stemControlX;
        const cpY = f.groundY - f.maxStemLength * 0.5;
        const t = Math.min(1, f.stemLength / f.maxStemLength);
        const qx = (1 - t) * (1 - t) * f.x + 2 * (1 - t) * t * cpX + t * t * f.x;
        const qy = (1 - t) * (1 - t) * f.groundY + 2 * (1 - t) * t * cpY + t * t * f.targetY;
        
        ctx.moveTo(f.x, f.groundY);
        ctx.quadraticCurveTo(cpX, cpY, qx, qy);
        ctx.stroke();

        // Draw Leaves
        f.leaves.forEach(leaf => {
            if (f.stemLength / f.maxStemLength > leaf.pos) {
                const lpT = leaf.pos;
                const lx = (1 - lpT) * (1 - lpT) * f.x + 2 * (1 - lpT) * lpT * cpX + lpT * lpT * f.x;
                const ly = (1 - lpT) * (1 - lpT) * f.groundY + 2 * (1 - lpT) * lpT * cpY + lpT * lpT * f.targetY;
                const leafScale = Math.min(1, (f.stemLength / f.maxStemLength - leaf.pos) * 4);
                
                ctx.save();
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#00CC00';
                this.drawLeaf(lx, ly, leaf.size * leafScale, leaf.side);
                ctx.restore();
            }
        });

        // Draw Bloom
        if (f.bloomProgress > 0) {
            this.drawNeonBloom(f.x, f.targetY, f.size * f.bloomProgress, f.petals, f.color, f.rotation);
        }

        ctx.restore();
    },

    drawNeonBloom(x, y, radius, numPetals, color, rotation) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;

        for (let i = 0; i < numPetals; i++) {
            ctx.beginPath();
            ctx.rotate((Math.PI * 2) / numPetals);
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.8;
            
            // Rounded petals like in reference
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(
                -radius * 0.8, -radius * 1.2,
                radius * 0.8, -radius * 1.2,
                0, 0
            );
            ctx.fill();
            
            // Inner Glow
            ctx.beginPath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.arc(0, -radius * 0.5, radius * 0.2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Radiant Center
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'white';
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Center Detail
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFF00';
        ctx.fill();

        ctx.restore();
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
