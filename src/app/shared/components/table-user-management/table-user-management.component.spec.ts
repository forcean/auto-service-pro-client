import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableUserManagementComponent } from './table-user-management.component';

describe('TableUserManagementComponent', () => {
  let component: TableUserManagementComponent;
  let fixture: ComponentFixture<TableUserManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableUserManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableUserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
