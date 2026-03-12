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
                    return new Response(JSON.stringify({ deleted, edited, editedFull }), {
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
                        await env.KV_NOTICIAS.put('edited_announcements', JSON.stringify(edited));
                        return new Response(JSON.stringify({ success: true, message: 'Anuncio editado' }), { status: 200 });
                    }

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

        // Serve Static Assets (HTML, CSS, JS) from KV or direct Worker response
        // For simplicity since it's just 3 files, we'll map them from the local env during build or rely on Cloudflare Pages.
        // However, if the user deployed this as a standard Worker (`npx wrangler deploy`), 
        // the static assets won't be served automatically without an assets setup.
        // Returning 404 for unknown routes to not break standard behavior if used via standard Pages routing.
        return env.ASSETS.fetch(request);
    }
};
