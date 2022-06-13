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

  filterString$ = new BehaviorSubject<string>("");

  filterAutocomplete$ = this.filterString$.pipe(
    map(filterString => {
      return Object.keys(Filters)
        .filter(key => key.includes(filterString.toLowerCase()))
        .map(key => `${key}()`)
    }),
    startWith(Object.keys(Filters))
  );

  parsedFilter$ = this.filterString$.pipe(
    map(filterStr => this.parseFilterString(filterStr))
  );

  invalidFilterString$ = combineLatest([this.parsedFilter$, this.filterString$]).pipe(
    map(([parsed, baseString]) => {
      return baseString.length > 0 && parsed.length === 0;
    })
  );

  filterFn$ = this.parsedFilter$.pipe(
    map(parsedFilter => this.makeFilter(parsedFilter))
  );

  public packetsDisplay$ = combineLatest([
    this.packets$,
    this.filterFn$
  ]).pipe(
    map(([packets, filterFn]) => {
      return packets.filter(packet => {
        return filterFn(packet);
      });
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

  private parseFilterString(filter: string): { filterName: string, param: string }[] {
    const blocks = filter.split(";");
    return blocks.reduce((acc, block) => {
      const match = /(\w+)\(([^)]+)\)/i.exec(block);
      if (match && Filters[match[1].toLowerCase()]) {
        return [
          ...acc,
          { filterName: match[1].toLowerCase(), param: match[2] }
        ];
      }
      return acc;
    }, [] as { filterName: string, param: string }[]);
  }

  private makeFilter(parsedFilters: { filterName: string, param: string }[]): (packet: Message) => boolean {
    return parsedFilters.reduce((acc, { filterName, param }) => {
      return message => acc(message) && Filters[filterName](message, param);
    }, (_) => true);
  }
}
