import { EventEmitter } from "stream";

class WorkerEvent extends EventEmitter{
    count: number = 0;

    getCount() {
        return this.count || 0;
    }
}

export default WorkerEvent;