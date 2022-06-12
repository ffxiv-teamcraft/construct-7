import { Injectable, NgZone } from "@angular/core";
import { IpcRenderer, IpcRendererEvent } from "electron";
import { Message } from "@ffxiv-teamcraft/pcap-ffxiv";
import { Subject } from "rxjs";

type EventCallback<T> = (event: IpcRendererEvent, ...args: T[]) => void;

@Injectable({
  providedIn: "root"
})
export class IpcService {

  private readonly _ipc: IpcRenderer;

  public packets$ = new Subject<Message>();

  constructor(private zone: NgZone) {
    this._ipc = window.require("electron").ipcRenderer;
    this._ipc.setMaxListeners(0);
    this.connectListeners();
  }

  private connectListeners(): void {
    this.on("packet", (event, message: Message) => {
      this.packets$.next(message);
    });
  }

  public on<T = unknown>(channel: string, cb: EventCallback<T>): void {
    this._ipc.on(channel, (event, ...args) => {
      this.zone.run(() => cb(event, ...args));
    });
  }

  public once<T = unknown>(channel: string, cb: EventCallback<T>): void {
    this._ipc.once(channel, (event, ...args) => {
      this.zone.run(() => cb(event, ...args));
    });
  }

  public send(channel: string, data?: unknown): void {
    return this._ipc.send(channel, data);
  }
}
