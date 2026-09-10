import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession } from './features/auth/slices/authSlice.js';
import Layout from './shared/components/Layout/Layout.jsx';
import LoginPage from './features/auth/pages/LoginPage.jsx';
import DashboardPage from './features/dashboard/pages/DashboardPage.jsx';
import InventarioPage from './features/inventario/pages/InventarioPage.jsx';
import ProductosPage from './features/productos/pages/ProductosPage.jsx';
import PedidosPage from './features/pedidos/pages/PedidosPage.jsx';
import NuevoPedidoPage from './features/pedidos/pages/NuevoPedidoPage.jsx';
import EmpleadosPage from './features/empleados/pages/EmpleadosPage.jsx';
import GastosPage from './features/gastos/pages/GastosPage.jsx';

function ProtectedRoute({ children, soloAdmin = false }) {
  const { token, restoring, usuario } = useSelector((state) => state.auth);
  if (restoring) return null;
  if (!token) return <Navigate to="/login" replace />;
  if (soloAdmin && usuario?.rol !== 'ADMIN') return <Navigate to="/pedidos" replace />;
  return children;
}

function App() {
  const dispatch = useDispatch();
  const { token, usuario, restoring } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token && !usuario) dispatch(restoreSession());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (restoring) return null;

  const inicio = usuario?.rol === 'ADMIN' ? '/dashboard' : '/pedidos';

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to={inicio} replace /> : <LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to={inicio} replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute soloAdmin>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/pedidos" element={<PedidosPage />} />
        <Route path="/pedidos/nuevo" element={<NuevoPedidoPage />} />
        <Route path="/inventario" element={<InventarioPage />} />
        <Route
          path="/productos"
          element={
            <ProtectedRoute soloAdmin>
              <ProductosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/empleados"
          element={
            <ProtectedRoute soloAdmin>
              <EmpleadosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gastos"
          element={
            <ProtectedRoute soloAdmin>
              <GastosPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
