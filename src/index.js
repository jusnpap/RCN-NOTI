export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // API Routes for Database
        if (url.pathname === '/api/announcements') {
            if (request.method === 'GET') {
                try {
                    const deleted = await env.KV_NOTICIAS.get('deleted_announcements', { type: 'json' }) || [];
                    const banner = await env.KV_NOTICIAS.get('rcn_saved_banner', { type: 'json' });

                    // Fetch all individual card edits in parallel
                    const cardList = await env.KV_NOTICIAS.list({ prefix: 'card:' });
                    const edited = {};
                    const cardPromises = cardList.keys.map(async (key) => {
                        const id = key.name.replace('card:', '');
                        const data = await env.KV_NOTICIAS.get(key.name, { type: 'json' });
                        if (data) edited[id] = data;
                    });

                    // Fetch all individual full article edits in parallel
                    const fullList = await env.KV_NOTICIAS.list({ prefix: 'full:' });
                    const editedFull = {};
                    const fullPromises = fullList.keys.map(async (key) => {
                        const id = key.name.replace('full:', '');
                        const data = await env.KV_NOTICIAS.get(key.name, { type: 'json' });
                        if (data) editedFull[id] = data;
                    });

                    await Promise.all([...cardPromises, ...fullPromises]);

                    // Also check legacy keys for compatibility
                    const legacyEdited = await env.KV_NOTICIAS.get('edited_announcements', { type: 'json' }) || {};
                    const legacyFull = await env.KV_NOTICIAS.get('edited_full_articles', { type: 'json' }) || {};

                    return new Response(JSON.stringify({ 
                        deleted, 
                        banner, 
                        edited: { ...legacyEdited, ...edited }, 
                        editedFull: { ...legacyFull, ...editedFull } 
                    }), {
                        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                    });
                } catch (error) {
                    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
                }
            }

            if (request.method === 'POST') {
                try {
                    const data = await request.json();

                    // 1. Edit Card (Individual Key)
                    if (data.action === 'edit') {
                        const existing = await env.KV_NOTICIAS.get(`card:${data.id}`, { type: 'json' }) || {};
                        const cardData = {
                            title: data.title || existing.title,
                            desc: data.desc || existing.desc,
                            badgeTxt: data.badgeTxt !== undefined ? data.badgeTxt : existing.badgeTxt,
                            imgUrl: data.imgUrl || existing.imgUrl,
                            videoUrl: data.videoUrl || existing.videoUrl
                        };
                        await env.KV_NOTICIAS.put(`card:${data.id}`, JSON.stringify(cardData));
                        return new Response(JSON.stringify({ success: true, message: 'Anuncio guardado' }), { status: 200 });
                    }

                    // 2. Edit Full Article (Individual Key)
                    if (data.action === 'edit_full') {
                        const existing = await env.KV_NOTICIAS.get(`full:${data.id}`, { type: 'json' }) || {};
                        const fullData = {
                            title: data.title || existing.title,
                            content: data.content || existing.content,
                            videoUrl: data.videoUrl || existing.videoUrl
                        };
                        await env.KV_NOTICIAS.put(`full:${data.id}`, JSON.stringify(fullData));
                        return new Response(JSON.stringify({ success: true, message: 'Artículo guardado' }), { status: 200 });
                    }

                    // 3. Delete Announcement
                    if (data.action === 'delete') {
                        let deleted = await env.KV_NOTICIAS.get('deleted_announcements', { type: 'json' }) || [];
                        if (!deleted.includes(data.id)) {
                            deleted.push(data.id);
                            await env.KV_NOTICIAS.put('deleted_announcements', JSON.stringify(deleted));
                        }
                        // Cleanup individual keys
                        await env.KV_NOTICIAS.delete(`card:${data.id}`);
                        await env.KV_NOTICIAS.delete(`full:${data.id}`);
                        return new Response(JSON.stringify({ success: true, message: 'Anuncio eliminado' }), { status: 200 });
                    }

                    // 4. Edit Banner
                    if (data.action === 'edit_banner') {
                        const existing = await env.KV_NOTICIAS.get('rcn_saved_banner', { type: 'json' }) || {};
                        const bannerData = {
                            text: data.text || existing.text,
                            bg: data.bg || existing.bg,
                            imgData: data.imgData || existing.imgData
                        };
                        await env.KV_NOTICIAS.put('rcn_saved_banner', JSON.stringify(bannerData));
                        return new Response(JSON.stringify({ success: true, message: 'Banner actualizado' }), { status: 200 });
                    }

                    // 5. Bulk Video Update (Universal Video)
                    if (data.action === 'bulk_video_update') {
                        const { videoUrl, ids } = data;
                        if (!videoUrl || !ids || !Array.isArray(ids)) {
                            return new Response(JSON.stringify({ error: 'Faltan parámetros' }), { status: 400 });
                        }

                        const promises = ids.map(async (id) => {
                            const cardExisting = await env.KV_NOTICIAS.get(`card:${id}`, { type: 'json' }) || {};
                            await env.KV_NOTICIAS.put(`card:${id}`, JSON.stringify({ ...cardExisting, videoUrl }));
                            
                            const fullExisting = await env.KV_NOTICIAS.get(`full:${id}`, { type: 'json' }) || {};
                            await env.KV_NOTICIAS.put(`full:${id}`, JSON.stringify({ ...fullExisting, videoUrl }));
                        });

                        await Promise.all(promises);
                        return new Response(JSON.stringify({ success: true, message: 'Video aplicado masivamente' }), { status: 200 });
                    }

                    return new Response(JSON.stringify({ error: 'Action not supported' }), { status: 400 });
                } catch (error) {
                    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
                }
            }
        }

        if (url.pathname === '/api/messages') {
            if (request.method === 'GET') {
                try {
                    const messages = await env.KV_NOTICIAS.get('rcn_messages', { type: 'json' }) || [];
                    return new Response(JSON.stringify({ messages }), {
                        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                    });
                } catch (error) {
                    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
                }
            }
            if (request.method === 'POST') {
                try {
                    const data = await request.json();
                    if (data.action === 'send') {
                        let messages = await env.KV_NOTICIAS.get('rcn_messages', { type: 'json' }) || [];
                        messages.push({
                            id: Date.now(),
                            name: data.name,
                            email: data.email,
                            message: data.message,
                            date: new Date().toLocaleString()
                        });
                        await env.KV_NOTICIAS.put('rcn_messages', JSON.stringify(messages));
                        return new Response(JSON.stringify({ success: true, message: 'Mensaje enviado' }), { status: 200 });
                    }
                    if (data.action === 'delete') {
                        let messages = await env.KV_NOTICIAS.get('rcn_messages', { type: 'json' }) || [];
                        messages = messages.filter(m => String(m.id) !== String(data.id));
                        await env.KV_NOTICIAS.put('rcn_messages', JSON.stringify(messages));
                        return new Response(JSON.stringify({ success: true, message: 'Mensaje eliminado' }), { status: 200 });
                    }
                    return new Response(JSON.stringify({ error: 'Action not supported' }), { status: 400 });
                } catch (error) {
                    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
                }
            }
        }

        // Serve Static Assets with SEO Rewriting
        const response = await env.ASSETS.fetch(request);
        
        // Only rewrite if it's an HTML response
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('text/html')) {
            const articleId = url.searchParams.get('id') || 'home';
            
            // Professional Default Tags
            let seoTitle = "RCN Noticias - Información de Última Hora";
            let seoDesc = "Actualidad, deportes y entretenimiento con la mayor veracidad.";
            let seoImg = "https://rcn-noticias.pages.dev/assets/logo.png"; // Fallback to logo

            if (articleId === 'video-8') {
                seoTitle = "Descubrimiento Arqueológico en el Amazonas | RCN";
                seoDesc = "Una civilización avanzada oculta por siglos sale a la luz.";
                seoImg = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200";
            }

            return new HTMLRewriter()
                .on('title', {
                    element(e) { e.setInnerContent(seoTitle); }
                })
                .on('meta[name="description"]', {
                    element(e) { e.setAttribute('content', seoDesc); }
                })
                .on('head', {
                    element(e) {
                        e.append(`<meta property="og:title" content="${seoTitle}">`, { html: true });
                        e.append(`<meta property="og:description" content="${seoDesc}">`, { html: true });
                        e.append(`<meta property="og:image" content="${seoImg}">`, { html: true });
                        e.append(`<meta property="og:type" content="website">`, { html: true });
                        e.append(`<meta name="twitter:card" content="summary_large_image">`, { html: true });
                    }
                })
                .transform(response);
        }

        return response;
    }
};
