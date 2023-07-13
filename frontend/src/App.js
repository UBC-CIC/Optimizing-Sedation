import './App.css';
import SmartAuth from './pages/smartAuthRequest';
import Dashboard from './pages/dashboard';

/** React Router DOM **/
// import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/smartAuth" element={<SmartAuth />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
