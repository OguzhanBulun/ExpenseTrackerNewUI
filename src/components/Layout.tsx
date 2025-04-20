import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div>
      <header>
        <h1>Expense Tracker UI</h1>
      </header>
      <main>
        <Outlet /> 
      </main>
      <footer>
      </footer>
    </div>
  );
};

export default Layout;