import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContainerComponent } from './components/container/container.component';
import { HeroComponent } from './hero/hero.component';
import { ServicesComponent } from './services/services.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';

const routes: Routes = [
   {path: '', component:ContainerComponent },
   {path: 'h', component:HeroComponent },
   {path: 's', component:ServicesComponent },
   {path: 'project', component:ProjectsComponent },
   {path: 'test', component:TestimonialsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LandingPageRoutingModule { }
