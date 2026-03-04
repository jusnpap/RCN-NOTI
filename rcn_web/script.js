/**
 * RCN App Logic
 * Handles view navigation and form submission simulation.
 */
document.addEventListener('DOMContentLoaded', () => {

    // Initialize Plyr Video Players for all video tags with class 'plyr-video'
    const players = Plyr.setup('.plyr-video', {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'],
        settings: ['quality', 'speed', 'loop'],
        quality: { default: 720, options: [1080, 720, 480], forced: true, onChange: (e) => console.log(e) },
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] }
    });

    const app = {
        currentView: 'grid',
        isLoggedIn: false,
        currentUser: null,
        pendingView: null,

        requireAuthAndNavigate(viewId) {
            if (this.isLoggedIn) {
                this.navigateTo(viewId);
            } else {
                this.pendingView = viewId;
                this.showLoginModal();
            }
        },

        navigateTo(viewId) {
            if (this.currentView === viewId || this.isAnimating) return;

            this.isAnimating = true;
            const currentEl = document.getElementById(`view-${this.currentView}`);

            // Fade out current view
            if (currentEl) {
                currentEl.style.opacity = '0';
                currentEl.style.transform = 'translateY(-30px)';
                currentEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

                setTimeout(() => {
                    currentEl.classList.remove('active-view');
                    this.showView(viewId);
                }, 400);
            } else {
                this.showView(viewId);
            }
        },

        showView(viewId) {
            const nextEl = document.getElementById(`view-${viewId}`);
            if (nextEl) {
                // reset styles for clean animation
                nextEl.style.opacity = '';
                nextEl.style.transform = '';
                nextEl.style.transition = '';

                nextEl.classList.add('active-view');
                this.currentView = viewId;

                // Smooth scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Set animating false after CSS animation finishes
                setTimeout(() => {
                    this.isAnimating = false;
                }, 600);
            } else {
                this.isAnimating = false;
            }
        },

        handleUserClick() {
            if (this.isLoggedIn) {
                const dropdown = document.getElementById('user-dropdown');
                dropdown.classList.toggle('active');
            } else {
                this.showLoginModal();
            }
        },

        logout() {
            this.isLoggedIn = false;
            this.currentUser = null;
            document.getElementById('display-username').innerHTML = '<i class="fa-regular fa-user" style="margin-right: 5px;"></i> LOG IN';
            document.getElementById('user-dropdown').classList.remove('active');

            const modal = document.getElementById('login-modal');
            modal.style.display = 'flex';
            modal.querySelector('.modal-content').innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fa-solid fa-right-from-bracket" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
                    <h3>Sesión Cerrada</h3>
                    <p style="margin-top: 10px; color: var(--text-muted);">Has cerrado sesión exitosamente.</p>
                </div>
            `;
            setTimeout(() => {
                this.closeLoginModal();
                setTimeout(() => location.reload(), 200);
            }, 1000);
        },

        upgradePlan(planId, planName, price) {
            const phoneInput = document.getElementById(`phone-plan-` + planId).value;
            if (!phoneInput || phoneInput.length < 9) {
                alert('Por favor, ingresa un número de celular válido para continuar con la suscripción a ' + planName + '.');
                return;
            }

            if (confirm(`¿Deseas confirmar la compra del plan ` + planName + ` por $` + price + `/mes usando el teléfono ` + phoneInput + `?`)) {
                alert('¡Suscripción actualizada a ' + planName + ' con éxito! Tu cobertura está activa.');

                // Actualizar interfaz del perfil
                const badge = document.querySelector('.profile-badge');
                badge.textContent = 'Plan ' + planName;
                if (planId === 2) {
                    badge.style.background = '#F59E0B'; // Gold for premium
                    badge.style.color = '#fff';
                } else {
                    badge.style.background = 'var(--primary)';
                    badge.style.color = '#fff';
                }

                // Limpiar inputs
                document.getElementById('phone-plan-1').value = '';
                document.getElementById('phone-plan-2').value = '';
            }
        },

        showLoginModal() {
            const modal = document.getElementById('login-modal');
            modal.style.display = 'flex';
            // Reflow
            modal.offsetHeight;
            modal.classList.add('active');
        },

        closeLoginModal() {
            const modal = document.getElementById('login-modal');
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                // Reset to login view on close
                this.switchAuthMode('login');
                // Clear inputs
                document.getElementById('login-username').value = '';
                document.getElementById('login-password').value = '';
                document.getElementById('reg-username').value = '';
                document.getElementById('reg-password').value = '';
            }, 300);
        },

        switchAuthMode(mode) {
            const loginSec = document.getElementById('login-section');
            const regSec = document.getElementById('register-section');
            if (mode === 'register') {
                loginSec.style.display = 'none';
                regSec.style.display = 'block';
            } else {
                loginSec.style.display = 'block';
                regSec.style.display = 'none';
            }
        },

        submitAuth(mode) {
            let user = '';
            if (mode === 'login') {
                user = document.getElementById('login-username').value;
            } else if (mode === 'register') {
                user = document.getElementById('reg-username').value;
                alert('¡Cuenta creada con éxito! Bienvenido ' + user);
            }

            if (user.trim() !== '') {
                this.isLoggedIn = true;
                this.currentUser = user.trim().toUpperCase();
                document.getElementById('display-username').innerHTML = `<i class="fa-regular fa-user" style="margin-right: 5px;"></i> ${this.currentUser}`;
                document.getElementById('dropdown-name').textContent = this.currentUser;

                const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.currentUser)}&background=0D8ABC&color=fff&rounded=true`;
                if (document.getElementById('dropdown-avatar')) {
                    document.getElementById('dropdown-avatar').src = avatarUrl;
                }
                if (document.getElementById('profile-avatar')) {
                    document.getElementById('profile-avatar').src = avatarUrl + '&size=120';
                    document.getElementById('profile-name-title').textContent = this.currentUser;
                    document.getElementById('profile-email').textContent = `${user.trim().toLowerCase()}@correo.com`;
                }

                this.closeLoginModal();

                if (this.pendingView) {
                    this.navigateTo(this.pendingView);
                    this.pendingView = null;
                }
            } else {
                alert("Por favor ingresa un valor válido.");
            }
        },

        startPreview(element) {
            const video = element.querySelector('.preview-video');
            if (video) {
                video.play().catch(e => console.log('Autoplay prevent:', e));
                video.style.opacity = '1';
            }
        },

        stopPreview(element) {
            const video = element.querySelector('.preview-video');
            if (video) {
                video.pause();
                video.currentTime = 0.001; // reset closely to start for frame keeping
            }
        },

        submitForm() {
            const btn = document.getElementById('btn-submit-contact');
            const originalText = btn.innerText;

            // Loading state
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ENVIANDO...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                // Success state
                btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡MENSAJE ENVIADO!';
                btn.style.background = '#10B981';
                btn.style.borderColor = '#10B981';
                btn.style.color = '#FFFFFF';

                setTimeout(() => {
                    // Reset form and UI
                    document.getElementById('contact-form').reset();
                    btn.innerText = originalText;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                    btn.style.color = '';
                    btn.style.opacity = '';
                    btn.disabled = false;

                    // Go back to Home/Grid
                    this.navigateTo('grid');
                }, 2500);
            }, 1500);
        }
    };

    // Expose app to global scope for inline handlers
    window.app = app;

    // Add subtle staggered entrance animations to grid cards on load
    const animateCardsIn = () => {
        const cards = document.querySelectorAll('.video-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(40px)';

            // Staggered entry
            setTimeout(() => {
                card.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';

                // Remove inline transition after animation to allow hover effects to take over properly
                setTimeout(() => {
                    card.style.transition = '';
                }, 600);
            }, 100 + (index * 150));
        });
    };

    // Initial animation
    setTimeout(animateCardsIn, 200);

    // Ensure all videos show a static first frame natively without javascript generation (bypassing local CORS canvas errors)
    const videos = document.querySelectorAll('.preview-video');
    videos.forEach(video => {
        video.style.opacity = '1'; // keep visible by default
    });
});
