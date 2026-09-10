import { NavLink, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiHome,
  FiPackage,
  FiBook,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiFileText,
  FiLogOut,
} from 'react-icons/fi';
import { logout } from '../../../features/auth/slices/authSlice.js';
import './Layout.css';

const NAV_ADMIN = [
  { to: '/dashboard', label: 'Resumen', icon: FiHome },
  { to: '/pedidos', label: 'Pedidos', icon: FiShoppingBag },
  { to: '/productos', label: 'Recetas', icon: FiBook },
  { to: '/inventario', label: 'Inventario', icon: FiPackage },
  { to: '/empleados', label: 'Empleados', icon: FiUsers },
  { to: '/gastos', label: 'Gastos', icon: FiDollarSign },
  { to: '/reportes', label: 'Reportes', icon: FiFileText },
];

const NAV_EMPLEADO = [
  { to: '/pedidos', label: 'Pedidos', icon: FiShoppingBag },
  { to: '/inventario', label: 'Inventario', icon: FiPackage },
];

export default function Layout() {
  const dispatch = useDispatch();
  const usuario = useSelector((state) => state.auth.usuario);
  const nav = usuario?.rol === 'ADMIN' ? NAV_ADMIN : NAV_EMPLEADO;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="marca">
          <span className="marca-punto" />
          Trilogia de Sabor
        </div>
        <nav className="sidebar-nav">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? ' activo' : ''}`}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="usuario-info">
            <strong>{usuario?.nombre}</strong>
            <span>{usuario?.rol === 'ADMIN' ? 'Administrador' : 'Empleado'}</span>
          </div>
          <button className="btn-logout" onClick={() => dispatch(logout())} aria-label="Cerrar sesión">
            <FiLogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="contenido">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `bottom-link${isActive ? ' activo' : ''}`}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
