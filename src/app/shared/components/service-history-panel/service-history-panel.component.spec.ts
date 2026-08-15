import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceHistoryPanelComponent } from './service-history-panel.component';

describe('ServiceHistoryPanelComponent', () => {
  let component: ServiceHistoryPanelComponent;
  let fixture: ComponentFixture<ServiceHistoryPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceHistoryPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceHistoryPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
