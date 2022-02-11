export interface ILoginContext {
    state: {
        onlineUsers: number,
        isLoggedIn: boolean,
    },
    actions: {
        setOnlineUsers: (count: number) => void ,
        setIsLoggedIn: (loggedIn: boolean) => void,
    } | any
}
