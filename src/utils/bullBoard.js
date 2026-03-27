const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const auditQueue = require("../queues/auditQueue");
const auditDLQ = require("../queues/auditDLQ");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

const queues = [];

if (auditQueue) {
  queues.push(new BullMQAdapter(auditQueue));
}

if (auditDLQ) {
  queues.push(new BullMQAdapter(auditDLQ));
}

createBullBoard({
  queues,
  serverAdapter,
});

module.exports = serverAdapter;