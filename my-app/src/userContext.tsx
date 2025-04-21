import { createContext, ReactNode, useContext, useState } from "react";

const UserContext = createContext({
    user: null,
});

const UserSetterContext = createContext<React.Dispatch<React.SetStateAction<any>> | null>(null);

interface userProps {
    children: ReactNode;
  }

export function UserProvider({children}: userProps): ReactNode | Promise<ReactNode>  {
    const [user, setUser] = useState({
        user: null,
    });

    return (
        <UserContext.Provider value={user}>
            <UserSetterContext value={setUser}>
                {children}
            </UserSetterContext>
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
export const useSetUser = () => useContext(UserSetterContext);