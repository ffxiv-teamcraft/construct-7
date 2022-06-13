import { Message } from "@ffxiv-teamcraft/pcap-ffxiv";

export const Filters: Record<string, (message: Message, param: string) => boolean> = {
  opcode: (message: Message, opcode: string) => {
    return message.opcode === Number(opcode);
  },
  uint32: (message: Message, value: string) => {
    if (!message.data) {
      return false;
    }
    const numberValue = Number(value);
    if (!numberValue || isNaN(numberValue)) {
      return true;
    }
    const buffer = Buffer.from(message.data);
    return message.data.slice(1, -4).some((_, index) => {
      return buffer.readUInt32LE(index) === numberValue;
    });
  }
};
