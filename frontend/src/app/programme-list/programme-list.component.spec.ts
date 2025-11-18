import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgrammeListComponent } from './programme-list.component';

describe('ProgrammeListComponent', () => {
  let component: ProgrammeListComponent;
  let fixture: ComponentFixture<ProgrammeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgrammeListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgrammeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
