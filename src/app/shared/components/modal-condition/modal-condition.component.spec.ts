import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalConditionComponent } from './modal-condition.component';

describe('ModalConditionComponent', () => {
  let component: ModalConditionComponent;
  let fixture: ComponentFixture<ModalConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalConditionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModalConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
