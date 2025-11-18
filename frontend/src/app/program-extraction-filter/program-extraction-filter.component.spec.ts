import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramExtractionFilterComponent } from './program-extraction-filter.component';

describe('ProgramExtractionFilterComponent', () => {
  let component: ProgramExtractionFilterComponent;
  let fixture: ComponentFixture<ProgramExtractionFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramExtractionFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramExtractionFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
