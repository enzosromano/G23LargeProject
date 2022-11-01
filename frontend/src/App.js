import React, { useState } from "react";
import './App.css';
import { LoginPage } from "./views/loginPage";
import { RegisterPage } from "./views/registerPage";


function App() {
  const [currentForm, setCurrentForm] = useState("loginPage");

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  }
  return (
    <div className="App"> {
      currentForm === "loginPage" ? <LoginPage onFormSwitch={toggleForm}/> : <RegisterPage onFormSwitch={toggleForm}/>
    }
    </div>
  );
}

export default App;
