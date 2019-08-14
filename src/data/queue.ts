import { Event, Flush, IEvent, Token } from "@clarity-types/data";
import config from "@src/core/config";
import upload from "@src/data/upload";
import recompute from "../core/recompute";

let events: IEvent[] = [];
let timeout: number = null;

window["PAYLOAD"] = [];

export default function(timestamp: number, event: Event, data: Token[], flush: Flush = Flush.Schedule): void {
    events.push({t: timestamp, e: event, d: data});
    switch (flush) {
        case Flush.Schedule:
            clearTimeout(timeout);
            timeout = window.setTimeout(dequeue, config.delay);
            break;
        case Flush.Force:
            clearTimeout(timeout);
            dequeue();
            break;
    }
}

function dequeue(): void {
    recompute();
    upload(events);
    reset();
}

function reset(): void {
    events = [];
}
