import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleSelection from './components/RoleSelection';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import Products from './components/Products';
import Categories from './components/Categories';
import Reports from './components/Reports';
import PrivateRoute from './routes/PrivateRoute';
import { roleMapping } from './routes/authRoutes';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login/:role" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute requiredRole={roleMapping.admin}>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/pos"
          element={
            <PrivateRoute requiredRole={roleMapping.vendedor}>
              <Layout>
                <POS />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <PrivateRoute requiredRole={roleMapping.almacenero}>
              <Layout>
                <Inventory />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <PrivateRoute requiredRole={roleMapping.admin}>
              <Layout>
                <Products />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/categorias"
          element={
            <PrivateRoute requiredRole={roleMapping.admin}>
              <Layout>
                <Categories />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <PrivateRoute requiredRole={roleMapping.admin}>
              <Layout>
                <Reports />
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
