import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderCardComponent } from './work-order-card.component';

describe('WorkOrderCardComponent', () => {
  let component: WorkOrderCardComponent;
  let fixture: ComponentFixture<WorkOrderCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkOrderCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkOrderCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
