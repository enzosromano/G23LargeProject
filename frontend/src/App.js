import React, { useState } from "react";
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./views/loginPage";
import RegisterPage from "./views/registerPage";
import HomePage from "./views/homePage";
import IndexPage from "./views/indexPage";
import LeaderboardPage from "./views/leaderboardPage";
import ProfilePage from "./views/profilePage";
import ChangePasswordPage from "./views/changePasswordPage";
import ProvideEmailPage from "./views/provideEmailPage";


function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/index" index element={<IndexPage/>} />
          <Route path="/board" index element={<LeaderboardPage/>} />
          <Route path="/" index element={<LoginPage />} />
          <Route path="/register" index element={<RegisterPage />} />
          <Route path="/home" index element={<HomePage/>} />
          <Route path="/profile" index element={<ProfilePage/>} />
          <Route path="/ResetPassword" index element={<ChangePasswordPage/>} />
          <Route path="/forgetpassword" index element={<ProvideEmailPage/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
