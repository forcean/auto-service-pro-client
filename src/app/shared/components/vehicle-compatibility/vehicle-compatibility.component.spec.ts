import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleCompatibilityComponent } from './vehicle-compatibility.component';

describe('VehicleCompatibilityComponent', () => {
  let component: VehicleCompatibilityComponent;
  let fixture: ComponentFixture<VehicleCompatibilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehicleCompatibilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleCompatibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
