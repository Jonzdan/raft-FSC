import { createContext, JSX, ReactNode, useContext, useState, useEffect } from "react";

const UserContext = createContext({
    user: null,
    setUser: (_x: any) => {}
});

interface userProps {
    children: ReactNode;
  }

export function UserProvider({children}: userProps): JSX.Element  {
    const [user, setUser] = useState(() => {
        const storedGuest = sessionStorage.getItem("user");
        return storedGuest ? JSON.parse(storedGuest) : null;
    });

    useEffect(() => {
        if (user)
            sessionStorage.setItem("user", JSON.stringify(user));
        else
            sessionStorage.removeItem("user");
    }, [user])

    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export const useCurrentUser = () => useContext(UserContext);
export const useLogout = () => {
    const context = useContext(UserContext);

    return () => {
        context.setUser(null)
        sessionStorage.removeItem("user");
    }
}