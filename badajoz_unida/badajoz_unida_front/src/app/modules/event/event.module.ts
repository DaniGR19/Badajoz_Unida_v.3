import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventRoutingModule } from './event-routing.module';
import { EventComponent } from './event/event.component';
import {DirectivesModule} from "../../directives/directives.module";
import {ModalsModule} from "../../components/modals/modals.module";


@NgModule({
  declarations: [
    EventComponent
  ],
    imports: [
        CommonModule,
        EventRoutingModule,
        DirectivesModule,
        ModalsModule
    ]
})
export class EventModule { }
