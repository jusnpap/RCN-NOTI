export async function onRequestGet(context) {
    try {
        const deleted = await context.env.KV_NOTICIAS.get('deleted_announcements', { type: 'json' }) || [];
        const banner = await context.env.KV_NOTICIAS.get('rcn_saved_banner', { type: 'json' });

        // Fetch all individual card edits in parallel
        const cardList = await context.env.KV_NOTICIAS.list({ prefix: 'card:' });
        const edited = {};
        const cardPromises = cardList.keys.map(async (key) => {
            const id = key.name.replace('card:', '');
            const data = await context.env.KV_NOTICIAS.get(key.name, { type: 'json' });
            if (data) edited[id] = data;
        });

        // Fetch all individual full article edits in parallel
        const fullList = await context.env.KV_NOTICIAS.list({ prefix: 'full:' });
        const editedFull = {};
        const fullPromises = fullList.keys.map(async (key) => {
            const id = key.name.replace('full:', '');
            const data = await context.env.KV_NOTICIAS.get(key.name, { type: 'json' });
            if (data) editedFull[id] = data;
        });

        await Promise.all([...cardPromises, ...fullPromises]);

        // Also check legacy keys for compatibility during transition
        const legacyEdited = await context.env.KV_NOTICIAS.get('edited_announcements', { type: 'json' }) || {};
        const legacyFull = await context.env.KV_NOTICIAS.get('edited_full_articles', { type: 'json' }) || {};

        return new Response(JSON.stringify({ 
            deleted, 
            banner,
            edited: { ...legacyEdited, ...edited }, 
            editedFull: { ...legacyFull, ...editedFull } 
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function onRequestPost(context) {
    if (context.request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

    try {
        const data = await context.request.json();

        // 1. Edit Card (Individual Key)
        if (data.action === 'edit') {
            const existing = await context.env.KV_NOTICIAS.get(`card:${data.id}`, { type: 'json' }) || {};
            const cardData = {
                title: data.title || existing.title,
                desc: data.desc || existing.desc,
                badgeTxt: data.badgeTxt !== undefined ? data.badgeTxt : existing.badgeTxt,
                imgUrl: data.imgUrl || existing.imgUrl,
                videoUrl: data.videoUrl || existing.videoUrl
            };
            await context.env.KV_NOTICIAS.put(`card:${data.id}`, JSON.stringify(cardData));
            return new Response(JSON.stringify({ success: true, message: 'Anuncio guardado' }), { status: 200 });
        }

        // 2. Edit Full Article (Individual Key)
        if (data.action === 'edit_full') {
            const existing = await context.env.KV_NOTICIAS.get(`full:${data.id}`, { type: 'json' }) || {};
            const fullData = {
                title: data.title || existing.title,
                content: data.content || existing.content,
                videoUrl: data.videoUrl || existing.videoUrl
            };
            await context.env.KV_NOTICIAS.put(`full:${data.id}`, JSON.stringify(fullData));
            return new Response(JSON.stringify({ success: true, message: 'Artículo guardado' }), { status: 200 });
        }

        // 3. Delete Announcement
        if (data.action === 'delete') {
            let deleted = await context.env.KV_NOTICIAS.get('deleted_announcements', { type: 'json' }) || [];
            if (!deleted.includes(data.id)) {
                deleted.push(data.id);
                await context.env.KV_NOTICIAS.put('deleted_announcements', JSON.stringify(deleted));
            }
            // Cleanup individual keys
            await context.env.KV_NOTICIAS.delete(`card:${data.id}`);
            await context.env.KV_NOTICIAS.delete(`full:${data.id}`);
            return new Response(JSON.stringify({ success: true, message: 'Anuncio eliminado' }), { status: 200 });
        }

        if (data.action === 'edit_banner') {
            const existing = await context.env.KV_NOTICIAS.get('rcn_saved_banner', { type: 'json' }) || {};
            const bannerData = {
                text: data.text || existing.text,
                bg: data.bg || existing.bg,
                imgData: data.imgData || existing.imgData
            };
            await context.env.KV_NOTICIAS.put('rcn_saved_banner', JSON.stringify(bannerData));
            return new Response(JSON.stringify({ success: true, message: 'Banner actualizado' }), { status: 200 });
        }

        // 5. Bulk Video Update (Universal Video)
        if (data.action === 'bulk_video_update') {
            const { videoUrl, ids } = data;
            if (!videoUrl || !ids || !Array.isArray(ids)) {
                return new Response(JSON.stringify({ error: 'Faltan parámetros para actualización masiva' }), { status: 400 });
            }

            const promises = ids.map(async (id) => {
                // Update Card
                const cardExisting = await context.env.KV_NOTICIAS.get(`card:${id}`, { type: 'json' }) || {};
                await context.env.KV_NOTICIAS.put(`card:${id}`, JSON.stringify({ ...cardExisting, videoUrl }));
                
                // Update Full Article
                const fullExisting = await context.env.KV_NOTICIAS.get(`full:${id}`, { type: 'json' }) || {};
                await context.env.KV_NOTICIAS.put(`full:${id}`, JSON.stringify({ ...fullExisting, videoUrl }));
            });

            await Promise.all(promises);
            return new Response(JSON.stringify({ success: true, message: 'Video aplicado a todas las noticias' }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: 'Action not supported' }), { status: 400 });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
