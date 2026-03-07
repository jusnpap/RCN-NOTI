export async function onRequestGet(context) {
    try {
        const messages = await context.env.KV_NOTICIAS.get('rcn_messages', { type: 'json' }) || [];

        return new Response(JSON.stringify({ messages }), {
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

        if (data.action === 'send') {
            let messages = await context.env.KV_NOTICIAS.get('rcn_messages', { type: 'json' }) || [];
            messages.push({
                id: Date.now(),
                name: data.name,
                email: data.email,
                message: data.message,
                date: new Date().toLocaleString()
            });
            await context.env.KV_NOTICIAS.put('rcn_messages', JSON.stringify(messages));
            return new Response(JSON.stringify({ success: true, message: 'Mensaje enviado' }), { status: 200 });
        }

        return new Response(JSON.stringify({ error: 'Action not supported' }), { status: 400 });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
