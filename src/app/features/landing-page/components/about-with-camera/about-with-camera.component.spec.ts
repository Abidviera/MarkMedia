import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutWithCameraComponent } from './about-with-camera.component';

describe('AboutWithCameraComponent', () => {
  let component: AboutWithCameraComponent;
  let fixture: ComponentFixture<AboutWithCameraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AboutWithCameraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutWithCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
