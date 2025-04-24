import { Link } from "react-router-dom";
import { useCurrentUser, useLogout } from "../userContext";
import "./Header.css";

export function Header() {
    const useUser = useCurrentUser();
    const isLoggedIn: boolean = useUser.user !== null;
    const logout = useLogout();
  
    async function handleLogoutClick(_e: React.MouseEvent) {
      if (!useUser.setUser) {
        throw new Error("useSetUser must be used within User Provider");
      }
      logout();
    }
  
    return (
      <header>
        <h5> Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illum amet dolor quo perferendis quod, non ea recusandae, suscipit inventore asperiores a iste ducimus velit praesentium, quae ullam iusto sint quidem?</h5>
        <div className="header-links">
          {
            isLoggedIn ? (
              <>
                <Link to="/" onClick={handleLogoutClick}>
                  Log Out
                </Link>
                <br></br>
                <Link to="/my-checkins">
                  My Check-ins
                </Link>
              </>
            ) : (
              <>
                <Link to="/user/signup">
                  Sign Up
                </Link>
                <br></br>
                <Link to="/user/login">
                  Log In
                </Link>
              </>
            )
          }
        </div>
      </header>
    )
  }