import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingPageRoutingModule } from './landing-page-routing.module';
import { ContainerComponent } from './components/container/container.component';
import { FormsModule } from '@angular/forms';
import { HeroComponent } from './hero/hero.component';
import { ServicesComponent } from './services/services.component';


@NgModule({
  declarations: [
    ContainerComponent,
    HeroComponent,
    ServicesComponent
  ],
  imports: [
    CommonModule,
    LandingPageRoutingModule,
     FormsModule
  ]
})
export class LandingPageModule { }
