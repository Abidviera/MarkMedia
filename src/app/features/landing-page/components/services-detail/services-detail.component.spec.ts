import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesDetailComponent } from './services-detail.component';

describe('ServicesDetailComponent', () => {
  let component: ServicesDetailComponent;
  let fixture: ComponentFixture<ServicesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServicesDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
