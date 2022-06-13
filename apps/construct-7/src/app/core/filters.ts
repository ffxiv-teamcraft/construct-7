import { Message } from "@ffxiv-teamcraft/pcap-ffxiv";

function bufferReadingFilter(message: Message, value: string | number, size: number, bufferReadFn: (buffer: Buffer, index: number) => number | string): boolean {
  if (!message.data) {
    return false;
  }
  const buffer = Buffer.from(message.data);
  return message.data.slice(1, -size).some((_, index) => {
    return bufferReadFn(buffer, index) === value;
  });
}

export const Filters: Record<string, (message: Message, param: string) => boolean> = {
  opcode: (message: Message, opcode: string) => {
    return message.opcode === Number(opcode);
  },
  type: (message: Message, type: string) => {
    if (type.endsWith("*")) {
      return message.type.startsWith(type.replace("*", ""));
    }
    return message.type === type;
  },
  uint32: (message: Message, value: string) => {
    const valueNumber = Number(value);
    if (isNaN(valueNumber)) {
      return true;
    }
    return bufferReadingFilter(message, valueNumber, 4, (buffer, index) => buffer.readUInt32LE(index));
  },
  int32: (message: Message, value: string) => {
    const valueNumber = Number(value);
    if (isNaN(valueNumber)) {
      return true;
    }
    return bufferReadingFilter(message, valueNumber, 4, (buffer, index) => buffer.readInt32LE(index));
  },
  uint16: (message: Message, value: string) => {
    const valueNumber = Number(value);
    if (isNaN(valueNumber)) {
      return true;
    }
    return bufferReadingFilter(message, valueNumber, 4, (buffer, index) => buffer.readUInt16LE(index));
  },
  int16: (message: Message, value: string) => {
    const valueNumber = Number(value);
    if (isNaN(valueNumber)) {
      return true;
    }
    return bufferReadingFilter(message, valueNumber, 4, (buffer, index) => buffer.readInt16LE(index));
  },
  uint8: (message: Message, value: string) => {
    const valueNumber = Number(value);
    if (isNaN(valueNumber)) {
      return true;
    }
    return bufferReadingFilter(message, valueNumber, 4, (buffer, index) => buffer.readUInt8(index));
  },
  int8: (message: Message, value: string) => {
    const valueNumber = Number(value);
    if (isNaN(valueNumber)) {
      return true;
    }
    return bufferReadingFilter(message, valueNumber, 4, (buffer, index) => buffer.readInt8(index));
  },
  string: (message: Message, value: string) => {
    if (!value || !message.data) {
      return true;
    }
    return message.data.toString("utf8").includes(value) || message.data.toString("ascii").includes(value);
  }
};
