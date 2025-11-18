import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractedLinksComponent } from './extracted-links.component';

describe('ExtractedLinksComponent', () => {
  let component: ExtractedLinksComponent;
  let fixture: ComponentFixture<ExtractedLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtractedLinksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtractedLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
