import re

with open('C:/Users/juanp/.gemini/antigravity/scratch/rcn_web/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

new_html = """            <div class="grid-container">
                <!-- Video 1 -->
                <article class="video-card" onclick="app.requireAuthAndNavigate('video-1')" onmouseenter="app.startPreview(this)" onmouseleave="app.stopPreview(this)" role="button" tabindex="0">
                    <div class="video-thumbnail">
                        <video class="preview-video" muted playsinline loop style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;">
                            <source src="assets/video_prueba_1.mp4#t=0.1" type="video/mp4">
                        </video>
                        <i class="fa-solid fa-play play-icon" style="z-index: 2;"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-badge">NUEVO</div>
                        <h3 class="news-summary-title">Rescate en la montaña</h3>
                        <p class="news-summary-text">Equipos especiales lograron rescatar a un grupo de excursionistas perdidos durante la tormenta del fin de semana...</p>
                        <div class="read-more">Leer más <i class="fa-solid fa-arrow-right"></i></div>
                    </div>
                </article>
                <!-- Video 2 -->
                <article class="video-card" onclick="app.requireAuthAndNavigate('video-2')" onmouseenter="app.startPreview(this)" onmouseleave="app.stopPreview(this)" role="button" tabindex="0">
                    <div class="video-thumbnail">
                        <video class="preview-video" muted playsinline loop style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;">
                            <source src="assets/video_prueba_2.mp4#t=0.1" type="video/mp4">
                        </video>
                        <i class="fa-solid fa-play play-icon" style="z-index: 2;"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-badge">TENDENCIA</div>
                        <h3 class="news-summary-title">Nuevo parque ecológico</h3>
                        <p class="news-summary-text">La ciudad inaugura un inmenso espacio verde con energía solar, lagos artificiales y senderos interactivos...</p>
                        <div class="read-more">Leer más <i class="fa-solid fa-arrow-right"></i></div>
                    </div>
                </article>
                <!-- Video 3 -->
                <article class="video-card" onclick="app.requireAuthAndNavigate('video-3')" onmouseenter="app.startPreview(this)" onmouseleave="app.stopPreview(this)" role="button" tabindex="0">
                    <div class="video-thumbnail">
                        <video class="preview-video" muted playsinline loop style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;">
                            <source src="assets/video_prueba_3.mp4#t=0.1" type="video/mp4">
                        </video>
                        <i class="fa-solid fa-play play-icon" style="z-index: 2;"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-badge">DESTACADO</div>
                        <h3 class="news-summary-title">Avances en tecnología espacial</h3>
                        <p class="news-summary-text">Científicos presentan un revolucionario motor que podría reducir los tiempos de viaje a Marte a la mitad...</p>
                        <div class="read-more">Leer más <i class="fa-solid fa-arrow-right"></i></div>
                    </div>
                </article>
            </div>

            <h2 style="text-align:center; margin-bottom: 2.5rem; color: var(--text-main); font-size: 2.2rem; font-weight: 800;">Más Noticias</h2>
            <div class="grid-container">
                <!-- Video 4 -->
                <article class="video-card" onclick="app.requireAuthAndNavigate('video-4')" onmouseenter="app.startPreview(this)" onmouseleave="app.stopPreview(this)" role="button" tabindex="0">
                    <div class="video-thumbnail">
                        <video class="preview-video" muted playsinline loop style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;">
                            <source src="assets/video_prueba_4.mp4#t=0.1" type="video/mp4">
                        </video>
                        <i class="fa-solid fa-play play-icon" style="z-index: 2;"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-badge">INTERNACIONAL</div>
                        <h3 class="news-summary-title">Acuerdo de conservación</h3>
                        <p class="news-summary-text">Varias naciones logran un importante acuerdo para proteger arrecifes coralinos clave en la región oceánica del sur.</p>
                        <div class="read-more">Leer más <i class="fa-solid fa-arrow-right"></i></div>
                    </div>
                </article>
                <!-- Video 5 -->
                <article class="video-card" onclick="app.requireAuthAndNavigate('video-5')" onmouseenter="app.startPreview(this)" onmouseleave="app.stopPreview(this)" role="button" tabindex="0">
                    <div class="video-thumbnail">
                        <video class="preview-video" muted playsinline loop style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;">
                            <source src="assets/video_prueba_5.mp4#t=0.1" type="video/mp4">
                        </video>
                        <i class="fa-solid fa-play play-icon" style="z-index: 2;"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-badge">DEPORTES</div>
                        <h3 class="news-summary-title">Victoria histórica</h3>
                        <p class="news-summary-text">El equipo nacional remonta en el último minuto coronándose campeón continental tras 15 años de sequía.</p>
                        <div class="read-more">Leer más <i class="fa-solid fa-arrow-right"></i></div>
                    </div>
                </article>
                <!-- Video 6 -->
                <article class="video-card" onclick="app.requireAuthAndNavigate('video-6')" onmouseenter="app.startPreview(this)" onmouseleave="app.stopPreview(this)" role="button" tabindex="0">
                    <div class="video-thumbnail">
                        <video class="preview-video" muted playsinline loop style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;">
                            <source src="assets/video_prueba_6.mp4#t=0.1" type="video/mp4">
                        </video>
                        <i class="fa-solid fa-play play-icon" style="z-index: 2;"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-badge">SALUD</div>
                        <h3 class="news-summary-title">Hallazgos en nutrición</h3>
                        <p class="news-summary-text">Expertos descubren que un componente del cacao podría reducir significativamente el estrés oxidativo.</p>
                        <div class="read-more">Leer más <i class="fa-solid fa-arrow-right"></i></div>
                    </div>
                </article>
                <!-- Video 7 -->
                <article class="video-card" onclick="app.requireAuthAndNavigate('video-7')" onmouseenter="app.startPreview(this)" onmouseleave="app.stopPreview(this)" role="button" tabindex="0">
                    <div class="video-thumbnail">
                        <video class="preview-video" muted playsinline loop style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;">
                            <source src="assets/video_prueba_7.mp4#t=0.1" type="video/mp4">
                        </video>
                        <i class="fa-solid fa-play play-icon" style="z-index: 2;"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-badge">ECONOMÍA</div>
                        <h3 class="news-summary-title">Bolsa en récord histórico</h3>
                        <p class="news-summary-text">Los mercados financieros cierran la semana con el mayor crecimiento de la década tras recientes anuncios.</p>
                        <div class="read-more">Leer más <i class="fa-solid fa-arrow-right"></i></div>
                    </div>
                </article>
                <!-- Video 8 -->
                <article class="video-card" onclick="app.requireAuthAndNavigate('video-8')" onmouseenter="app.startPreview(this)" onmouseleave="app.stopPreview(this)" role="button" tabindex="0">
                    <div class="video-thumbnail">
                        <video class="preview-video" muted playsinline loop style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;">
                            <source src="assets/video_prueba_8.mp4#t=0.1" type="video/mp4">
                        </video>
                        <i class="fa-solid fa-play play-icon" style="z-index: 2;"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-badge">CINE</div>
                        <h3 class="news-summary-title">Estreno de época</h3>
                        <p class="news-summary-text">La tan esperada secuela rompe todas las taquillas en su primer día de proyección en América Latina.</p>
                        <div class="read-more">Leer más <i class="fa-solid fa-arrow-right"></i></div>
                    </div>
                </article>
                <!-- Video 9 -->
                <article class="video-card" onclick="app.requireAuthAndNavigate('video-9')" onmouseenter="app.startPreview(this)" onmouseleave="app.stopPreview(this)" role="button" tabindex="0">
                    <div class="video-thumbnail">
                        <video class="preview-video" muted playsinline loop style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;">
                            <source src="assets/video_prueba_9.mp4#t=0.1" type="video/mp4">
                        </video>
                        <i class="fa-solid fa-play play-icon" style="z-index: 2;"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-badge">LOCAL</div>
                        <h3 class="news-summary-title">Renovación urbana</h3>
                        <p class="news-summary-text">El municipio presenta el plan oficial para peatonalizar y modernizar las avenidas céntricas.</p>
                        <div class="read-more">Leer más <i class="fa-solid fa-arrow-right"></i></div>
                    </div>
                </article>
                <!-- Video 10 -->
                <article class="video-card" onclick="app.requireAuthAndNavigate('video-10')" onmouseenter="app.startPreview(this)" onmouseleave="app.stopPreview(this)" role="button" tabindex="0">
                    <div class="video-thumbnail">
                        <video class="preview-video" muted playsinline loop style="position: absolute; width: 100%; height: 100%; object-fit: cover; z-index: 1;">
                            <source src="assets/video_prueba_10.mp4#t=0.1" type="video/mp4">
                        </video>
                        <i class="fa-solid fa-play play-icon" style="z-index: 2;"></i>
                    </div>
                    <div class="card-content">
                        <div class="card-badge">TECNOLOGÍA</div>
                        <h3 class="news-summary-title">Inteligencia Artificial</h3>
                        <p class="news-summary-text">Expertos debaten los avances agigantados de los nuevos modelos neuronales y su impacto ético social.</p>
                        <div class="read-more">Leer más <i class="fa-solid fa-arrow-right"></i></div>
                    </div>
                </article>
            </div>"""

html = re.sub(r'<div class="carousel-section".*?</button>\n\s*</div>', new_html, html, flags=re.DOTALL)

with open('C:/Users/juanp/.gemini/antigravity/scratch/rcn_web/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
