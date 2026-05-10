import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './Layout.module.css';

const NAV = [
  { to: '/',    icon: '⊞', label: 'Dashboard' },
  { to: '/sdm', icon: '👥', label: 'Data SDM'  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`${styles.shell} ${collapsed ? styles.collapsed : ''}`}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>S</div>
          {!collapsed && <span className={styles.brandName}>SDM Yayasan</span>}
        </div>

        <nav className={styles.nav}>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{n.icon}</span>
              {!collapsed && <span>{n.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {user?.nama?.[0]?.toUpperCase() || 'A'}
            </div>
            {!collapsed && (
              <div className={styles.userMeta}>
                <span className={styles.userName}>{user?.nama || 'Admin'}</span>
                <span className={styles.userRole}>{user?.role || 'admin'}</span>
              </div>
            )}
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            ⏻
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button className={styles.toggleBtn} onClick={() => setCollapsed(c => !c)}>
            ☰
          </button>
          <div className={styles.topbarRight}>
            <span className={styles.topbarUser}>Halo, <b>{user?.nama || 'Admin'}</b></span>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
