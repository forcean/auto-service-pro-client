import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleStepSelectorComponent } from './vehicle-step-selector.component';

describe('VehicleStepSelectorComponent', () => {
  let component: VehicleStepSelectorComponent;
  let fixture: ComponentFixture<VehicleStepSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehicleStepSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleStepSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
