import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from './views/Index';
import Login from './views/Login';
import Register from './views/Register';
import './App.css';

function App()
{
  return(
      <BrowserRouter>
          <Routes>
              <Route exact path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
          </Routes>
      </BrowserRouter>
  );
}

export default App;
