import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "hex"
})
export class HexPipe implements PipeTransform {

  transform(value: number, padLength?: number, includePrefix = true): string {
    const hexValue = value.toString(16).toUpperCase();
    const display = padLength ? hexValue.padStart(padLength, "0") : hexValue;
    return `${includePrefix ? "0x" : ""}${display}`;
  }

}
