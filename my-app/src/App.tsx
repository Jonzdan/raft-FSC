import { UserProvider } from "./userContext";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { LandingPage } from "./components/LandingPage/LandingPage";
import { MyCheckInPage } from "./components/MyCheckInPage/MyCheckInPage";
import { SignUpPage } from "./components/SignUpPage/SignUpPage";
import { LoginPage } from "./components/LoginPage/LoginPage";
import './App.css';
import React from "react";

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
            <Route path="/my-checkins" element={<MyCheckInPage />}>
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
