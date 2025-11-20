import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-program-extraction-filter',
  templateUrl: './program-extraction-filter.component.html',
  styleUrls: ['./program-extraction-filter.component.scss']
})
export class ProgramExtractionFilterComponent {
  @Output() apply = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  filterForm: FormGroup;

  sugested_locations = [
    { code: '126-', label: 'Réunion' },
    { code: '145-', label: 'Mayotte' },
    { code: '048-', label: 'Maurice' },
    { code: '153-', label: 'Île Tromelin' },
    { code: '152-', label: 'Îles Glorieuses' },
    { code: '154-', label: 'Île Juan De Nova' },
    { code: '155-', label: 'Île Bassas Da India' },
    { code: '156-', label: 'Île Europa' },
  ];

  filteredLocations$: Observable<any[]>;

  constructor(private fb: FormBuilder) {

    // 🔹 Donner un type explicite au FormControl
    this.filterForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      monitoringLocation: new FormControl<string>('', Validators.required)
    });

    // 🔹 Typage fort du valueChanges
    const monitoringCtrl = this.filterForm.get('monitoringLocation') as FormControl<string>;

    this.filteredLocations$ = monitoringCtrl.valueChanges.pipe(
      startWith(''),
      map((value: string) => this.filterLocations(value || ''))
    );
  }

  // 🔹 Typage strict OK
  private filterLocations(value: string): any[] {
    const f = value.toLowerCase();
    return this.sugested_locations.filter(loc =>
      loc.label.toLowerCase().includes(f) || loc.code.toLowerCase().includes(f)
    );
  }

  isFormValid(): boolean {
    return this.filterForm.valid;
  }

  applyFilter(): void {
    if (!this.isFormValid()) return;
    this.apply.emit(this.filterForm.value);
  }
}
