import { useState, ReactNode, useEffect, useRef } from "react";
import { useCurrentUser, UserProvider, useLogout } from "./userContext";
import { Link, useNavigate, Route, BrowserRouter, Routes } from "react-router-dom";
import './App.css';
import React from "react";

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
      <h5> Lorem, ipsum dolor sit amet consectetur adipisicing elit. Illum amet dolor quo perferendis quod, non ea recusandae, suscipit inventore asperiores a iste ducimus velit praesentium, quae ullam iusto sint quidem?</h5>
    </header>
  )
}

export function Footer() {
  return (
    <footer>
      <h5> Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis inventore nulla dolores consectetur excepturi officia placeat recusandae, cupiditate blanditiis omnis quas voluptatum eveniet, rem numquam suscipit quaerat quos. Rerum, vitae. </h5>
    </footer>
  )
}

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
      <h3> Login </h3>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="username">Username</label>
        <input type="text" name="username" value={formData.username} onChange={handleFormDataChange} />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleFormDataChange} />
        {error && <h4> {error} </h4>}
        <button type="submit" className="submit-btn">Log In</button>
      </form>
      <Link to="../signup" className="alt-link"> Click here to sign up </Link>
    </div>
  );
}

export function useForm(initialState: any) {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const timeoutRefs = useRef<number[]>([]);

  useEffect( () => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    }
  }, []);

  const setCustomErrorTimeout = (message: string) => {
    setError(message);
    const timeoutId = setTimeout(() => {
      setError('');
      timeoutRefs.current.filter(id => id != timeoutId);
    }, 2000);
    timeoutRefs.current.push(timeoutId);
  }

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (!(Object.keys(formData).includes(name))) {
      setCustomErrorTimeout("Unknown Form Field");
      return;
    }
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const setCustomTimeout = (func: Function, args: [any], delay: number) => {
    const timeoutId = setTimeout(() => {
      func(...args);
      timeoutRefs.current.filter(id => id != timeoutId);
    }, delay);
    timeoutRefs.current.push(timeoutId);
  }

  return {
    formData,
    setFormData,
    error,
    handleFormDataChange,
    setCustomErrorTimeout,
    setCustomTimeout,
  }
}

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
      <h3> Sign up </h3>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="username">Username</label>
        <input type="text" name="username" value={formData.username} onChange={handleFormDataChange} />
        <label htmlFor="password">Password</label>
        <input type="password" name="password" value={formData.password} onChange={handleFormDataChange} />
        <label htmlFor="passwordConfirm"> Re-enter your Password</label>
        <input type="password" name="passwordConfirm" value={formData.passwordConfirm} onChange={handleFormDataChange} />
        {error && <h4> {error} </h4>}
        <button type="submit" className="submit-btn">{submitBtnMsg}</button>
      </form>
      <Link to="../login" className="alt-link"> Click here to login </Link>
    </div>
  );
}

// Has an image behind it
export function CheckInForm({ setTableListData, tableCellId, setTableCellId }: any) {
  const { formData, error, setCustomErrorTimeout, handleFormDataChange  } = useForm({
    firstName: '',
    lastName: '',
    message: '',
    phoneNumber: ''
  });
  const userContext = useCurrentUser();
  const isLoggedIn = userContext.user !== null && userContext.user !== undefined;
  let logout = useLogout();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    // Post to /guest/new-check-in endpoint
    if (!isLoggedIn) {
      setCustomErrorTimeout("Not logged in");
      return; 
    }

    if (!formData.firstName || !formData.lastName || !formData.message || !formData.phoneNumber) {
      setCustomErrorTimeout("Invalid form data");
      return;
    }

    const url = "/api/guest/new-check-in";
    // const testUrl = "http://localhost:4000/guest/new-check-in";
    
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
        }
        const json = await response.json();
        throw new Error(json.error);
      }

      // Update Check In Table
      const newTableCellId = tableCellId;
      setTableCellId((n: number) => n + 1);

      setTableListData((prev: checkInDataFormat[]) => [
        ...prev,
        { 
          id: newTableCellId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          message: formData.message,
        }
      ])


    } catch (error: any) {
      setCustomErrorTimeout(error.message);
      console.error(error.message);
    }
  }

  async function handleFormOnChange(_e: any) {
    handleFormDataChange(_e);
  }

  if (!isLoggedIn) {
    return (
      <>
      </>
    );
  }

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} onChange={handleFormOnChange} className="form">
        <h2> Submit a check-in </h2>
        <label htmlFor="firstName">First Name </label>
        <input type="text" name="firstName" id="" />
        <label htmlFor="lastName">Last Name</label>
        <input type="text" name="lastName" id="" />
        <label htmlFor="message">Message</label>
        <textarea name="message"/>
        <label htmlFor="phoneNumber">Phone Number</label>
        <input type="tel" name="phoneNumber" id="" />
        <button type="submit" className="submit-btn"> Submit </button>
        {
          (error && error.length > 0) && <h4> {error} </h4>
        }
    </form>
    </div>
  )
}

