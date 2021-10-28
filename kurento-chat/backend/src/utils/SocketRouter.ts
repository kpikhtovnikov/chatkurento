type SocketEvent = (io: any, socket: any, ...data: any) => Promise<any>;

class SocketRouter {
    route: string;
    events: Map<string, SocketEvent>;

    constructor(route: string){
        this.route = route;
        this.events = new Map();
    }

    addEvent(eventName: string, event: SocketEvent) {
        this.events.set(eventName, event);
    }

    getEvents() {
        return [...this.events];
    }
}

export default SocketRouter;
