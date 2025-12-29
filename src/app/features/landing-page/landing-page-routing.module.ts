import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContainerComponent } from './components/container/container.component';
import { HeroComponent } from './hero/hero.component';
import { ServicesComponent } from './services/services.component';

const routes: Routes = [
   {path: 'd', component:ContainerComponent },
   {path: 's', component:HeroComponent },
   {path: '', component:ServicesComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingPageRoutingModule { }
