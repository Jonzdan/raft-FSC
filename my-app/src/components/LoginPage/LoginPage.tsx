import { useNavigate, Link} from "react-router-dom";
import { useEffect } from "react";
import { useCurrentUser } from "../../userContext";
import { useForm } from "../../hooks/useForm";

export function LoginPage() {
    const useUser = useCurrentUser();
    const { formData, error, setFormData, handleFormDataChange, setCustomErrorTimeout, setCustomTimeout } = useForm(
      {
        username: '',
        password: '',
      }
    );
  
    const isLoggedIn = useUser.user !== null && useUser.user !== undefined;
    let navigate = useNavigate();
  
    useEffect(() => {
      if (isLoggedIn) {
        navigate("/");
      }
    }, [isLoggedIn, navigate]);
  
    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
  
      if (!formData.username || !formData.password) {
        setCustomErrorTimeout("Invalid Form Fields");
        return;
      }
  
      try {
        // const testUrl = "http://localhost:4000/user/login";
        const url = "/api/user/login";
  
        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify(formData),
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          setCustomErrorTimeout("Authentication failed");
          return;
        }
  
        const json = await response.json();
        if (!(Object.keys(json).includes("gid"))) {
          setCustomErrorTimeout("Invalid Response returned");
          setFormData({
            ...formData,
            password: ''
          });
          return;
        }
  
        if (!useUser.setUser) {
          throw new Error("useSetUser must be used within User Provider");
        }
        useUser.setUser((_user: number | null) => parseInt(json["gid"]));
        setCustomTimeout(navigate, ["/"], 2000);
      } catch (error: any) {
        console.error(error.message); 
      }
    
    }
  
    return (
      <div className="form-wrapper">
        <form onSubmit={handleSubmit} className="form">
          <h3> Login </h3>
          <label htmlFor="username">Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleFormDataChange} />
          <label htmlFor="password">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleFormDataChange} />
          {error && <h4> {error} </h4>}
          <button type="submit" className="submit-btn">Log In</button>
          <Link to="../signup" className="alt-link"> Click here to sign up </Link>
        </form>
      </div>
    );
  }