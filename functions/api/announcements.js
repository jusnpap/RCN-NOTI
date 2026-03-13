export async function onRequestGet(context) {
    try {
        const deleted = await context.env.KV_NOTICIAS.get('deleted_announcements', { type: 'json' }) || [];
        const banner = await context.env.KV_NOTICIAS.get('rcn_banner', { type: 'json' });

        // Fetch all individual card edits
        const cardList = await context.env.KV_NOTICIAS.list({ prefix: 'card:' });
        const edited = {};
        for (const key of cardList.keys) {
            const id = key.name.replace('card:', '');
            const data = await context.env.KV_NOTICIAS.get(key.name, { type: 'json' });
            if (data) edited[id] = data;
        }

        // Fetch all individual full article edits
        const fullList = await context.env.KV_NOTICIAS.list({ prefix: 'full:' });
        const editedFull = {};
        for (const key of fullList.keys) {
            const id = key.name.replace('full:', '');
            const data = await context.env.KV_NOTICIAS.get(key.name, { type: 'json' });
            if (data) editedFull[id] = data;
        }

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
            const cardData = {
                title: data.title,
                desc: data.desc,
                badgeTxt: data.badgeTxt,
                imgUrl: data.imgUrl,
                videoUrl: data.videoUrl
            };
            await context.env.KV_NOTICIAS.put(`card:${data.id}`, JSON.stringify(cardData));
            return new Response(JSON.stringify({ success: true, message: 'Anuncio guardado' }), { status: 200 });
        }

        // 2. Edit Full Article (Individual Key)
        if (data.action === 'edit_full') {
            const fullData = {
                title: data.title,
                content: data.content,
                videoUrl: data.videoUrl
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

        // 4. Edit Banner
        if (data.action === 'edit_banner') {
            const bannerData = {
                text: data.text,
                bg: data.bg,
                imgData: data.imgData
            };
            await context.env.KV_NOTICIAS.put('rcn_banner', JSON.stringify(bannerData));
            return new Response(JSON.stringify({ success: true, message: 'Banner actualizado' }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: 'Action not supported' }), { status: 400 });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
