import { useState, ReactNode, useEffect, useRef, RefObject } from "react";
import { useCurrentUser, UserProvider } from "./userContext";
import { Link, useNavigate, Route, BrowserRouter, Routes } from "react-router-dom";
import './App.css';
import React from "react";

export function Header() {
  const { user, setUser } = useCurrentUser();
  const isLoggedIn: boolean = user !== null;

  async function handleLogoutClick(_e: React.MouseEvent) {
    if (!setUser) {
      throw new Error("useSetUser must be used within User Provider");
    }
    setUser(null);
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
  console.log(useUser.user, isLoggedIn);

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
export function CheckInForm({ tableListData, setTableListData, tableCellId, setTableCellId }: any) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    message: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const { user } = useCurrentUser();
  const isLoggedIn = user !== null && user !== undefined;
  let timeoutRef: RefObject<number | null> = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current)
        clearTimeout(timeoutRef.current);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Post to /guest/new-check-in endpoint
    if (!isLoggedIn) {
      setError("Not logged in");
      return; 
    }

    if (!formData.firstName || !formData.lastName || !formData.message || !formData.phoneNumber) {
      setError("Invalid form data");
      return;
    }

    const url = "/api/guest/new-check-in";
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      // Update Check In Table
      const newTableCellId = tableCellId;
      setTableCellId((n: number) => n + 1);

      setTableListData([
        ...tableListData,
        { 
          id: newTableCellId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          message: formData.message,
        }
      ])


    } catch (error: any) {
      setError(error.message);
      console.error(error.message);
    }
  }

  function handleFormDataChange(e: React.ChangeEvent<HTMLFormElement>) {
    const {name, value} = e.target;
    if (!(Object.keys(formData).includes(name))) {
      setError("Unknown form field");
      timeoutRef.current = setTimeout(() => {
        setError("");
        timeoutRef.current = null;
      }, 2000);
    }
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  if (!isLoggedIn) {
    return (
      <>
      </>
    );
  }

  return (
    <div className="form-wrapper">
      <form onSubmit={handleSubmit} onChange={handleFormDataChange} className="form">
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
  const { user } = useCurrentUser();
  const [checkInData, setCheckInData] = useState([]);
  const checkinId = useRef(0);

  useEffect(() => {
    if (user === null || user === undefined) {
      return;
    }

    const fetchGuestData = async () => {
      const guestId = user;
      const url = `/api/guest/${guestId}`;
      const response = await fetch(url);
      try {
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
  
        const data = await response.json();
        setCheckInData(data.map((item: any) => {
          const id = checkinId.current;
          checkinId.current++;
          return {
            id: id,
            ...item
          }
        })); 
      } catch (error) {
        console.error(error);
      }
    }
    fetchGuestData();
  }, [user])

  return (
    <>
      <ul>
        {
          checkInData.length > 0 ? 
          checkInData.map(item => (<li> {item} </li>)) :
          (<> <h2> No checkins available yet </h2> </>)
        }
      </ul>
    </>
  );
}

interface tableDataCell {
  id: string
  firstName: string,
  lastName: string,
  message: string,
}

export function LandingPage(): ReactNode | Promise<ReactNode> {
  const [tableListData, setTableListData] = useState([]);
  const [tableCellId, setTableCellId] = useState(0);

  useEffect(() => {
    async function fetchTableData() {
      const url = "/api/guest/all";
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch all guest data");
      }

      const json = await response.json();
      setTableListData(json.map((item: tableDataCell) => {
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
    }
    fetchTableData();
  }, []);

  return (
    <>
      <Header />
      <CheckInForm tableListData={tableListData} setTableListData={setTableListData} tableCellId={tableCellId} setTableCellId={setTableCellId} />
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

