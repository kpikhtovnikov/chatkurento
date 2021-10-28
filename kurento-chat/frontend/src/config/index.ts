export const configSettings = {
    server: process.env.REACT_APP_SOCKET_ENDPOINT || 'http://localhost:4000',
    connectionType: {
        publish: 'publish',
        view: 'view'
    }
};
