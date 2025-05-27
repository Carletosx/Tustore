const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Resumen de Ventas */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Resumen de Ventas</h2>
          <div className="text-3xl font-bold text-green-600">S/. 2,500.00</div>
          <p className="text-gray-600 mt-2">Ventas del día</p>
        </div>

        {/* Alertas de Stock */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Alertas de Stock</h2>
          <div className="text-3xl font-bold text-red-600">5</div>
          <p className="text-gray-600 mt-2">Productos con stock bajo</p>
        </div>

        {/* Ventas por Categoría */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Ventas por Categoría</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Electrónicos</span>
              <span className="font-semibold">45%</span>
            </div>
            <div className="flex justify-between">
              <span>Ropa</span>
              <span className="font-semibold">30%</span>
            </div>
            <div className="flex justify-between">
              <span>Accesorios</span>
              <span className="font-semibold">25%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;