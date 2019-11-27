import io from "socket.io-client";

export class socketIO {
    constructor(url) {
        this.socket = io(url)
    }
    socket;
}

