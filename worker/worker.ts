export interface Env { INFRAROOM_DO: DurableObjectNamespace; }
export class InfraRoomDO {
  private state: DurableObjectState;
  private resources: Map<string, any> = new Map();
  private websockets: WebSocket[] = [];
  constructor(state: DurableObjectState, env: Env) { this.state = state; }
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    if (url.pathname === '/resources' && request.method === 'GET') {
      return Response.json(Array.from(this.resources.values()));
    }
    if (url.pathname === '/resource' && request.method === 'POST') {
      const data = await request.json();
      const state = data.desired === data.actual ? 'in_sync' : 'drifted';
      const resource = { ...data, state, lastChecked: new Date().toISOString() };
      this.resources.set(resource.id, resource);
      this.broadcast(JSON.stringify({ type: 'resource', data: resource }));
      return Response.json({ success: true, resource });
    }
    return new Response('Not Found', { status: 404 });
  }
  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) { }
  webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) { this.websockets = this.websockets.filter(w => w !== ws); }
  private broadcast(msg: string) { for (const ws of this.websockets) { if (ws.readyState === 1) ws.send(msg); } }
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const id = env.INFRAROOM_DO.idFromName(url.pathname);
    const stub = env.INFRAROOM_DO.get(id);
    return stub.fetch(request);
  }
}