export function CheckInTable({ tableListData }: any) {
  return (
    <>
      <h2> Past Check-in Records</h2>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {tableListData.length > 0 ? tableListData : (
            <tr>
              <td>Null</td>
              <td>Null</td>
              <td>Null</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export function MyCheckinPage(): ReactNode | Promise<ReactNode> {
  const useUser = useCurrentUser();
  const [checkInData, setCheckInData] = useState([]);
  let logout = useLogout();

  useEffect(() => {
    if (useUser.user === null || useUser.user === undefined) {
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchGuestData = async () => {
      const guestId = useUser.user;
      const url = `/api/guest/${guestId}`;
      // const testUrl = `http://localhost:4000/guest/${guestId}`
      try {
        const response = await fetch(url, {signal: signal});
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
  
        const data = await response.json();
        setCheckInData(data);
      } catch (error: any) {
        if (error.name !== "AbortError")
          console.error(error);
      }
    }
    fetchGuestData();

    return () => {
      controller.abort();
    }
  }, [useUser.user])

  async function handleDeleteCheckin(key: string) {
    const url = `/api/guest/new-check-in`;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        body: JSON.stringify({
          checkInId: key, 
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) {
          logout();
        }
        throw new Error(JSON.stringify(response.body));
      }
      
      setCheckInData((prev) => 
        prev ? prev.filter(
          (x: checkInDataFormat) => x.id !== key
        ) : []
      );

    } catch (error) {
      console.error(error);
    } 

  }

  return (
    <>
      <h3> My Checkins </h3>
      <ul>
        {
          checkInData.length > 0 ? 
          checkInData.map((item: checkInDataFormat) => (<li key={item.id}> {`Check-in Id: ${item.id}; Name: ${item.firstName} ${item.lastName};  Message: ${item.message}`} <span className="hover-link" key={item.id} onClick={() => handleDeleteCheckin(item.id)}> X </span> </li>)) :
          (<> <h2> No checkins available yet </h2> </>)
        }
      </ul>
    </>
  );
}

interface checkInDataFormat {
  id: string
  firstName: string,
  lastName: string,
  message: string,
}

export function LandingPage(): ReactNode | Promise<ReactNode> {
  const [tableListData, setTableListData] = useState([]);
  const [tableCellId, setTableCellId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    async function fetchTableData() {
      const url = "/api/guest/all";
      try {
        const response = await fetch(url, {signal: signal});
        if (!response.ok) {
          throw new Error("Failed to fetch all guest data");
        }
  
        const json = await response.json();
        setTableListData(json.map((item: checkInDataFormat) => {
          const itemIdToDisplay = item.id ? item.id : tableCellId;
          if (!item.id) {
            setTableCellId(n => n + 1);
          }
          return (
            <tr key={itemIdToDisplay}>
              <td>{item.firstName}</td>
              <td>{item.lastName}</td>
              <td>{item.message}</td>
            </tr>
          );
        })); 
      } catch (error: any) {
        if (error.name !== 'AbortError')
          console.error(error);
      }
    }
    fetchTableData();
    return () => {
      controller.abort();
    }
  }, []);

  return (
    <>
      <Header />
      <CheckInForm setTableListData={setTableListData} tableCellId={tableCellId} setTableCellId={setTableCellId} />
      <CheckInTable tableListData={tableListData} />
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <UserProvider>
          <Routes>
            <Route path="/" element={
              <>
                <LandingPage />
              </>
            } />
            <Route path="/my-checkins" element={<MyCheckinPage />}>
            </Route>
            <Route path="user">
              <Route index path="signup" element={<SignUpPage />} />
              <Route path="login" element={<LoginPage />} />
            </Route>
          </Routes>
        </UserProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}

