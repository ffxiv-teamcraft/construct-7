import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PipesModule } from './pipes/pipes.module';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { DissectorComponent } from "./components/hex-grid/dissector.component";
import { NzDividerModule } from "ng-zorro-antd/divider";

registerLocaleData(en);

@NgModule({
  declarations: [AppComponent, DissectorComponent],
  imports: [
    BrowserModule,
    NzTableModule,
    PipesModule,
    NzGridModule,
    NzCardModule,
    NzEmptyModule,
    NzDividerModule
  ],

  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent],
})
export class AppModule {}
