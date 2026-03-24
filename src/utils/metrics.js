const metrics = {
  totalRequests: 0,
  totalErrors: 0,
  routes: {},
};

const recordRequest = (route, method, duration, status) => {
  metrics.totalRequests++;

  const key = `${method} ${route}`;

  if (!metrics.routes[key]) {
    metrics.routes[key] = {
      count: 0,
      totalDuration: 0,
      errors: 0,
    };
  }

  const routeMetrics = metrics.routes[key];

  routeMetrics.count++;
  routeMetrics.totalDuration += duration;

  if (status >= 400) {
    metrics.totalErrors++;
    routeMetrics.errors++;
  }
};

const getMetrics = () => {
  const routes = {};

  for (const key in metrics.routes) {
    const route = metrics.routes[key];

    routes[key] = {
      count: route.count,
      avgDuration: (route.totalDuration / route.count).toFixed(2) + "ms",
      errors: route.errors,
    };
  }

  return {
    totalRequests: metrics.totalRequests,
    totalErrors: metrics.totalErrors,
    routes,
  };
};

module.exports = {
  recordRequest,
  getMetrics,
};