import { collectDefaultMetrics, Counter, Histogram, register } from '@prometheus-io/client';
import { NextFunction, Request, Response } from 'express';

collectDefaultMetrics({ prefix: 'observabilidade_' });

const httpRequestsTotal = new Counter({
  name: 'observabilidade_http_requests_total',
  help: 'Total de requisicoes HTTP recebidas pela API',
  labelNames: ['method', 'route', 'status_code'] as const,
});

const httpRequestDuration = new Histogram({
  name: 'observabilidade_http_request_duration_seconds',
  help: 'Duracao das requisicoes HTTP em segundos',
  labelNames: ['method', 'route', 'status_code'] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const endTimer = httpRequestDuration.startTimer();

  res.on('finish', () => {
    const labels = {
      method: req.method,
      route: req.path,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    endTimer(labels);
  });

  next();
}

export { register };
