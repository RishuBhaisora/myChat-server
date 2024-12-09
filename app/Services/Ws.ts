import { Server } from 'socket.io';
import AdonisServer from '@ioc:Adonis/Core/Server';

class Ws {
  public io: Server;
  private booted = false;

  
  public boot() {
    // Ensure boot is called only once
    if (this.booted) {
      return;
    }
    this.booted = true;

    // Initialize the WebSocket server
    this.io = new Server(AdonisServer.instance!, {
      cors: {
        origin: '*', // Allow cross-origin requests, adjust as needed
      },
    });
  }
}

export default new Ws();
