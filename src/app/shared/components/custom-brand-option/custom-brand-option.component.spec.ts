import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomBrandOptionComponent } from './custom-brand-option.component';

describe('CustomBrandOptionComponent', () => {
  let component: CustomBrandOptionComponent;
  let fixture: ComponentFixture<CustomBrandOptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomBrandOptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomBrandOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
