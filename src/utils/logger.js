const log = (level, message, meta = {}) => {
    const logObject = {
        level,
        message,
        ...meta,
        timestamp: new Date().toISOString(),
    };

    console.log(JSON.stringify(logObject));
};

module.exports = {
    info: (message, meta) => log("info", message, meta),
    error: (message, meta) => log("error", message, meta),
};