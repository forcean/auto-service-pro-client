import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CorporateAdminListComponent } from './corporate-admin-list.component';

describe('CorporateAdminListComponent', () => {
  let component: CorporateAdminListComponent;
  let fixture: ComponentFixture<CorporateAdminListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CorporateAdminListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CorporateAdminListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
