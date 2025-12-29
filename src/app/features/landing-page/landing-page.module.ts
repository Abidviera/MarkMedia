import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LandingPageRoutingModule } from './landing-page-routing.module';
import { ContainerComponent } from './components/container/container.component';
import { FormsModule } from '@angular/forms';
import { HeroComponent } from './hero/hero.component';
import { ServicesComponent } from './services/services.component';
import { ProjectsComponent } from './components/projects/projects.component';


@NgModule({
  declarations: [
    ContainerComponent,
    HeroComponent,
    ServicesComponent,
    ProjectsComponent
  ],
  imports: [
    CommonModule,
    LandingPageRoutingModule,
     FormsModule
  ]
})
export class LandingPageModule { }
