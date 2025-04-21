import { useState, ReactNode, useEffect, useRef, RefObject } from "react";
import { useSetUser, useUser, UserProvider } from "./userContext";
import { Link, useNavigate, Route, BrowserRouter, Routes } from "react-router-dom";
import './App.css';
import React from "react";

export function Header() {
  const user = useUser().user;
  const isLoggedIn: boolean = user !== null;
  const setUser = useSetUser();

  async function handleLogoutClick(_e: React.MouseEvent) {
    if (!setUser) {
      throw new Error("useSetUser must be used within User Provider");
    }
    setUser(null);
  }

  return (
    <header>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
      }}>
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
  const setUser = useSetUser();
  const { formData, error, setFormData, handleFormDataChange, setCustomErrorTimeout } = useForm(
    {
      username: '',
      password: '',
    }
  );

  const isLoggedIn = useUser().user !== null;
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

      if (!setUser) {
        throw new Error("useSetUser must be used within User Provider");
      }
      setUser(json["gid"]);
      navigate("/");
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
        {error && <h2> {error} </h2>}
        <button type="submit" className="submit-btn">Log In</button>
      </form>
      <Link to="../signup"> Click here to sign up </Link>
    </div>
  );
}

export function useForm(initialState: any) {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const timeoutRef = useRef<number | null>(null);

  useEffect( () => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, []);

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (!(Object.keys(formData).includes(name))) {
      setError("Unknown form field");
      timeoutRef.current = setTimeout(() => {
        setError('');
        timeoutRef.current = null;
      }, 1000);
    }
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const setCustomErrorTimeout = (message: string) => {
    setError(message);
    timeoutRef.current = setTimeout(() => {
      setError('');
      timeoutRef.current = null;
    }, 1000);
  }

  return {
    formData,
    setFormData,
    error,
    handleFormDataChange,
    setCustomErrorTimeout,
  }
}

export function SignUpPage() {
  const { formData, error, handleFormDataChange, setCustomErrorTimeout } = useForm(
    {
      username: '',
      password: '',
      passwordConfirm: ''
    }
  );
  const isLoggedIn = useUser().user !== null;
  let navigate = useNavigate();

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
      navigate("../login");
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
        {error && <h2> {error} </h2>}
        <button type="submit" className="submit-btn">Sign Up</button>
      </form>
      <Link to="../login"> Click here to login </Link>
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
  const isLoggedIn: boolean = useUser().user !== null;
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
      }, 1000);
    }
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  if (!isLoggedIn) {
    return (
      <>
        <h2> Invalid permissions </h2>
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} onChange={handleFormDataChange}>
      <h2> Submit a check-in </h2>
      <input type="text" name="firstName" id="" />
      <input type="text" name="lastName" id="" />
      <textarea name="message"/>
      <input type="tel" name="phoneNumber" id="" />
      <button type="submit"> Submit </button>
      {
        (error && error.length > 0) && <h2> {error} </h2>
      }
    </form>
  )
}

export function CheckInTable({ tableListData }: any) {
  const isLoggedIn = useUser().user !== null;

  if (!isLoggedIn)
    return (
      <>
      </>
    );

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {tableListData ? tableListData : (
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
  const userContext = useUser();
  const [checkInData, setCheckInData] = useState([]);
  const checkinId = useRef(0);

  useEffect(() => {
    if (userContext.user === null) {
      return;
    }

    const fetchGuestData = async () => {
      const guestId = userContext.user;
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
  }, [userContext.user])

  return (
    <>
      <ul>
        {checkInData.map(item => <li> {item} </li>)}
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
    <>
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
    </>
  );
}

