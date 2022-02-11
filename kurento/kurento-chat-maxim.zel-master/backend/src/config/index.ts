export default {
    PORT: 4000,
    KurentoUrl: 'ws://78.46.107.230:8889/kurento',
    ClientUrl: 'http://localhost:3000',
    MaxUsersNumber: 4,
    iceServers: {
        stun: {
          kurento: { ip: "78.46.107.230", port: 3486 },
          browser: "stun.l.google.com:19302",
        },
        turns: process.env.TURN_URLS
          ? [process.env.TURN_URLS]
          : ["kurentoturn:kurentoturnpassword@78.46.107.230:3486"],
    }
}