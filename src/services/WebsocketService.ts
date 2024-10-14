import { WebSocket, WebSocketServer } from 'ws';

export class WebSocketService {
    private server: WebSocketServer;
    private clients: Record<string, WebSocket> = {};

    constructor(port: number) {
        this.server = new WebSocketServer({ port });
        this.initialize();
    }

    private initialize() {
        this.server.on('connection', (ws: WebSocket) => {
            this.handleConnection(ws);
        });
        console.log(`WebSocket server is running on ws://localhost:${this.server.options.port}`);
    }

    private handleConnection(ws: WebSocket) {
        // Handle the initial message to get the client ID
        ws.on('message', (message: string) => {
            try {
                const { clientId } = JSON.parse(message);

                if (!clientId) {
                    throw new Error('Client ID not provided');
                }

                this.clients[clientId] = ws;
                console.log(`Client connected: ${clientId}`);

                ws.send(JSON.stringify({ message: 'Connection established!', clientId }));

                ws.on('message', (msg) => {
                    console.log(`Received from ${clientId}:`, msg);
                    // Example: Echo the message back to the client
                    ws.send(JSON.stringify({ from: clientId, message: msg }));
                });

                ws.on('close', () => {
                    console.log(`Client disconnected: ${clientId}`);
                    delete this.clients[clientId];
                });

            } catch (error) {
                console.error('Error processing message:', error);
                ws.send(JSON.stringify({ error: 'Invalid message format. Please send a JSON with clientId.' }));
                ws.close();
            }
        });
    }

    public sendMessageToClient(clientId: number, message: string) : void {
            this.clients[clientId].send(JSON.stringify({ message }));
    }
}
