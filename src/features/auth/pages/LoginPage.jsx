import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, clearError } from '../slices/authSlice.js';
import './LoginPage.css';

export default function LoginPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(loginThunk({ correo, password }));
  };

  return (
    <div className="login-pantalla">
      <form className="login-caja" onSubmit={handleSubmit}>
        <div className="login-marca">
          <span className="marca-punto" />
          <h1>Trilogia de Sabor</h1>
        </div>
        <p className="login-subtitulo">Gestión de pedidos, inventario y nómina</p>

        <div className="campo">
          <label>Correo</label>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required autoFocus />
        </div>
        <div className="campo">
          <label>Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && <div className="login-error">{error}</div>}

        <button className="btn btn-primario login-boton" type="submit" disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
