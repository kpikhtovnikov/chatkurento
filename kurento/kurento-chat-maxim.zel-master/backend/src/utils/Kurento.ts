import kurentoClient from 'kurento-client'

import config from '../config/index'

class Kurento {
    connection: kurentoClient.ClientInstance;
    pipeline: any;

    constructor() {
        this.connection = null;
    }

    getKurentoConnection = async () => {
        if (this.connection) {
            return this.connection
        }
        this.connection = await kurentoClient(config.KurentoUrl);
        return this.connection;
    }

    getOrCreatePipeline = async () => {
        const connection = await this.getKurentoConnection();
        if (this.pipeline) {
            return this.pipeline;
          }
  
        this.pipeline = await connection.create("MediaPipeline");
        return this.pipeline;

    }

    createWebrtcEndpoint = async (pipeline: any): Promise<kurentoClient.MediaElement> => {
        return pipeline.create('WebRtcEndpoint')
    }
}

export default new Kurento();