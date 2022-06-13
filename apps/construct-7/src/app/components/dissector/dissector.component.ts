import { Component, Input } from "@angular/core";
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  ReplaySubject,
  startWith,
  switchMap
} from "rxjs";
import { Message } from "@ffxiv-teamcraft/pcap-ffxiv";
import { chunk, uniq } from "lodash";
import { XivapiEndpoint, XivapiService } from "@xivapi/angular-client";
import { StructElement } from "../../core/struct-element";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "c7-dissector",
  templateUrl: "./dissector.component.html",
  styleUrls: ["./dissector.component.less"]
})
export class DissectorComponent {
  public availableEndpoints = uniq(Object.keys(XivapiEndpoint));

  private message$ = new ReplaySubject<Message>();
  private data$ = this.message$.pipe(
    map(message => (message.data || []).slice(1) as Uint8Array)
  );
  private buffer$ = this.data$.pipe(
    map(data => Buffer.from(data))
  );

  @Input()
  set message(message: Message) {
    this.message$.next(message);
  }

  public selectedOffset$ = new BehaviorSubject<number>(-1);

  public struct$: Observable<StructElement[]> = this.message$.pipe(
    switchMap(message => {
      if (message.parsedIpcData) {
        return this.generateStruct(message);
      }
      return of([]);
    })
  );
  gridDisplay$ = combineLatest([this.data$, this.selectedOffset$, this.struct$]).pipe(
    map(([data, selectedOffset, struct]) => {
      return {
        grid: chunk([...data].map((value, index) => {
          return {
            value,
            struct: struct[index]
          };
        }), 0x10),
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
        { label: "string (utf8)", value: buffer.toString("utf8", offset, offset - buffer.length) },
        { label: "date", value: new Date(buffer.readInt32LE(offset) * 1000) }
      ];
    }),
    startWith([
      { label: "uint8", value: "-" },
      { label: "int8", value: "-" },
      { label: "uint16", value: "-" },
      { label: "int16", value: "-" },
      { label: "uint32", value: "-" },
      { label: "int32", value: "-" },
      { label: "uint64", value: "-" },
      { label: "int64", value: "-" },
      { label: "float", value: "-" },
      { label: "double", value: "-" },
      { label: "string (ascii)", value: "-" },
      { label: "string (utf8)", value: "-" },
      { label: "date", value: "-" }
    ])
  );

  public selectedGameContent$ = new BehaviorSubject<XivapiEndpoint>(XivapiEndpoint.Item);

  public selectedOffsetDataGameContent$ = combineLatest([
    this.buffer$,
    this.selectedOffset$.pipe(filter(offset => offset >= 0)),
    this.selectedGameContent$
  ]).pipe(
    switchMap(([buffer, offset, content]) => {
      return this.xivapi.get(content, buffer.readInt32LE(offset), {
        columns: ["Name_en"]
      }).pipe(
        catchError(() => of(null))
      );
    }),
    map(response => {
      if (response) {
        return response.Name_en;
      }
      return "Not Found";
    })
  );

  constructor(private xivapi: XivapiService, private http: HttpClient) {
  }

  selectOffset(row: number, column: number): void {
    this.selectedOffset$.next(row * 16 + column);
  }

  private generateStruct(message: Message): Observable<StructElement[]> {
    if (!message.data || !message.type || (<string>message.type) === "unknown") {
      return of([]);
    }
    return this.http.get(`https://raw.githubusercontent.com/ffxiv-teamcraft/pcap-ffxiv/main/src/packet-processors/processors/${message.type}.ts`, { responseType: "text" }).pipe(
      map(ts => {
        if (!message.data || !message.parsedIpcData) {
          return [];
        }
        const structArray = new Array(message.data.length - 1).fill(null);
        let offset = 0x28;
        const props = (ts.match(/(\w+): reader\./gmi) || []).map(prop => prop.split(":")[0]);
        console.log(props);
        props
          .forEach(key => {
            const match = new RegExp(`${key}:\\s?\\w+\\.?(skip\\((\\d+)\\))?\\.next(\\w+)\\((\\w*)\\)`).exec(ts);
            if (match) {
              const skip = match[1] !== undefined;
              const skipLength = skip ? +match[2] : 0;
              const type = match[3];
              const params = match[4];
              const length = this.getDataLength(type, params);
              let struct: StructElement[];
              if (length === 1) {
                struct = [{
                  type: "block",
                  label: key
                }];
              } else {
                struct = [
                  {
                    type: "start"
                  },
                  ...(length > 2 ? new Array(length - 2) : []).fill(
                    {
                      type: "body"
                    }),
                  {
                    type: "end",
                    label: key
                  }
                ];
              }
              offset += skipLength;
              structArray.splice(offset, length, ...struct);
              offset += length;
            }
          });
        return structArray;
      })
    );
  }

  private getDataLength(type: string, params: string): number {
    switch (type) {
      case "UInt8":
        return 1;
      case "UInt16":
        return 2;
      case "UInt32":
        return 4;
      case "UInt64":
        return 8;
      default:
        return 1;
    }
  }

}
