import './App.css';
import SmartAuth from './pages/smartAuthRequest';
import Dashboard from './pages/dashboard';
import LoadMoreData from './pages/loadMoreData';

/** React Router DOM **/
// import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/smartAuth" element={<SmartAuth />} />
        <Route path="/loadMore" element={<LoadMoreData />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
