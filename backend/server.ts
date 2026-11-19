import 'dotenv/config';
import express from 'express';
import { resolve } from 'node:path';
import { readState, isAppState, writeState } from './store';

const app = express();
const port = Number(process.env.PORT || 3001);
const demoPassword = process.env.DEMO_PASSWORD || 'demo123';
const frontendDist = resolve(process.cwd(), 'frontend/dist');

app.disable('x-powered-by');
app.use(express.json({ limit: '2mb' }));
// Las operaciones de estado son exclusivamente locales en este prototipo.
app.use('/api/state', (request, response, next) => {
  const origin = request.get('origin');
  if (origin) {
    try {
      const url = new URL(origin);
      if (!['localhost', '127.0.0.1'].includes(url.hostname)) {
        response.status(403).json({ message: 'Origen no autorizado para el prototipo local.' });
        return;
      }
    } catch {
      response.status(403).json({ message: 'Origen inválido.' });
      return;
    }
  }
  next();
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.get('/api/state', (_request, response, next) => {
  try {
    response.json(readState());
  } catch (error) {
    next(error);
  }
});

app.put('/api/state', (request, response, next) => {
  try {
    if (!isAppState(request.body)) {
      response.status(400).json({ message: 'El estado enviado no tiene un formato válido.' });
      return;
    }

    writeState(request.body);
    response.json({ saved: true });
  } catch (error) {
    next(error);
  }
});

app.post('/api/auth/login', (request, response, next) => {
  try {
    const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : '';
    const password = typeof request.body?.password === 'string' ? request.body.password : '';
    if (!email || !password) {
      response.status(400).json({ message: 'Ingrese su correo y contraseña.' });
      return;
    }

    const state = readState();
    const user = state.users.find((candidate) => candidate.email.toLowerCase() === email);
    if (!user) {
      response.status(401).json({ message: 'Usuario no registrado en el sistema.' });
      return;
    }
    if (user.status !== 'active') {
      response.status(403).json({ message: 'La cuenta se encuentra inactiva. Contacte al administrador.' });
      return;
    }
    if (password !== demoPassword) {
      response.status(401).json({ message: 'Contraseña incorrecta.' });
      return;
    }

    const updatedUser = {
      ...user,
      lastLogin: 'Hoy, ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    };
    writeState({
      ...state,
      users: state.users.map((candidate) => candidate.id === user.id ? updatedUser : candidate),
    });
    response.json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
});

app.use(express.static(frontendDist));
app.get(/^\/(?!api(?:\/|$)).*/, (_request, response, next) => {
  response.sendFile(resolve(frontendDist, 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ message: 'Error interno del servidor.' });
});

// Prototipo: escuchar solo en el equipo local para no exponer el endpoint de estado.
app.listen(port, '127.0.0.1', () => {
  console.log(`Útiles Express API escuchando en http://localhost:${port}`);
});
