import React from 'react';
import Navbar from './Navbar';
import './Layout.css';

/**
 * Layout — wraps every authenticated page with the Navbar and a content area.
 */
function Layout({ children, title }) {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-content">
        {title && (
          <div className="page-header">
            <h1 className="page-title">{title}</h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

export default Layout;
