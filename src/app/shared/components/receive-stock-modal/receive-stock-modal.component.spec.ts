import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiveStockModalComponent } from './receive-stock-modal.component';

describe('ReceiveStockModalComponent', () => {
  let component: ReceiveStockModalComponent;
  let fixture: ComponentFixture<ReceiveStockModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReceiveStockModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceiveStockModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
