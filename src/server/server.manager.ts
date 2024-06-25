export class ServerManager {
    private static instance: ServerManager;
    private servers: Map<string, any>;
  
    private constructor() {
      this.servers = new Map();
    }
  
    public static getInstance(): ServerManager {
      if (!ServerManager.instance) {
        ServerManager.instance = new ServerManager();
      }
      return ServerManager.instance;
    }
  
    public addServer(serverId: string, serverData: any) {
        console.log("add server: " + {serverId} + " " + {serverData});
        this.servers.set(serverId, serverData);
    }
  
    public getServer(serverId: string) {
      return this.servers.get(serverId);
    }
  
    public removeServer(serverId: string) {
      this.servers.delete(serverId);
    }
  }
  