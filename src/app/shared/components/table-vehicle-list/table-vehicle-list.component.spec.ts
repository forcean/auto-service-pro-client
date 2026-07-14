import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableVehicleListComponent } from './table-vehicle-list.component';

describe('TableVehicleListComponent', () => {
  let component: TableVehicleListComponent;
  let fixture: ComponentFixture<TableVehicleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableVehicleListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableVehicleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
