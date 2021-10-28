import config from "../config"

const getRandomTurn = () => {
    return config.iceServers.turns[Math.floor((Math.random()*config.iceServers.turns.length))];
}

export const getIceServersForFrontend = () => {
    const result = [];
    const servers = config.iceServers;
    const turn = getRandomTurn()
    result.push({urls: `stun:${servers.stun.browser}`});

    const [cred, url] = turn.split("@");
    const [username, credential] = cred.split(":");
    result.push({urls: `turn:${url}`, username, credential});
    return result;
}

export const getIceServersForKurento = () => {
    const servers = config.iceServers;
    let stun = servers.stun.kurento;
    const turn = getRandomTurn();
    return {turn, stun};
}



