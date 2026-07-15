import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleWorkOrdersComponent } from './vehicle-work-orders.component';

describe('VehicleWorkOrdersComponent', () => {
  let component: VehicleWorkOrdersComponent;
  let fixture: ComponentFixture<VehicleWorkOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VehicleWorkOrdersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleWorkOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
