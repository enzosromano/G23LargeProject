import React, { useState } from "react";
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./views/loginPage";
import RegisterPage from "./views/registerPage";
import HomePage from "./views/homePage";


function App() {
//   const [currentForm, setCurrentForm] = useState("loginPage");

//   const toggleForm = (formName) => {
//     setCurrentForm(formName);
//   }
  return (
    // <div className="App"> {
    //   currentForm === "loginPage" ? <LoginPage onFormSwitch={toggleForm}/> : <RegisterPage onFormSwitch={toggleForm}/>
    // }
    // </div>
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" index element={<LoginPage />} />
          <Route path="/register" index element={<RegisterPage />} />
          <Route path="/home" index element={<HomePage/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
