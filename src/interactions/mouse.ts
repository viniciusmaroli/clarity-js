import { Event } from "@clarity-types/data";
import { IMouseInteraction, Mouse } from "@clarity-types/interactions";
import { bind, time } from "@src/core";
import {queue} from "@src/data/upload";
import { getId } from "@src/dom/virtualdom";
import serialize from "./serialize";

let data: IMouseInteraction[] = [];
let wait = 1000;
let distance = 20;
let timeout: number = null;
let timestamp: number = null;

export function activate(): void {
    bind(document, "mousedown", handler.bind(Mouse.Down));
    bind(document, "mouseup", handler.bind(Mouse.Up));
    bind(document, "mousemove", handler.bind(Mouse.Move));
    bind(document, "mousewheel", handler.bind(Mouse.Wheel));
    bind(document, "click", handler.bind(Mouse.Click));
}

function handler(type: Mouse, evt: MouseEvent): void {
    let de = document.documentElement;
    data.push({
        updated: true,
        time: time(),
        type,
        x: "pageX" in evt ? Math.round(evt.pageX) : ("clientX" in evt ? Math.round(evt["clientX"] + de.scrollLeft) : null),
        y: "pageY" in evt ? Math.round(evt.pageY) : ("clientY" in evt ? Math.round(evt["clientY"] + de.scrollTop) : null),
        target: evt.target ? getId(evt.target as Node, false) : null,
        buttons: evt.buttons
    });
    if (timeout) { clearTimeout(timeout); }
    timeout = window.setTimeout(schedule, wait);
}

function schedule(): void {
    queue(timestamp, Event.Mouse, serialize(Event.Mouse));
}

export function summarize(): IMouseInteraction[] {
    let summary: IMouseInteraction[] = [];
    let index = 0;
    let last = null;
    for (let entry of data) {
        if (entry.updated) {
            let isFirst = index === 0;
            if (isFirst
                || index === data.length - 1
                || checkDistance(last, entry)) {
                timestamp = isFirst ? entry.time : timestamp;
                summary.push(entry);
            }
            index++;
            entry.updated = false;
            last = entry;
        }
    }
    return summary;
}

function checkDistance(last: IMouseInteraction, current: IMouseInteraction): boolean {
    let dx = last.x - current.x;
    let dy = last.y - current.y;
    return (dx * dx + dy * dy > distance * distance);
}