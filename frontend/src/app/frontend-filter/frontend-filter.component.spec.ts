import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrontendFilterComponent } from './frontend-filter.component';

describe('FrontendFilterComponent', () => {
  let component: FrontendFilterComponent;
  let fixture: ComponentFixture<FrontendFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FrontendFilterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrontendFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
