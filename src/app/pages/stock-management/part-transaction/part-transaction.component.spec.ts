import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartTransactionComponent } from './part-transaction.component';

describe('PartTransactionComponent', () => {
  let component: PartTransactionComponent;
  let fixture: ComponentFixture<PartTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PartTransactionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
