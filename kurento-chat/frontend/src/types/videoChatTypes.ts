export interface IVideoChatContext {
    videoStreams: ILocalStream[];
    id: string;
}

export interface ILocalStream {
    id: string;
    name: string;
    localStream: MediaStream;
}

export interface IStream {
    callId: string;
    publishCallId?: string;
}

export interface IUser {
    id: string;
    name: string;
    streams: IStream[];
}

