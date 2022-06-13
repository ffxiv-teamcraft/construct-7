import { Component } from "@angular/core";
import { IpcService } from "./core/ipc/ipc.service";
import { BehaviorSubject, combineLatest, filter, map, ReplaySubject, scan, startWith, switchMap } from "rxjs";
import { Message } from "@ffxiv-teamcraft/pcap-ffxiv";
import { Filters } from "./core/filters";

@Component({
  selector: "c7-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.less"]
})
export class AppComponent {

  running$ = new BehaviorSubject<boolean>(true);

  clear$ = new BehaviorSubject<void>(void 0);

  packets$ = this.clear$.pipe(
    switchMap(() => {
      return combineLatest([
        this.ipc.packets$,
        this.running$
      ]).pipe(
        filter(([, running]) => running),
        map(([message]) => message),
        scan((acc: Message[], message: Message) => {
          return [
            message,
            ...acc
          ];
        }, []),
        startWith([])
      );
    })
  );

  selectedPacket$ = new ReplaySubject<Message>();

  filterString$ = new ReplaySubject<string>();

  public packetsDisplay$ = combineLatest([
    this.packets$,
    this.filterString$.pipe(
      startWith("")
    )
  ]).pipe(
    map(([packets, filter]) => {
      return this.filterPackets(packets, filter);
    })
  );

  constructor(private ipc: IpcService) {
  }

  selectPacket(packet: Message): void {
    this.selectedPacket$.next(packet);
  }

  trackByMessage(index: number, message: Message): number {
    return message.opcode;
  }

  public startPcap(): void {
    this.running$.next(true);
  }

  public pausePcap(): void {
    this.running$.next(false);
  }

  public clear(): void {
    this.clear$.next();
  }

  private filterPackets(packets: Message[], filter: string): Message[] {
    const filterFn = this.makeFilter(filter);
    return packets.filter(packet => {
      return filterFn(packet);
    });
  }

  private makeFilter(filter: string): (packet: Message) => boolean {
    const blocks = filter.split(";");
    return blocks.reduce((acc, block) => {
      const match = /(\w+)\(([^)]+)\)/i.exec(block);
      if (match && Filters[match[1].toLowerCase()]) {
        return message => acc(message) && Filters[match[1]](message, match[2]);
      }
      return acc;
    }, (_) => true);
  }
}
