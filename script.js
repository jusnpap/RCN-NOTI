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
        currentPlanId: 0,
        role: 'USER',
        adminModeActive: false,
        pendingView: null,

        updateUserBadge() {
            const premiumSection = document.getElementById('premium-articles-section');
            if (!this.isLoggedIn) {
                document.getElementById('display-username').innerHTML = '<i class="fa-regular fa-user" style="margin-right: 5px;"></i> LOG IN';
                if (premiumSection) premiumSection.style.display = 'none';
                this.renderAdminControls();
                return;
            }

            let badgeHtml = '';
            if (this.currentPlanId === 2) {
                badgeHtml = ' <span style="background: #F59E0B; color: white; padding: 2px 6px; border-radius: 12px; font-size: 0.7rem; vertical-align: middle; margin-left: 5px; font-weight: bold; letter-spacing: 0;"><i class="fa-solid fa-crown"></i> VIP</span>';
                if (premiumSection) premiumSection.style.display = 'block';
            } else {
                if (premiumSection) premiumSection.style.display = 'none';
            }

            document.getElementById('display-username').innerHTML = `<i class="fa-regular fa-user" style="margin-right: 5px;"></i> ${this.currentUser}${badgeHtml}`;
            document.getElementById('dropdown-name').innerHTML = `${this.currentUser}${badgeHtml}`;

            let adminToggle = document.getElementById('admin-toggle-btn');
            if (this.role === 'ADMIN') {
                if (!adminToggle) {
                    adminToggle = document.createElement('button');
                    adminToggle.id = 'admin-toggle-btn';
                    adminToggle.className = 'btn-profile';
                    adminToggle.style.color = '#3B82F6';
                    adminToggle.innerHTML = '<i class="fa-solid fa-tools"></i> ADMINISTRAR ANUNCIOS';
                    adminToggle.onclick = () => {
                        this.toggleAdminMode();
                    };
                    const btnProfile = document.querySelector('.btn-profile');
                    if (btnProfile) {
                        btnProfile.parentNode.insertBefore(adminToggle, btnProfile.nextSibling);
                    }
                }
            } else {
                if (adminToggle) adminToggle.remove();
                this.adminModeActive = false;
            }

            this.renderAdminControls();
        },

        toggleAdminMode() {
            this.adminModeActive = !this.adminModeActive;
            this.renderAdminControls();
            document.getElementById('user-dropdown').classList.remove('active');
            alert(this.adminModeActive ? 'Modo Administrador activado. Ahora puedes ver los botones de edición en cada anuncio.' : 'Modo Administrador desactivado.');
        },

        requireAuthAndNavigate(viewId) {
            if (this.isLoggedIn) {
                this.navigateTo(viewId);
            } else {
                this.pendingView = viewId;
                this.showLoginModal();
            }
        },

        navigateTo(viewId) {
            if (viewId.startsWith('premium-') && this.currentPlanId !== 2) {
                alert('Este contenido es exclusivo para usuarios con Plan Premium RCN. Adquiere el plan para continuar.');
                this.navigateTo('profile');
                return;
            }
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
            this.currentPlanId = 0;
            this.role = 'USER';

            localStorage.removeItem('rcn_auth_user');
            localStorage.removeItem('rcn_auth_role');
            localStorage.removeItem('rcn_auth_plan');

            this.updateUserBadge();
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

        closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        },

        openEditProfile() {
            if (!this.isLoggedIn) {
                this.pendingView = 'profile';
                this.showLoginModal();
                return;
            }

            document.getElementById('edit-name').value = this.currentUser || '';
            const currentEmail = document.getElementById('profile-email').textContent;
            document.getElementById('edit-email').value = currentEmail !== 'Cargando...' ? currentEmail : '';
            const currentPhone = document.getElementById('profile-phone').textContent;
            document.getElementById('edit-phone').value = currentPhone !== 'Sin registrar' ? currentPhone : '';
            document.getElementById('edit-password').value = '';

            const modal = document.getElementById('edit-profile-modal');
            modal.style.display = 'flex';
            modal.offsetHeight; // Reflow
            modal.classList.add('active');
        },

        saveProfile() {
            const newName = document.getElementById('edit-name').value;
            const newEmail = document.getElementById('edit-email').value;
            const newPhone = document.getElementById('edit-phone').value;

            if (newName.trim()) {
                this.currentUser = newName.trim().toUpperCase();
                document.getElementById('profile-name-title').textContent = this.currentUser;
                this.updateUserBadge();
            }

            if (newEmail.trim()) {
                document.getElementById('profile-email').textContent = newEmail.trim().toLowerCase();
            }

            if (newPhone.trim()) {
                document.getElementById('profile-phone').textContent = newPhone.trim();
            }

            alert('Información de perfil actualizada con éxito.');
            this.closeModal('edit-profile-modal');
        },

        openCheckout(planId, planName, price) {
            if (!this.isLoggedIn) {
                this.pendingView = 'profile';
                this.showLoginModal();
                return;
            }

            this.currentCheckoutPlan = { id: planId, name: planName, price: price };
            document.getElementById('checkout-plan-name').textContent = planName;
            document.getElementById('checkout-plan-price').textContent = `$${price}/mes`;

            document.getElementById('checkout-card').value = '';
            document.getElementById('checkout-exp').value = '';
            document.getElementById('checkout-cvv').value = '';

            const currentPhone = document.getElementById('profile-phone').textContent;
            document.getElementById('checkout-phone').value = currentPhone !== 'Sin registrar' ? currentPhone : '';

            const modal = document.getElementById('checkout-modal');
            modal.style.display = 'flex';
            modal.offsetHeight; // Reflow
            modal.classList.add('active');
        },

        processCheckout() {
            const cardInput = document.getElementById('checkout-card').value;
            const expInput = document.getElementById('checkout-exp').value;
            const cvvInput = document.getElementById('checkout-cvv').value;
            const phoneInput = document.getElementById('checkout-phone').value;

            if (!cardInput || cardInput.length < 15) {
                alert('Por favor, ingresa un número de tarjeta válido.');
                return;
            }
            if (!expInput || !cvvInput) {
                alert('Por favor, completa los datos de la tarjeta.');
                return;
            }
            if (!phoneInput || phoneInput.length < 8) {
                alert('Por favor, ingresa un número de celular válido para continuar.');
                return;
            }

            alert('¡Pago procesado con éxito! Ahora disfrutas del plan ' + this.currentCheckoutPlan.name + '.');

            this.currentPlanId = this.currentCheckoutPlan.id;
            this.updateUserBadge();

            if (document.getElementById('profile-phone').textContent === 'Sin registrar') {
                document.getElementById('profile-phone').textContent = phoneInput;
            }

            const badge = document.getElementById('profile-badge');
            badge.textContent = 'Plan ' + this.currentCheckoutPlan.name;
            if (this.currentCheckoutPlan.id === 2) {
                badge.style.background = '#F59E0B'; // Gold for premium
                badge.style.color = '#fff';
            } else {
                badge.style.background = 'var(--primary)';
                badge.style.color = '#fff';
            }

            this.closeModal('checkout-modal');
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
            let pwd = '';
            if (mode === 'login') {
                user = document.getElementById('login-username').value;
                pwd = document.getElementById('login-password').value;
            } else if (mode === 'register') {
                user = document.getElementById('reg-username').value;
                pwd = document.getElementById('reg-password').value;
                alert('¡Cuenta creada con éxito! Bienvenido ' + user);
            }

            if (user.trim() !== '') {
                this.isLoggedIn = true;
                this.currentUser = user.trim().toUpperCase();

                const userNameLower = user.trim().toLowerCase();
                if ((userNameLower === 'juanp_nanrvaez' || userNameLower === 'juanp_narvaez') && pwd === 'Noviembre25') {
                    this.role = 'ADMIN';
                } else {
                    this.role = 'USER';
                }

                localStorage.setItem('rcn_auth_user', this.currentUser);
                localStorage.setItem('rcn_auth_role', this.role);
                localStorage.setItem('rcn_auth_plan', this.currentPlanId);

                this.updateUserBadge();

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

        renderAdminControls() {
            const cards = document.querySelectorAll('.video-card');
            cards.forEach(card => {
                const existingControls = card.querySelector('.admin-controls');
                if (existingControls) existingControls.remove();

                if (this.role === 'ADMIN' && this.adminModeActive) {
                    const controls = document.createElement('div');
                    controls.className = 'admin-controls';
                    controls.style.position = 'absolute';
                    controls.style.top = '10px';
                    controls.style.right = '10px';
                    controls.style.zIndex = '10';
                    controls.style.display = 'flex';
                    controls.style.gap = '8px';

                    const btnEdit = document.createElement('button');
                    btnEdit.innerHTML = '<i class="fa-solid fa-pen"></i>';
                    btnEdit.style.background = '#3B82F6';
                    btnEdit.style.color = 'white';
                    btnEdit.style.border = 'none';
                    btnEdit.style.width = '36px';
                    btnEdit.style.height = '36px';
                    btnEdit.style.borderRadius = '50%';
                    btnEdit.style.cursor = 'pointer';
                    btnEdit.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                    btnEdit.title = "Editar Anuncio";
                    btnEdit.onclick = (e) => {
                        e.stopPropagation();
                        this.openEditAnnouncement(card.getAttribute('data-id'));
                    };

                    const btnDelete = document.createElement('button');
                    btnDelete.innerHTML = '<i class="fa-solid fa-trash"></i>';
                    btnDelete.style.background = '#EF4444';
                    btnDelete.style.color = 'white';
                    btnDelete.style.border = 'none';
                    btnDelete.style.width = '36px';
                    btnDelete.style.height = '36px';
                    btnDelete.style.borderRadius = '50%';
                    btnDelete.style.cursor = 'pointer';
                    btnDelete.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
                    btnDelete.title = "Eliminar Anuncio";
                    btnDelete.onclick = (e) => {
                        e.stopPropagation();
                        this.deleteAnnouncement(card.getAttribute('data-id'));
                    };

                    controls.appendChild(btnEdit);
                    controls.appendChild(btnDelete);
                    card.appendChild(controls);

                    if (window.getComputedStyle(card).position === 'static') {
                        card.style.position = 'relative';
                    }
                }
            });
        },

        deleteAnnouncement(id) {
            if (confirm('¿Estás seguro de que quieres eliminar este anuncio para siempre?')) {
                const card = document.querySelector(`.video-card[data-id="${id}"]`);
                if (card) {
                    card.style.display = 'none';
                }

                // Fallback local storage
                let deletedIds = JSON.parse(localStorage.getItem('rcn_deleted_announcements') || '[]');
                if (!deletedIds.includes(id)) {
                    deletedIds.push(id);
                    localStorage.setItem('rcn_deleted_announcements', JSON.stringify(deletedIds));
                }

                // Cloudflare KV Sync
                fetch('/api/announcements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'delete', id: id })
                }).catch(err => console.error('Error syncing delete to Cloudflare KV:', err));
            }
        },

        openEditAnnouncement(id) {
            const card = document.querySelector(`.video-card[data-id="${id}"]`);
            if (!card) return;

            const title = card.querySelector('.news-summary-title')?.textContent || '';
            const desc = card.querySelector('.news-summary-text')?.textContent || '';
            const badge = card.querySelector('.card-badge')?.textContent || '';

            let imgUrl = '';
            const imgElement = card.querySelector('img');
            const videoElement = card.querySelector('video source');

            if (imgElement) {
                imgUrl = imgElement.src;
            } else if (videoElement) {
                // If it's a video, we might show a placeholder or its poster.
                imgUrl = '';
            }

            document.getElementById('edit-announcement-id').value = id;
            document.getElementById('edit-announcement-title').value = title;
            document.getElementById('edit-announcement-desc').value = desc;
            document.getElementById('edit-announcement-badge').value = badge;
            document.getElementById('edit-announcement-img').value = imgUrl;

            const modal = document.getElementById('edit-announcement-modal');
            modal.style.display = 'flex';
            modal.offsetHeight; // Reflow
            modal.classList.add('active');
        },

        saveAnnouncementEdit() {
            const id = document.getElementById('edit-announcement-id').value;
            const title = document.getElementById('edit-announcement-title').value;
            const desc = document.getElementById('edit-announcement-desc').value;
            const badgeTxt = document.getElementById('edit-announcement-badge').value;
            const imgUrl = document.getElementById('edit-announcement-img').value;

            const card = document.querySelector(`.video-card[data-id="${id}"]`);
            if (card) {
                if (card.querySelector('.news-summary-title')) card.querySelector('.news-summary-title').textContent = title;
                if (card.querySelector('.news-summary-text')) card.querySelector('.news-summary-text').textContent = desc;

                const badgeEl = card.querySelector('.card-badge');
                if (badgeEl) {
                    if (badgeTxt.trim().length > 0) {
                        badgeEl.textContent = badgeTxt;
                        badgeEl.style.display = 'inline-block';
                    } else {
                        badgeEl.style.display = 'none';
                    }
                }

                if (imgUrl.trim().length > 0) {
                    const thumbContainer = card.querySelector('.video-thumbnail');
                    if (thumbContainer) {
                        const oldVideo = thumbContainer.querySelector('video');
                        const oldImg = thumbContainer.querySelector('img');
                        if (oldVideo) oldVideo.remove();
                        if (oldImg) oldImg.remove();
                        const oldIcon = thumbContainer.querySelector('.play-icon, .fa-newspaper, .fa-chart-line, .fa-microscope');

                        const newImg = document.createElement('img');
                        newImg.src = imgUrl;
                        newImg.style.position = 'absolute';
                        newImg.style.width = '100%';
                        newImg.style.height = '100%';
                        newImg.style.objectFit = 'cover';
                        newImg.style.zIndex = '1';
                        newImg.style.borderRadius = 'var(--radius-md) var(--radius-md) 0 0';
                        thumbContainer.insertBefore(newImg, thumbContainer.firstChild);

                        // Push old icons behind or adjust z-index
                        if (oldIcon && oldIcon.classList.contains('play-icon')) {
                            oldIcon.style.zIndex = '2';
                        }
                    }
                }
            }

            // Fallback Local Storage
            let edited = JSON.parse(localStorage.getItem('rcn_edited_announcements') || '{}');
            edited[id] = { title, desc, badgeTxt, imgUrl };
            localStorage.setItem('rcn_edited_announcements', JSON.stringify(edited));

            // Cloudflare KV Sync
            fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'edit', id, title, desc, badgeTxt, imgUrl })
            }).catch(err => console.error('Error syncing edit to Cloudflare KV:', err));

            this.closeModal('edit-announcement-modal');
        },

        async applySavedAnnouncements() {
            try {
                // First try to fetch from Cloudflare KV database
                const response = await fetch('/api/announcements');
                if (response.ok) {
                    const data = await response.json();

                    // Sync locally so there's always a backup
                    if (data.deleted && data.deleted.length > 0) {
                        localStorage.setItem('rcn_deleted_announcements', JSON.stringify(data.deleted));
                    }
                    if (data.edited && Object.keys(data.edited).length > 0) {
                        localStorage.setItem('rcn_edited_announcements', JSON.stringify(data.edited));
                    }
                }
            } catch (error) {
                console.warn('Could not fetch from Cloudflare KV, falling back to local storage', error);
            }

            // Apply from Local Storage (which now has KV data if fetch succeeded)
            const deletedIds = JSON.parse(localStorage.getItem('rcn_deleted_announcements') || '[]');
            deletedIds.forEach(id => {
                const card = document.querySelector(`.video-card[data-id="${id}"]`);
                if (card) {
                    card.style.display = 'none';
                }
            });

            const edited = JSON.parse(localStorage.getItem('rcn_edited_announcements') || '{}');
            for (const [id, data] of Object.entries(edited)) {
                const card = document.querySelector(`.video-card[data-id="${id}"]`);
                if (card) {
                    if (card.querySelector('.news-summary-title')) card.querySelector('.news-summary-title').textContent = data.title;
                    if (card.querySelector('.news-summary-text')) card.querySelector('.news-summary-text').textContent = data.desc;

                    const badgeEl = card.querySelector('.card-badge');
                    if (badgeEl) {
                        if (data.badgeTxt.trim().length > 0) {
                            badgeEl.textContent = data.badgeTxt;
                            badgeEl.style.display = 'inline-block';
                        } else {
                            badgeEl.style.display = 'none';
                        }
                    }

                    if (data.imgUrl && data.imgUrl.trim().length > 0) {
                        const thumbContainer = card.querySelector('.video-thumbnail');
                        if (thumbContainer) {
                            const oldVideo = thumbContainer.querySelector('video');
                            const oldImg = thumbContainer.querySelector('img');
                            if (oldVideo) oldVideo.remove();
                            if (oldImg) oldImg.remove();

                            const newImg = document.createElement('img');
                            newImg.src = data.imgUrl;
                            newImg.style.position = 'absolute';
                            newImg.style.width = '100%';
                            newImg.style.height = '100%';
                            newImg.style.objectFit = 'cover';
                            newImg.style.zIndex = '1';
                            newImg.style.borderRadius = 'var(--radius-md) var(--radius-md) 0 0';
                            thumbContainer.insertBefore(newImg, thumbContainer.firstChild);
                        }
                    }
                }
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

    // Restore session and Apply saved changes
    const savedUser = localStorage.getItem('rcn_auth_user');
    const savedRole = localStorage.getItem('rcn_auth_role');
    const savedPlan = localStorage.getItem('rcn_auth_plan');

    if (savedUser) {
        app.isLoggedIn = true;
        app.currentUser = savedUser;
        app.role = savedRole || 'USER';
        app.currentPlanId = parseInt(savedPlan) || 0;
        app.updateUserBadge();
    }

    app.applySavedAnnouncements();

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
