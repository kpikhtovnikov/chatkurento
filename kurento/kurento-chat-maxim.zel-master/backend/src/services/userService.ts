import config from '../config';

class userConnectionService {
   connections: Map<string, any>;

   constructor() {
      this.connections = new Map();
   }

   add(socketId: string, data: any) {
      if (this.connections.size >= config.MaxUsersNumber) {
         return false;
      }
      this.connections.set(socketId, {
         id: socketId,
         name: data.userName,
         streams: [],
         viewStreams: [],
      });

      return true;
   }

   addPublishStream(socketId, videoStream) {
      this.connections.get(socketId).streams.push(videoStream);
   }

   addViewStream(socketId, videoStream) {
      this.connections.get(socketId).viewStreams.push(videoStream);
   }

   remove(socketId: string) {
      this.connections.delete(socketId);
   }

   getUsers() {
      return [...this.connections].map((el) => el[1]);
   }

   getUser(id) {
      return this.connections.get(id);
   }

   getUsersAmount() {
      return this.connections.size;
   }
}

export default new userConnectionService();
