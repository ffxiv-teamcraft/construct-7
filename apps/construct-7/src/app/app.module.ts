import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { NzTableModule } from "ng-zorro-antd/table";
import { PipesModule } from "./pipes/pipes.module";
import { NzGridModule } from "ng-zorro-antd/grid";
import { NzCardModule } from "ng-zorro-antd/card";
import { NzEmptyModule } from "ng-zorro-antd/empty";
import { registerLocaleData } from "@angular/common";
import en from "@angular/common/locales/en";
import { en_US, NZ_I18N } from "ng-zorro-antd/i18n";
import { DissectorComponent } from "./components/dissector/dissector.component";
import { NzDividerModule } from "ng-zorro-antd/divider";
import { XivapiClientModule } from "@xivapi/angular-client";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzSelectModule } from "ng-zorro-antd/select";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NzIconModule } from "ng-zorro-antd/icon";
import { NzToolTipModule } from "ng-zorro-antd/tooltip";
import { HttpClientModule } from "@angular/common/http";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzAutocompleteModule } from "ng-zorro-antd/auto-complete";

registerLocaleData(en);

@NgModule({
  declarations: [AppComponent, DissectorComponent],
  imports: [
    BrowserModule,
    XivapiClientModule.forRoot(),
    BrowserAnimationsModule,
    HttpClientModule,

    NzTableModule,
    PipesModule,
    NzGridModule,
    NzCardModule,
    NzEmptyModule,
    NzDividerModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    FormsModule,
    NzIconModule,
    NzToolTipModule,
    ReactiveFormsModule,
    NzFormModule,
    NzAutocompleteModule
  ],
  providers: [{ provide: NZ_I18N, useValue: en_US }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
