const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Importar rutas existentes
const usuariosRoutes = require('./routes/usuarios.routes');
const rolesRoutes = require('./routes/roles.routes');
const permisosRoutes = require('./routes/permisos.routes');
const modulosRoutes = require('./routes/modulos.routes');
const activosRoutes = require('./routes/activos.routes');
const estadisticasRoutes = require('./routes/estadisticas.routes');

// Importar nuevas rutas
const activosNegocioRoutes = require('./routes/activos-negocio.routes');
const procesosRoutes = require('./routes/procesos.routes');
const cuestionariosRoutes = require('./routes/cuestionarios.routes');
const organigramasRoutes = require('./routes/organigramas.routes');
const catalogosRoutes = require('./routes/catalogos.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationsRoutes = require('./routes/notifications.routes');

// Importar servicios
const schedulerService = require('./services/scheduler.service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4201'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Id']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas de la API - Existentes
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/permisos', permisosRoutes);
app.use('/api/modulos', modulosRoutes);
app.use('/api/activos-acceso', activosRoutes);
app.use('/api/estadisticas', estadisticasRoutes);

// Rutas de la API - Nuevas
app.use('/api/activos', activosNegocioRoutes);
app.use('/api/procesos', procesosRoutes);
app.use('/api/cuestionarios', cuestionariosRoutes);
app.use('/api/organigramas', organigramasRoutes);
app.use('/api/catalogos', catalogosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationsRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║                                                   ║
  ║   🚀 ORCA Backend API iniciado                   ║
  ║   📍 Puerto: ${PORT}                               ║
  ║   🌐 URL: http://localhost:${PORT}                 ║
  ║   📚 API: http://localhost:${PORT}/api             ║
  ║                                                   ║
  ╚═══════════════════════════════════════════════════╝
  `);

  // Iniciar scheduler de notificaciones
  schedulerService.start();
});

module.exports = app;
