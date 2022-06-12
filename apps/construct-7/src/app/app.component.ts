import { Component } from "@angular/core";
import { IpcService } from "./core/ipc/ipc.service";
import { ReplaySubject, scan, startWith } from "rxjs";
import { Message } from "@ffxiv-teamcraft/pcap-ffxiv";

@Component({
  selector: "c7-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"]
})
export class AppComponent {

  packetsDisplay$ = this.ipc.packets$.pipe(
    scan((acc: Message[], message: Message) => {
      return [
        message,
        ...acc
      ];
    }, []),
    startWith([])
  );

  selectedPacket$ = new ReplaySubject<Message>();

  constructor(private ipc: IpcService) {
  }

  selectPacket(packet: Message): void {
    this.selectedPacket$.next(packet);
  }

  trackByMessage(index: number, message: Message): number {
    return message.opcode;
  }
}
