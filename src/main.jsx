import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';
import App from './App';
import Blog from './pages/blog.jsx';       // Capitalized for consistency
import BlogPost from './pages/BlogPost.jsx'; // ✅ Import BlogPost component

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from './pages/NotFound.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/blog/:slug" element={<BlogPost />} /> {/* ✅ New dynamic route */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
