const pino = require("pino");


const env = process.env.NODE_ENV || "development";

const logger = pino({
  level: "info",

  transport:
    env === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

module.exports = logger;

// const formatMeta = (meta) => {
//   return Object.entries(meta)
//     .map(([key, value]) => `${key}=${value}`)
//     .join(" ");
// };

// const log = (level, message, meta = {}) => {
//   const timestamp = new Date().toISOString();
//   const env = process.env.NODE_ENV || "development";

//   if (env === "development") {
//     console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);

//     if (Object.keys(meta).length > 0) {
//       console.log(formatMeta(meta));
//     }

//     return;
//   }

//   const logObject = {
//     level,
//     message,
//     ...meta,
//     timestamp,
//   };

//   console.log(JSON.stringify(logObject));
// };

// module.exports = {
//   info: (message, meta) => log("info", message, meta),
//   error: (message, meta) => log("error", message, meta),
//   warn: (message, meta) => log("warn", message, meta),
// };
