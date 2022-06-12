import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "string"
})
export class StringPipe implements PipeTransform {

  transform(value: number): string {
    if (value >= 0x20 && value <= 0xFF) {
      return String.fromCharCode(value);
    }
    return ".";
  }

}
