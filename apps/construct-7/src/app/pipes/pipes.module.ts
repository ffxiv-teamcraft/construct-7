import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HexPipe } from "./hex.pipe";
import { PacketJsonPipe } from "./packet-json.pipe";
import { StringPipe } from "./string.pipe";


@NgModule({
  declarations: [
    HexPipe,
    PacketJsonPipe,
    StringPipe
  ],
  exports: [
    HexPipe,
    PacketJsonPipe,
    StringPipe
  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule {
}
