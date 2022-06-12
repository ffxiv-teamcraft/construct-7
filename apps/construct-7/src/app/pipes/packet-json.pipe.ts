import { Pipe, PipeTransform } from "@angular/core";
import { Message } from "@ffxiv-teamcraft/pcap-ffxiv";

@Pipe({
  name: "packetJson"
})
export class PacketJsonPipe implements PipeTransform {

  transform(packet: Message): string {
    if (!packet.parsedIpcData) {
      return "";
    }
    return JSON.stringify(packet.parsedIpcData, (key, value) => {
      return typeof value === "bigint" ? `BigInt(${value.toString()})` : value;
    }, 2);
  }

}
