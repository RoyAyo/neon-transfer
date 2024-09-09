"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class WorkerEvent extends stream_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.count = 0;
    }
    getCount() {
        return this.count || 0;
    }
}
exports.default = WorkerEvent;
