import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/">Home</Link>
      <Link to="/song">Song</Link>
      <Link to="/social">Social</Link>
      <Link to="/profile">Profile</Link>
      <Link to="/about">About</Link>
    </nav>
  );
};

export default Navbar;