const socketRequest = async (socket: any, event: string, data?: any): Promise<any> => {

    const result = await new Promise((resolve) => {
        socket.emit(event, data, resolve);
    });    
    console.log(result)
    return result;
}

export default socketRequest;
