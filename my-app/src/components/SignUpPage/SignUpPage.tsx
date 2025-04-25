import { useForm } from "../../hooks/useForm";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../../userContext";

export function SignUpPage() {
  const { formData, error, handleFormDataChange, setCustomErrorTimeout, setCustomTimeout } = useForm(
    {
      username: '',
      password: '',
      passwordConfirm: ''
    }
  );
  const useUser = useCurrentUser();
  const [submitBtnMsg, setSubmitBtnMsg] = useState('Sign up');
  let navigate = useNavigate();
  const isLoggedIn = useUser.user !== null && useUser.user !== undefined;

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.username || !formData.password || !formData.passwordConfirm || formData.password != formData.passwordConfirm) {
      setCustomErrorTimeout("Invalid Form Fields");
      return;
    }

    try {
      const url = "/api/user/signup/";
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm
        }),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const json = await response.json();
        const errorMessage = json['error'];
        setCustomErrorTimeout(errorMessage);
        return;
      }
      setSubmitBtnMsg('Success!');
      setCustomTimeout(navigate, ["../login"], 1000);
    } catch (error: any) {
      console.error(error.message); 
    }
  
  }

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} className="form">
        <h3> Sign up </h3>
        <label htmlFor="username">Username</label>
        <input type="text" name="username" value={formData.username} onChange={handleFormDataChange} />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleFormDataChange} />
        <label htmlFor="passwordConfirm"> Re-enter your Password</label>
        <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleFormDataChange} />
        {error && <h4> {error} </h4>}
        <button type="submit" className="submit-btn">{submitBtnMsg}</button>
        <Link to="../login" className="alt-link"> Click here to login </Link>
      </form>
    </div>
  );
}
