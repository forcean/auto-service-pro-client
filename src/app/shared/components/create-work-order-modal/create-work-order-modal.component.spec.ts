import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateWorkOrderModalComponent } from './create-work-order-modal.component';

describe('CreateWorkOrderModalComponent', () => {
  let component: CreateWorkOrderModalComponent;
  let fixture: ComponentFixture<CreateWorkOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateWorkOrderModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateWorkOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
