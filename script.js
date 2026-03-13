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

    // Close user dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown && dropdown.classList.contains('active')) {
            if (!e.target.closest('.user-menu-container')) {
                dropdown.classList.remove('active');
            }
        }
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

            // Actualizar credencial de perfil
            const profileBadge = document.getElementById('profile-badge');
            if (profileBadge) {
                if (this.currentPlanId === 2) {
                    profileBadge.textContent = 'Plan Premium RCN';
                    profileBadge.style.background = '#F59E0B';
                    profileBadge.style.color = '#fff';
                } else if (this.currentPlanId === 1) {
                    profileBadge.textContent = 'Plan Estándar';
                    profileBadge.style.background = 'var(--primary)';
                    profileBadge.style.color = '#fff';
                } else {
                    profileBadge.textContent = 'Plan Básico';
                    profileBadge.style.background = 'var(--bg-secondary)';
                    profileBadge.style.color = 'var(--text-main)';
                }
            }

            let adminToggle = document.getElementById('admin-toggle-btn');
            const loginBtn = document.getElementById('nav-login-btn');

            if (loginBtn) {
                loginBtn.style.display = this.isLoggedIn ? 'none' : 'inline-block';
            }

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
                    const btnSettings = document.querySelector('.btn-profile i.fa-gear').parentNode;
                    if (btnSettings) {
                        btnSettings.parentNode.insertBefore(adminToggle, btnSettings.nextSibling);
                    }
                }

                // Add Messages Inbox toggle
                let msgToggle = document.getElementById('admin-msgs-btn');
                if (!msgToggle) {
                    msgToggle = document.createElement('button');
                    msgToggle.id = 'admin-msgs-btn';
                    msgToggle.className = 'btn-profile';
                    msgToggle.style.color = '#10B981';
                    msgToggle.innerHTML = '<i class="fa-solid fa-inbox"></i> BANDEJA DE MENSAJES';
                    msgToggle.onclick = () => {
                        this.openMessagesModal();
                        document.getElementById('user-dropdown').classList.remove('active');
                    };
                    const btnSettings = document.querySelector('.btn-profile i.fa-gear').parentNode;
                    if (btnSettings) {
                        btnSettings.parentNode.insertBefore(msgToggle, btnSettings.nextSibling);
                    }
                }

                // Add Banner Admin toggle
                let bannerToggle = document.getElementById('admin-banner-btn');
                if (!bannerToggle) {
                    bannerToggle = document.createElement('button');
                    bannerToggle.id = 'admin-banner-btn';
                    bannerToggle.className = 'btn-profile';
                    bannerToggle.style.color = '#F59E0B';
                    bannerToggle.innerHTML = '<i class="fa-solid fa-image"></i> ADMINISTRAR BANNER';
                    bannerToggle.onclick = () => {
                        this.openBannerModal();
                        document.getElementById('user-dropdown').classList.remove('active');
                    };
                    const btnSettings = document.querySelector('.btn-profile i.fa-gear').parentNode;
                    if (btnSettings) {
                        btnSettings.parentNode.insertBefore(bannerToggle, btnSettings.nextSibling);
                    }
                }
            } else {
                if (adminToggle) adminToggle.remove();
                this.adminModeActive = false;

                let msgToggle = document.getElementById('admin-msgs-btn');
                if (msgToggle) msgToggle.remove();

                let bannerToggle = document.getElementById('admin-banner-btn');
                if (bannerToggle) bannerToggle.remove();
            }

            this.renderAdminControls();
            this.renderFullEditButtons();
            this.renderDownloadButtons();
        },

        renderFullEditButtons() {
            // Remove previous edit buttons
            document.querySelectorAll('.btn-edit-full').forEach(btn => btn.remove());

            if (this.role === 'ADMIN') {
                document.querySelectorAll('.video-detail-container').forEach(container => {
                    const articleId = container.closest('section').id.replace('view-', '');

                    const editBtn = document.createElement('button');
                    editBtn.className = 'btn-edit-full';
                    editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> EDITAR ARTÍCULO COMPLETO';
                    editBtn.onclick = () => this.openFullArticleModal(articleId);

                    const titleBar = container.querySelector('.video-title-bar');
                    if (titleBar) {
                        titleBar.parentNode.insertBefore(editBtn, titleBar.nextSibling);
                    }
                });
            }
        },

        renderDownloadButtons() {
            document.querySelectorAll('.btn-download-pdf-dynamic').forEach(btn => btn.remove());

            if (this.currentPlanId === 2 || this.role === 'ADMIN') {
                document.querySelectorAll('.video-detail-container').forEach(container => {
                    // Evitar duplicar en los que ya tienen el boton estaticamente (Premium)
                    const hasStaticBtn = !!Array.from(container.querySelectorAll('button')).find(btn => btn.textContent.includes('Descargar PDF'));

                    if (!hasStaticBtn) {
                        const downloadContainer = document.createElement('div');
                        downloadContainer.className = 'btn-download-pdf-dynamic';
                        downloadContainer.style.textAlign = 'center';
                        downloadContainer.style.marginTop = '2rem';
                        downloadContainer.style.marginBottom = '1.5rem';

                        const btn = document.createElement('button');
                        btn.className = 'btn-primary';
                        btn.style.background = 'var(--accent-blue)';
                        btn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Descargar PDF del Artículo';
                        btn.onclick = () => app.downloadPDF(container);

                        downloadContainer.appendChild(btn);

                        // Insertar antes del botón de Volver
                        const volverBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent.includes('Volver'));
                        if (volverBtn) {
                            volverBtn.parentNode.insertBefore(downloadContainer, volverBtn);
                        } else {
                            container.appendChild(downloadContainer);
                        }
                    }
                });
            }
        },

        openFullArticleModal(id) {
            const section = document.getElementById(`view-${id}`);
            if (!section) return;

            const title = section.querySelector('.video-brand')?.textContent || '';
            const content = section.querySelector('.video-description')?.innerHTML || '';

            document.getElementById('full-edit-id').value = id;
            document.getElementById('full-edit-title').value = title;
            // Clean up extra spaces/newlines for the textarea
            document.getElementById('full-edit-content').value = content.trim();

            const modal = document.getElementById('edit-full-article-modal');
            modal.style.display = 'flex';
            modal.offsetHeight;
            modal.classList.add('active');
        },

        async saveFullArticle() {
            const id = document.getElementById('full-edit-id').value;
            const newTitle = document.getElementById('full-edit-title').value;
            const newContent = document.getElementById('full-edit-content').value;
            const videoInput = document.getElementById('full-edit-video');

            let videoUrl = '';

            if (videoInput && videoInput.files && videoInput.files[0]) {
                const file = videoInput.files[0];
                // Increase limit to ~50MB or inform about R2 if possible
                // For now just allow larger files up to 50MB (KV limit is 25, but user wants more)
                // We'll warn if it exceeds 25MB but let the user try if they have R2 logic (which we'll add)
                if (file.size > 100 * 1024 * 1024) {
                    alert("El archivo de video es demasiado grande. Límite máximo aumentado a 100MB (Requiere R2).");
                    return;
                }

                try {
                    videoUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = e => resolve(e.target.result);
                        reader.onerror = e => reject(e);
                        reader.readAsDataURL(file);
                    });
                } catch (e) {
                    console.error("No se pudo leer el archivo de video", e);
                    alert("Hubo un error procesando el archivo de video.");
                    return;
                }
            }

            const section = document.getElementById(`view-${id}`);
            if (section) {
                if (section.querySelector('.video-brand')) section.querySelector('.video-brand').textContent = newTitle;
                if (section.querySelector('.video-description')) section.querySelector('.video-description').innerHTML = newContent;

                if (videoUrl.trim().length > 0) {
                    const playerContainer = section.querySelector('.main-video-player');
                    if (playerContainer) {
                        let videoEl = playerContainer.querySelector('video');
                        if (!videoEl) {
                            videoEl = document.createElement('video');
                            videoEl.className = 'plyr-video';
                            videoEl.setAttribute('playsinline', '');
                            videoEl.setAttribute('controls', '');
                            videoEl.style.width = '100%';
                            playerContainer.appendChild(videoEl);
                        }

                        while (videoEl.firstChild) {
                            videoEl.removeChild(videoEl.firstChild);
                        }

                        const source = document.createElement('source');
                        source.src = videoUrl;
                        videoEl.appendChild(source);
                        videoEl.load();
                    }
                }
            }

            // Fallback Local Storage
            let editedFull = JSON.parse(localStorage.getItem('rcn_edited_full_articles') || '{}');
            editedFull[id] = { title: newTitle, content: newContent, videoUrl: videoUrl };
            localStorage.setItem('rcn_edited_full_articles', JSON.stringify(editedFull));

            // Cloudflare KV Sync (Will handle gracefully if endpoint doesn't support it yet)
            fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'edit_full', id, title: newTitle, content: newContent, videoUrl: videoUrl })
            }).catch(err => console.error('Error syncing full article to Cloudflare KV:', err));

            this.closeModal('edit-full-article-modal');
            alert("Artículo modificado exitosamente.");
        },

        importTextFromFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const ext = file.name.split('.').pop().toLowerCase();
            const textArea = document.getElementById('full-edit-content');

            const formatTextToHTML = (rawText) => {
                // Remove existing html if any (unlikely from raw text, but good practice)
                let text = rawText.replace(/</g, '&lt;').replace(/>/g, '&gt;');

                // Split by double newlines to find potential paragraphs
                const paragraphs = text.split(/\n\s*\n/);

                const formatted = paragraphs.map(p => {
                    const trimmed = p.trim();
                    if (!trimmed) return '';
                    // If it's a short line, it might be a title/subtitle
                    if (trimmed.length < 80 && !trimmed.endsWith('.')) {
                        return `<h3><strong>${trimmed}</strong></h3>`;
                    }
                    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
                }).filter(p => p !== '');

                return formatted.join('\n\n');
            };

            if (ext === 'pdf') {
                if (typeof pdfjsLib === 'undefined') {
                    alert('La librería PDF no ha cargado correctamente.');
                    return;
                }
                const fileReader = new FileReader();
                fileReader.onload = async function () {
                    const typedarray = new Uint8Array(this.result);
                    try {
                        const loadingTask = pdfjsLib.getDocument(typedarray);
                        const pdf = await loadingTask.promise;
                        let fullText = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            // PDF.js lines are individual items. We try to guess line breaks if items have large Y gaps
                            let lastY = -1;
                            let pageText = '';
                            for (const item of textContent.items) {
                                if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 12) {
                                    pageText += '\n'; // Add newline for significant vertical jump
                                }
                                pageText += item.str;
                                lastY = item.transform[5];
                            }
                            fullText += pageText + '\n\n';
                        }

                        const htmlVersion = formatTextToHTML(fullText);

                        if (textArea.value.trim() !== '') {
                            textArea.value += '\n\n' + htmlVersion;
                        } else {
                            textArea.value = htmlVersion;
                        }
                        alert('Texto de PDF formateado y extraído exitosamente.');
                    } catch (err) {
                        console.error(err);
                        alert('No se pudo extraer el texto del PDF.');
                    }
                };
                fileReader.readAsArrayBuffer(file);
            } else if (ext === 'doc' || ext === 'docx') {
                if (typeof mammoth === 'undefined') {
                    alert('La librería de Word no ha cargado correctamente.');
                    return;
                }
                const fileReader = new FileReader();
                fileReader.onload = function (e) {
                    const arrayBuffer = e.target.result;
                    // mammoth can extract HTML directly which is better
                    mammoth.convertToHtml({ arrayBuffer: arrayBuffer })
                        .then(function (result) {
                            const html = result.value; // The generated HTML
                            if (textArea.value.trim() !== '') {
                                textArea.value += '\n\n' + html.trim();
                            } else {
                                textArea.value = html.trim();
                            }
                            alert('Texto de Word formateado extraído exitosamente.');
                        })
                        .catch(function (err) {
                            console.error(err);
                            alert('No se pudo extraer el texto del documento Word.');
                        });
                };
                fileReader.readAsArrayBuffer(file);
            } else {
                alert('Formato no soportado. Sube un PDF o Word (.docx).');
            }
        },

        downloadPDF(container) {
            const titleEl = container.querySelector('.video-brand');
            const descEl = container.querySelector('.video-description');

            if (!titleEl || !descEl || !window.jspdf) {
                alert('No se pudo encontrar el contenido para descargar o la librería PDF no cargó.');
                return;
            }

            const eventObj = window.event;
            const btn = (eventObj && eventObj.currentTarget) || (container.querySelector('.fa-file-pdf') ? container.querySelector('.fa-file-pdf').closest('button') : null);
            let originalHTML = '';
            if (btn) {
                originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generando PDF...';
                btn.disabled = true;
            }

            // small timeout to allow UI update
            setTimeout(() => {
                try {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF({
                        orientation: 'portrait',
                        unit: 'mm',
                        format: 'a4'
                    });

                    const margin = 20;
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const maxLineWidth = pageWidth - margin * 2;
                    let cursorY = 20;

                    // Brand Watermark
                    doc.setTextColor(245, 220, 220); // Very light red
                    doc.setFontSize(50);
                    doc.setFont('helvetica', 'bold');
                    doc.text('RCN PREMIUM', pageWidth / 2, 140, { angle: 45, align: 'center' });

                    // Title
                    doc.setTextColor(230, 57, 70); // Red
                    doc.setFontSize(22);
                    doc.setFont('helvetica', 'bold');
                    const title = titleEl.textContent.trim();
                    const titleLines = doc.splitTextToSize(title, maxLineWidth);
                    doc.text(titleLines, margin, cursorY);
                    cursorY += (titleLines.length * 10);

                    // Separator Line
                    doc.setDrawColor(230, 57, 70);
                    doc.setLineWidth(0.5);
                    doc.line(margin, cursorY - 4, pageWidth - margin, cursorY - 4);
                    cursorY += 10;

                    // Text Content
                    doc.setTextColor(30, 41, 59); // Dark grey
                    doc.setFontSize(12);
                    doc.setFont('helvetica', 'normal');

                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = descEl.innerHTML.replace(/<\/p>/gi, '\n\n').replace(/<br\s*[\/]?>/gi, '\n');
                    const cleanText = tempDiv.textContent || tempDiv.innerText || "";

                    const contentLines = doc.splitTextToSize(cleanText.trim(), maxLineWidth);

                    contentLines.forEach(line => {
                        if (cursorY > pageHeight - 30) {
                            doc.addPage();
                            cursorY = 20;
                            // Re-draw watermark on new page
                            doc.setTextColor(245, 220, 220);
                            doc.setFontSize(50);
                            doc.setFont('helvetica', 'bold');
                            doc.text('RCN PREMIUM', pageWidth / 2, 140, { angle: 45, align: 'center' });
                            doc.setTextColor(30, 41, 59);
                            doc.setFontSize(12);
                            doc.setFont('helvetica', 'normal');
                        }
                        doc.text(line, margin, cursorY);
                        cursorY += 7;
                    });

                    // Footer
                    cursorY += 15;
                    if (cursorY > pageHeight - 20) {
                        doc.addPage();
                        cursorY = 20;
                    }
                    doc.setDrawColor(203, 213, 225);
                    doc.line(margin, cursorY, pageWidth - margin, cursorY);
                    cursorY += 8;

                    doc.setTextColor(100, 116, 139);
                    doc.setFontSize(9);
                    doc.text(`Descargado desde RCN Noticias. Usuario: ${this.currentUser || 'Invitado'}.`, pageWidth / 2, cursorY, { align: 'center' });
                    doc.text('Todos los derechos reservados.', pageWidth / 2, cursorY + 5, { align: 'center' });

                    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
                    doc.save(filename);

                } catch (err) {
                    console.error('PDF generation error:', err);
                    alert('Hubo un error al generar el PDF de forma directa.');
                } finally {
                    if (btn) {
                        btn.innerHTML = originalHTML;
                        btn.disabled = false;
                    }
                }
            }, 100);
        },

        openSettingsModal() {
            const modal = document.getElementById('settings-modal');
            modal.style.display = 'flex';
            modal.offsetHeight;
            modal.classList.add('active');
        },

        closeSettingsModal() {
            this.closeModal('settings-modal');
        },

        changeTheme(theme) {
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
                localStorage.setItem('rcn_theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('rcn_theme', 'light');
            }
        },

        changeTextSize(size) {
            document.documentElement.style.fontSize = size + 'px';
            document.getElementById('text-size-display').textContent = size + 'px';
            localStorage.setItem('rcn_text_size', size);
        },

        changeGlobalVolume(vol) {
            // Apply volume to native videos
            document.querySelectorAll('video').forEach(video => {
                video.volume = vol;
            });
            // Apply to Plyr players by accessing their instance if possible, or trigger their API
            window.players?.forEach(p => {
                p.volume = vol;
            });
            localStorage.setItem('rcn_volume', vol);
        },

        toggleAdminMode() {
            this.adminModeActive = !this.adminModeActive;
            this.renderAdminControls();
            document.getElementById('user-dropdown').classList.remove('active');
            alert(this.adminModeActive ? 'Modo Administrador activado. Ahora puedes ver los botones de edición en cada anuncio.' : 'Modo Administrador desactivado.');
        },

        requireAuthAndNavigate(viewId) {
            if (this.isLoggedIn) {
                // Instead of just this.navigateTo, let's update the hash so it's consistent
                window.location.hash = viewId;
                this.navigateTo(viewId);
            } else {
                this.pendingView = viewId;
                this.showLoginModal();
            }
        },

        navigateTo(viewId) {
            if (viewId.startsWith('premium-') && this.currentPlanId !== 2) {
                alert('Este contenido VIP es exclusivo para usuarios con Plan Premium RCN. Adquiere el plan para continuar.');
                this.navigateTo('profile');
                return;
            }

            const standardExclusive = ['video-4', 'video-5', 'video-6', 'video-7', 'video-8', 'video-9', 'video-10'];
            if (standardExclusive.includes(viewId) && this.currentPlanId < 1) {
                alert('Este artículo extendido es exclusivo para usuarios con Plan Estándar o superior. Sube de nivel para leerlo.');
                this.navigateTo('profile');
                return;
            }

            if (this.currentView === viewId || this.isAnimating) return;

            window.location.hash = viewId;
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

        formatCardNumber(input) {
            let val = input.value.replace(/\D/g, ''); // remove non-digits
            let newVal = '';
            for (let i = 0; i < val.length; i++) {
                if (i > 0 && i % 4 === 0) newVal += ' ';
                newVal += val[i];
            }
            input.value = newVal;
        },

        formatExpiry(input) {
            let val = input.value.replace(/\D/g, '');
            if (val.length >= 2) {
                input.value = val.substring(0, 2) + '/' + val.substring(2, 4);
            } else {
                input.value = val;
            }
        },

        formatCVV(input) {
            input.value = input.value.replace(/\D/g, '');
            if (input.value.length > 4) {
                input.value = input.value.substring(0, 4);
            }
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
            // Guardar permanentemente la suscripción para la sesión actual
            localStorage.setItem('rcn_auth_plan', this.currentPlanId);

            // Gurdar el plan específicamente en la cuenta del usuario para no perderlo al cambiar de sesión
            if (this.role !== 'ADMIN' && this.currentUser) {
                let registeredUsers = JSON.parse(localStorage.getItem('rcn_registered_users') || '{}');
                const userNameLower = this.currentUser.toLowerCase();
                if (registeredUsers[userNameLower]) {
                    registeredUsers[userNameLower].planId = this.currentPlanId;
                    localStorage.setItem('rcn_registered_users', JSON.stringify(registeredUsers));
                }
            }

            this.updateUserBadge();

            if (document.getElementById('profile-phone').textContent === 'Sin registrar') {
                document.getElementById('profile-phone').textContent = phoneInput;
            }

            const badge = document.getElementById('profile-badge');
            badge.textContent = 'Plan ' + this.currentCheckoutPlan.name;
            if (this.currentCheckoutPlan.id === 2 || this.role === 'ADMIN') {
                badge.style.background = '#F59E0B'; // Gold for premium
                badge.style.color = '#fff';
            } else {
                badge.style.background = 'var(--primary)';
                badge.style.color = '#fff';
            }

            this.closeModal('checkout-modal');

            // Refrescar para asegurar que la UI Premium aparezca
            setTimeout(() => {
                this.navigateTo('grid');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 500);
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
            }

            if (!user.trim() || !pwd.trim()) {
                alert('Por favor, completa todos los campos para ingresar.');
                return;
            }

            const userNameLower = user.trim().toLowerCase();
            const isAdmin = (userNameLower === 'juanp_nanrvaez' || userNameLower === 'juanp_narvaez') && pwd === 'Noviembre25';

            let registeredUsers = JSON.parse(localStorage.getItem('rcn_registered_users') || '{}');

            if (mode === 'register') {
                if (registeredUsers[userNameLower] || isAdmin) {
                    alert('Este nombre de usuario ya está registrado o no está disponible.');
                    return;
                }
                registeredUsers[userNameLower] = { pwd: pwd, planId: 0 };
                localStorage.setItem('rcn_registered_users', JSON.stringify(registeredUsers));
                alert('¡Cuenta creada con éxito! Bienvenido ' + user);
            } else if (mode === 'login') {
                if (!isAdmin) {
                    if (!registeredUsers[userNameLower]) {
                        alert('Este usuario no existe. Por favor, regístrate primero.');
                        return;
                    }
                    if (registeredUsers[userNameLower].pwd !== pwd) {
                        alert('Contraseña incorrecta.');
                        return;
                    }
                }
            }

            this.isLoggedIn = true;
            this.currentUser = user.trim().toUpperCase();

            if (isAdmin) {
                this.role = 'ADMIN';
                this.currentPlanId = 2; // Auto-grant Premium plan to Admin
            } else {
                this.role = 'USER';
                this.currentPlanId = registeredUsers[userNameLower].planId || 0;
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
            } else {
                this.updateUserBadge();
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

        async saveAnnouncementEdit() {
            const id = document.getElementById('edit-announcement-id').value;
            const title = document.getElementById('edit-announcement-title').value;
            const desc = document.getElementById('edit-announcement-desc').value;
            const badgeTxt = document.getElementById('edit-announcement-badge').value;
            const imgUrl = document.getElementById('edit-announcement-img').value;
            const videoInput = document.getElementById('edit-announcement-video');

            let videoUrl = '';

            if (videoInput.files && videoInput.files[0]) {
                const file = videoInput.files[0];
                if (file.size > 100 * 1024 * 1024) { // Increased limit
                    alert("El archivo de video es demasiado grande. Límite máximo aumentado a 100MB.");
                    return;
                }

                try {
                    videoUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = e => resolve(e.target.result);
                        reader.onerror = e => reject(e);
                        reader.readAsDataURL(file);
                    });
                } catch (e) {
                    console.error("No se pudo leer el archivo de video", e);
                    alert("Hubo un error procesando el archivo de video.");
                    return;
                }
            }

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

                const thumbContainer = card.querySelector('.video-thumbnail');
                if (thumbContainer) {
                    const oldIcon = thumbContainer.querySelector('.play-icon, .fa-newspaper, .fa-chart-line, .fa-microscope');
                    if (oldIcon && oldIcon.classList.contains('play-icon')) {
                        oldIcon.style.zIndex = '2';
                    }

                    if (videoUrl.trim().length > 0) {
                        const oldImg = thumbContainer.querySelector('img');
                        if (oldImg) oldImg.remove();

                        let videoEl = thumbContainer.querySelector('video');
                        if (!videoEl) {
                            videoEl = document.createElement('video');
                            videoEl.className = 'preview-video';
                            videoEl.muted = true;
                            videoEl.playsInline = true;
                            videoEl.loop = true;
                            videoEl.style.position = 'absolute';
                            videoEl.style.width = '100%';
                            videoEl.style.height = '100%';
                            videoEl.style.objectFit = 'cover';
                            videoEl.style.zIndex = '1';
                            thumbContainer.insertBefore(videoEl, thumbContainer.firstChild);
                        }

                        while (videoEl.firstChild) {
                            videoEl.removeChild(videoEl.firstChild);
                        }

                        const source = document.createElement('source');
                        source.src = videoUrl;
                        videoEl.appendChild(source);
                        videoEl.load();

                    } else if (imgUrl.trim().length > 0) {
                        const oldVideo = thumbContainer.querySelector('video');
                        const oldImg = thumbContainer.querySelector('img');
                        if (oldVideo) oldVideo.remove();
                        if (oldImg) oldImg.remove();

                        const newImg = document.createElement('img');
                        newImg.src = imgUrl;
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

            let edited = JSON.parse(localStorage.getItem('rcn_edited_announcements') || '{}');
            edited[id] = { title: title, desc: desc, badgeTxt: badgeTxt, imgUrl: imgUrl, videoUrl: videoUrl };
            localStorage.setItem('rcn_edited_announcements', JSON.stringify(edited));

            fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'edit', id, title, desc, badgeTxt, imgUrl, videoUrl })
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
                    if (data.editedFull && Object.keys(data.editedFull).length > 0) {
                        localStorage.setItem('rcn_edited_full_articles', JSON.stringify(data.editedFull));
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

                    if (data.videoUrl && data.videoUrl.trim().length > 0) {
                        const thumbContainer = card.querySelector('.video-thumbnail');
                        if (thumbContainer) {
                            const oldImg = thumbContainer.querySelector('img');
                            if (oldImg) oldImg.remove();

                            let videoEl = thumbContainer.querySelector('video');
                            if (!videoEl) {
                                videoEl = document.createElement('video');
                                videoEl.className = 'preview-video';
                                videoEl.muted = true;
                                videoEl.playsInline = true;
                                videoEl.loop = true;
                                videoEl.style.position = 'absolute';
                                videoEl.style.width = '100%';
                                videoEl.style.height = '100%';
                                videoEl.style.objectFit = 'cover';
                                videoEl.style.zIndex = '1';
                                thumbContainer.insertBefore(videoEl, thumbContainer.firstChild);
                            }

                            while (videoEl.firstChild) {
                                videoEl.removeChild(videoEl.firstChild);
                            }

                            const source = document.createElement('source');
                            source.src = data.videoUrl;
                            videoEl.appendChild(source);
                            videoEl.load();
                        }
                    } else if (data.imgUrl && data.imgUrl.trim().length > 0) {
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

            // Apply Full Articles from Local Storage
            const editedFull = JSON.parse(localStorage.getItem('rcn_edited_full_articles') || '{}');
            for (const [id, data] of Object.entries(editedFull)) {
                const section = document.getElementById(`view-${id}`);
                if (section) {
                    if (section.querySelector('.video-brand')) section.querySelector('.video-brand').textContent = data.title;
                    if (section.querySelector('.video-description')) section.querySelector('.video-description').innerHTML = data.content;

                    if (data.videoUrl && data.videoUrl.trim().length > 0) {
                        const playerContainer = section.querySelector('.main-video-player');
                        if (playerContainer) {
                            let videoEl = playerContainer.querySelector('video');
                            if (!videoEl) {
                                videoEl = document.createElement('video');
                                videoEl.className = 'plyr-video';
                                videoEl.setAttribute('playsinline', '');
                                videoEl.setAttribute('controls', '');
                                videoEl.style.width = '100%';
                                playerContainer.appendChild(videoEl);
                            }

                            while (videoEl.firstChild) {
                                videoEl.removeChild(videoEl.firstChild);
                            }

                            const source = document.createElement('source');
                            source.src = data.videoUrl;
                            videoEl.appendChild(source);
                            videoEl.load();
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

        async submitForm() {
            const btn = document.getElementById('btn-submit-contact');
            const originalText = btn.innerText;

            // Loading state
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> ENVIANDO...';
            btn.style.opacity = '0.8';
            btn.disabled = true;

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const msg = document.getElementById('message').value;

            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'send', name, email, message: msg })
                });

                if (response.ok) {
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡MENSAJE ENVIADO!';
                    btn.style.background = '#10B981';
                    btn.style.borderColor = '#10B981';
                    btn.style.color = '#FFFFFF';

                    setTimeout(() => {
                        document.getElementById('contact-form').reset();
                        btn.innerText = originalText;
                        btn.style.background = '';
                        btn.style.borderColor = '';
                        btn.style.color = '';
                        btn.style.opacity = '';
                        btn.disabled = false;
                        app.navigateTo('grid');
                    }, 2500);
                } else {
                    throw new Error('Fallback');
                }
            } catch (err) {
                // Fallback to local storage
                let messages = JSON.parse(localStorage.getItem('rcn_messages') || '[]');
                messages.push({
                    id: Date.now(),
                    name: name,
                    email: email,
                    message: msg,
                    date: new Date().toLocaleString()
                });
                localStorage.setItem('rcn_messages', JSON.stringify(messages));

                btn.innerHTML = '<i class="fa-solid fa-check"></i> ¡ENVIADO (MODO LOCAL)!';
                setTimeout(() => {
                    document.getElementById('contact-form').reset();
                    btn.innerText = originalText;
                    btn.disabled = false;
                    app.navigateTo('grid');
                }, 2500);
            }
        },

        async openMessagesModal() {
            const modal = document.getElementById('messages-modal');
            const container = document.getElementById('messages-container');

            modal.style.display = 'flex';
            modal.offsetHeight;
            modal.classList.add('active');

            container.innerHTML = '<div style="text-align:center; padding: 2rem;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';

            let messages = JSON.parse(localStorage.getItem('rcn_messages') || '[]');

            try {
                const response = await fetch('/api/messages');
                if (response.ok) {
                    const data = await response.json();
                    if (data.messages && data.messages.length > 0) {
                        messages = data.messages;
                    }
                }
            } catch (err) {
                console.warn('Could not fetch global messages. Falling back to local storage.');
            }

            if (messages.length === 0) {
                container.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 2rem;">No hay mensajes nuevos.</p>`;
            } else {
                container.innerHTML = messages.reverse().map(msg => `
                    <div style="background: var(--bg-main); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-light); position: relative;">
                        <button onclick="app.deleteMessage('${msg.id}')" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: #EF4444; cursor: pointer; font-size: 1.1rem;" title="Eliminar mensaje">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; padding-right: 2rem;">
                            <strong style="color: var(--text-main); font-size: 1.1rem;">${msg.name}</strong>
                            <span style="font-size: 0.8rem; color: var(--text-muted);">${msg.date}</span>
                        </div>
                        <div style="font-size: 0.9rem; margin-bottom: 1rem; color: var(--primary);">${msg.email}</div>
                        <p style="color: var(--text-muted); line-height: 1.5; font-size: 0.95rem;">${msg.message}</p>
                    </div>
                `).join('');
            }
        },

        async deleteMessage(id) {
            if (!confirm('¿Seguro que quieres eliminar este mensaje?')) return;

            try {
                const response = await fetch('/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'delete', id: id })
                });

                if (response.ok) {
                    alert('Mensaje eliminado');
                    this.openMessagesModal(); // Refresh
                } else {
                    throw new Error('Fallback deletion');
                }
            } catch (err) {
                // Fallback local lookup
                let messages = JSON.parse(localStorage.getItem('rcn_messages') || '[]');
                messages = messages.filter(m => String(m.id) !== String(id));
                localStorage.setItem('rcn_messages', JSON.stringify(messages));
                alert('Mensaje eliminado (Modo Local)');
                this.openMessagesModal();
            }
        },

        openBannerModal() {
            const banner = document.getElementById('main-banner');
            const bannerText = document.getElementById('main-banner-text').textContent;
            
            // Get background color from inline style
            const bgColor = banner.style.backgroundColor || '#EF4444';

            document.getElementById('banner-edit-text').value = bannerText;
            document.getElementById('banner-edit-bg').value = this.rgbToHex(bgColor);

            const modal = document.getElementById('edit-banner-modal');
            modal.style.display = 'flex';
            modal.offsetHeight;
            modal.classList.add('active');
        },

        rgbToHex(rgb) {
            if (rgb.startsWith('#')) return rgb;
            const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if (!match) return '#EF4444';
            function hex(x) {
                return ("0" + parseInt(x).toString(16)).slice(-2);
            }
            return "#" + hex(match[1]) + hex(match[2]) + hex(match[3]);
        },

        async saveBanner() {
            const text = document.getElementById('banner-edit-text').value;
            const bg = document.getElementById('banner-edit-bg').value;
            const imgInput = document.getElementById('banner-edit-img');
            
            let imgData = '';

            if (imgInput.files && imgInput.files[0]) {
                const file = imgInput.files[0];
                try {
                    imgData = await this.resizeImage(file, 1200, 400);
                } catch (e) {
                    console.error('Error resizing banner image:', e);
                    alert('Error al procesar la imagen.');
                    return;
                }
            }

            const bannerData = { text, bg, imgData };

            // Apply to UI
            const banner = document.getElementById('main-banner');
            const bannerText = document.getElementById('main-banner-text');
            bannerText.textContent = text;
            banner.style.backgroundColor = bg;
            if (imgData) {
                banner.style.backgroundImage = `url(${imgData})`;
            }

            // Save to LocalStorage
            localStorage.setItem('rcn_saved_banner', JSON.stringify(bannerData));

            // Sync to Worker
            fetch('/api/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'edit_banner', ...bannerData })
            }).catch(err => console.error('Error syncing banner to KV:', err));

            this.closeModal('edit-banner-modal');
            alert('Banner actualizado exitosamente.');
        },

        resizeImage(file, maxWidth, maxHeight) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;

                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.85));
                    };
                    img.onerror = reject;
                };
                reader.onerror = reject;
            });
        },

        applySavedBanner() {
            let bannerData = JSON.parse(localStorage.getItem('rcn_saved_banner'));
            
            // Try to load from KV via announcements API if it's there
            fetch('/api/announcements').then(res => res.json()).then(data => {
                if (data.banner) {
                    bannerData = data.banner;
                    localStorage.setItem('rcn_saved_banner', JSON.stringify(bannerData));
                    this.renderBannerUI(bannerData);
                }
            }).catch(() => {});

            if (bannerData) {
                this.renderBannerUI(bannerData);
            }
        },

        renderBannerUI(data) {
            const banner = document.getElementById('main-banner');
            const bannerText = document.getElementById('main-banner-text');
            if (banner && bannerText) {
                if (data.text) bannerText.textContent = data.text;
                if (data.bg) banner.style.backgroundColor = data.bg;
                if (data.imgData) {
                    banner.style.backgroundImage = `url(${data.imgData})`;
                }
            }
        },

        initParticles() {
            const canvas = document.getElementById('particle-canvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            let particles = [];
            
            const resize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            };
            window.addEventListener('resize', resize);
            resize();

            class Particle {
                constructor(x, y) {
                    this.x = x;
                    this.y = y;
                    this.size = Math.random() * 3 + 1;
                    this.speedX = (Math.random() - 0.5) * 2;
                    this.speedY = (Math.random() - 0.5) * 2;
                    this.color = `rgba(255, 59, 63, ${Math.random() * 0.5 + 0.3})`;
                    this.life = 1;
                }
                update() {
                    this.x += this.speedX;
                    this.y += this.speedY;
                    this.life -= 0.01;
                    if (this.size > 0.1) this.size -= 0.02;
                }
                draw() {
                    ctx.fillStyle = this.color;
                    ctx.globalAlpha = this.life;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#FF3B3F';
                }
            }

            const handleMouseMove = (e) => {
                for (let i = 0; i < 3; i++) {
                    particles.push(new Particle(e.clientX, e.clientY));
                }
            };
            window.addEventListener('mousemove', handleMouseMove);

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < particles.length; i++) {
                    particles[i].update();
                    particles[i].draw();
                    if (particles[i].life <= 0) {
                        particles.splice(i, 1);
                        i--;
                    }
                }
                requestAnimationFrame(animate);
            };
            animate();
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

        // El administrador siempre recibe el plan premium por defecto, 
        // incluso si el localStorage viejo no lo tenía.
        if (app.role === 'ADMIN') {
            app.currentPlanId = 2;
        }

        app.updateUserBadge();
    }

    app.applySavedBanner();
    app.applySavedAnnouncements();
    app.initParticles();

    // Apply Settings
    const savedTheme = localStorage.getItem('rcn_theme');
    const savedSize = localStorage.getItem('rcn_text_size');
    const savedVol = localStorage.getItem('rcn_volume');

    if (savedTheme === 'dark') {
        app.changeTheme('dark');
        const themeSelect = document.getElementById('settings-theme');
        if (themeSelect) themeSelect.value = 'dark';
    }
    if (savedSize) {
        app.changeTextSize(savedSize);
        const sizeInput = document.getElementById('settings-text-size');
        if (sizeInput) sizeInput.value = savedSize;
    }
    if (savedVol) {
        app.changeGlobalVolume(savedVol);
        const volInput = document.getElementById('settings-volume');
        if (volInput) volInput.value = savedVol;
    }

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

    // Hash routing initialization
    const handleHash = () => {
        const hash = window.location.hash.substring(1);
        if (hash) {
            if (hash.startsWith('video-') || hash.startsWith('premium-')) {
                app.requireAuthAndNavigate(hash);
            } else {
                app.navigateTo(hash);
            }
        } else {
            // Default view
            if (app.currentView !== 'grid') app.navigateTo('grid');
        }
    };

    window.addEventListener('hashchange', handleHash);
    // Call on first load after a slight delay to ensure UI is ready
    setTimeout(handleHash, 50);
});
