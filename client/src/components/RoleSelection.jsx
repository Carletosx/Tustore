import { useNavigate, Link } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full relative">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Selecciona tu Rol</h1>
        <div className="space-y-4">
          <button
            onClick={() => handleRoleSelect('admin')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Administrador
          </button>
          <button
            onClick={() => handleRoleSelect('vendedor')}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Vendedor
          </button>
          <button
            onClick={() => handleRoleSelect('almacenero')}
            className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Almacenero
          </button>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600">¿Aún no tienes una cuenta?</p>
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
            Regístrate como nuevo administrador
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;