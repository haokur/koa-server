enum WebSocketStatus {
    /**连接尚未建立*/
    CONNECTING = 0,
    /**连接已经建立并且可以通信*/
    OPEN = 1,
    /**连接正在关闭*/
    CLOSING = 2,
    /**连接已经关闭或者无法打开*/
    CLOSED = 3,
}

// 处理收到的消息
function handleMessage(message, ctx) {
    try {
        const data = JSON.parse(message);
        console.log('处理消息', data, 'webrtc-ws.controller.ts::5行');
        switch (data.type) {
            case 'offer':
                broadcastOffer(data.offer, ctx);
                break;
            case 'answer':
                broadcastAnswer(data.answer, ctx);
                break;
            case 'candidate':
                broadcastCandidate(data.candidate, ctx);
                break;
            default:
                console.warn('未知消息类型:', data.type);
        }
    } catch (error) {
        console.error('解析消息时出错:', error);
    }
}

// 广播 SDP offer 给其他客户端
function broadcastOffer(offer, ctx) {
    ctx.app.ws.server.clients.forEach((client) => {
        if (client !== ctx.websocket && client.readyState === WebSocketStatus.OPEN) {
            client.send(JSON.stringify({ type: 'offer', offer }));
        }
    });
}

// 广播 SDP answer 给其他客户端
function broadcastAnswer(answer, ctx) {
    ctx.app.ws.server.clients.forEach((client) => {
        if (client !== ctx.websocket && client.readyState === WebSocketStatus.OPEN) {
            client.send(JSON.stringify({ type: 'answer', answer }));
        }
    });
}

// 广播 ICE 候选给其他客户端
function broadcastCandidate(candidate, ctx) {
    ctx.app.ws.server.clients.forEach((client) => {
        if (client !== ctx.websocket && client.readyState === WebSocketStatus.OPEN) {
            client.send(JSON.stringify({ type: 'candidate', candidate }));
        }
    });
}

async function Connect(_, ctx) {
    console.log('WebSocket 连接已建立');

    ctx.websocket.on('message', (message) => {
        handleMessage(message, ctx);
    });

    ctx.websocket.on('close', () => {
        console.log('WebSocket 连接已关闭');
    });
}

export const WebrtcWsRoutes = {
    '/webrtc/ws': Connect,
};
