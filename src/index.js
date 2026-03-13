export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // API Routes for Database
        if (url.pathname === '/api/announcements') {
            if (request.method === 'GET') {
                try {
                    const deleted = await env.KV_NOTICIAS.get('deleted_announcements', { type: 'json' }) || [];
                    const edited = await env.KV_NOTICIAS.get('edited_announcements', { type: 'json' }) || {};
                    const editedFull = await env.KV_NOTICIAS.get('edited_full_articles', { type: 'json' }) || {};
                    const banner = await env.KV_NOTICIAS.get('rcn_saved_banner', { type: 'json' });
                    return new Response(JSON.stringify({ deleted, edited, editedFull, banner }), {
                        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
                    });
                } catch (error) {
                    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
                }
            }

            if (request.method === 'POST') {
                try {
                    const data = await request.json();

                    if (data.action === 'edit') {
                        let edited = await env.KV_NOTICIAS.get('edited_announcements', { type: 'json' }) || {};
                        edited[data.id] = {
                            title: data.title,
                            desc: data.desc,
                            badgeTxt: data.badgeTxt,
                            imgUrl: data.imgUrl,
                            videoUrl: data.videoUrl
                        };
                        
                        // Handle R2 if available for large videos
                        if (data.videoUrl && data.videoUrl.length > 5 * 1024 * 1024 && env.R2_NOTICIAS) {
                            // This is a simplified logic, ideally we stream the body
                            // For now we persist the URL/Data to KV as before but warn about size
                        }

                        await env.KV_NOTICIAS.put('edited_announcements', JSON.stringify(edited));
                        return new Response(JSON.stringify({ success: true, message: 'Anuncio editado' }), { status: 200 });
                    }

                    if (data.action === 'edit_banner') {
                        const bannerData = { 
                            text: data.text, 
                            bg: data.bg,
                            imgData: data.imgData 
                        };
                        await env.KV_NOTICIAS.put('rcn_saved_banner', JSON.stringify(bannerData));
                        return new Response(JSON.stringify({ success: true, message: 'Banner actualizado' }), { status: 200 });
                    }
                    
                    // ... other actions

                    if (data.action === 'edit_full') {
                        let editedFull = await env.KV_NOTICIAS.get('edited_full_articles', { type: 'json' }) || {};
                        editedFull[data.id] = {
                            title: data.title,
                            content: data.content
                        };
                        await env.KV_NOTICIAS.put('edited_full_articles', JSON.stringify(editedFull));
                        return new Response(JSON.stringify({ success: true, message: 'Artículo completo editado' }), { status: 200 });
                    }

                    if (data.action === 'delete') {
                        let deleted = await env.KV_NOTICIAS.get('deleted_announcements', { type: 'json' }) || [];
                        if (!deleted.includes(data.id)) {
                            deleted.push(data.id);
                            await env.KV_NOTICIAS.put('deleted_announcements', JSON.stringify(deleted));
                        }
                        return new Response(JSON.stringify({ success: true, message: 'Anuncio eliminado' }), { status: 200 });
                    }

                    if (data.action === 'edit_banner') {
                        const bannerData = { text: data.text, bg: data.bg };
                        await env.KV_NOTICIAS.put('rcn_saved_banner', JSON.stringify(bannerData));
                        return new Response(JSON.stringify({ success: true, message: 'Banner actualizado' }), { status: 200 });
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
