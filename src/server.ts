import express from 'express';
import { routes } from './routes/index.routes';
import { metricsMiddleware, register } from './metrics';

const app = express();

app.use(express.json());

app.get('/metrics', async (_req, res) => {
  res.setHeader('Content-Type', register.contentType);
  res.send(await register.metrics());
});

app.use(metricsMiddleware);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
