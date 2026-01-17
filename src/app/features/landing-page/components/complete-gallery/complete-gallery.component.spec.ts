import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompleteGalleryComponent } from './complete-gallery.component';

describe('CompleteGalleryComponent', () => {
  let component: CompleteGalleryComponent;
  let fixture: ComponentFixture<CompleteGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompleteGalleryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompleteGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
