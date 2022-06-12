import { Component, Input } from "@angular/core";
import { BehaviorSubject, combineLatest, filter, map, ReplaySubject } from "rxjs";
import { Message } from "@ffxiv-teamcraft/pcap-ffxiv";
import { chunk } from "lodash";

@Component({
  selector: "c7-dissector",
  templateUrl: "./dissector.component.html",
  styleUrls: ["./dissector.component.less"]
})
export class DissectorComponent {
  private data$: ReplaySubject<Uint8Array> = new ReplaySubject<Uint8Array>();
  private buffer$ = this.data$.pipe(
    map(data => Buffer.from(data))
  );

  @Input()
  set message(data: Message) {
    this.data$.next((data.data || [])?.slice(1) as Uint8Array);
  }

  public selectedOffset$ = new BehaviorSubject<number>(-1);

  public gridDisplay$ = combineLatest([this.data$, this.selectedOffset$]).pipe(
    map(([data, selectedOffset]) => {
      return {
        grid: chunk(data, 0xF),
        selectedOffset
      };
    })
  );

  public selectedOffsetDataDisplay$ = combineLatest([this.buffer$, this.selectedOffset$]).pipe(
    filter(([buffer, offset]) => offset >= 0 && offset <= buffer.length),
    map(([buffer, offset]) => {
      return [
        { label: "uint8", value: buffer.readUInt8(offset) },
        { label: "int8", value: buffer.readInt8(offset) },
        { label: "uint16", value: buffer.readUInt16LE(offset) },
        { label: "int16", value: buffer.readInt16LE(offset) },
        { label: "uint32", value: buffer.readUInt32LE(offset) },
        { label: "int32", value: buffer.readInt32LE(offset) },
        { label: "uint64", value: buffer.readBigUInt64LE(offset) },
        { label: "int64", value: buffer.readBigInt64LE(offset) },
        { label: "float", value: buffer.readFloatLE(offset) },
        { label: "double", value: buffer.readDoubleLE(offset) },
        { label: "string (ascii)", value: buffer.toString("ascii", offset, offset - buffer.length) },
        { label: "string (ascii)", value: buffer.toString("utf8", offset, offset - buffer.length) }
      ];
    })
  );

  selectOffset(row: number, column: number): void {
    this.selectedOffset$.next(row * 15 + column);
  }
}
