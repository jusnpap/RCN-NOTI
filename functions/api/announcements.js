export async function onRequestGet(context) {
    try {
        const deleted = await context.env.RCN_DB.get('deleted_announcements', { type: 'json' }) || [];
        const edited = await context.env.RCN_DB.get('edited_announcements', { type: 'json' }) || {};

        return new Response(JSON.stringify({ deleted, edited }), {
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

        if (data.action === 'edit') {
            let edited = await context.env.RCN_DB.get('edited_announcements', { type: 'json' }) || {};
            edited[data.id] = {
                title: data.title,
                desc: data.desc,
                badgeTxt: data.badgeTxt,
                imgUrl: data.imgUrl
            };
            await context.env.RCN_DB.put('edited_announcements', JSON.stringify(edited));
            return new Response(JSON.stringify({ success: true, message: 'Anuncio editado' }), { status: 200 });
        }

        if (data.action === 'delete') {
            let deleted = await context.env.RCN_DB.get('deleted_announcements', { type: 'json' }) || [];
            if (!deleted.includes(data.id)) {
                deleted.push(data.id);
                await context.env.RCN_DB.put('deleted_announcements', JSON.stringify(deleted));
            }
            return new Response(JSON.stringify({ success: true, message: 'Anuncio eliminado' }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: 'Action not supported' }), { status: 400 });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
