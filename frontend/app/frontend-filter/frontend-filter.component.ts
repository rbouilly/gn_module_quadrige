import { Component, EventEmitter, Output } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-frontend-filter',
  templateUrl: './frontend-filter.component.html',
  styleUrls: ['./frontend-filter.component.scss']
})
export class FrontendFilterComponent {
  @Output() apply = new EventEmitter<any>();
  @Output() close = new EventEmitter<void>();

  filterForm: FormGroup;

  availableFields: string[] = [
    'MEASUREMENT_COMMENT',
    'MEASUREMENT_PMFMU_METHOD_NAME',
    'MEASUREMENT_NUMERICAL_VALUE',
    'MEASUREMENT_PMFMU_PARAMETER_NAME',
    'MEASUREMENT_REFERENCE_TAXON_NAME',
    'MEASUREMENT_REFERENCE_TAXON_TAXREF',
    'MEASUREMENT_STRATEGIES_NAME',
    'MEASUREMENT_UNDER_MORATORIUM',
    'MEASUREMENT_PMFMU_UNIT_SYMBOL',
    'MONITORING_LOCATION_BATHYMETRY',
    'MONITORING_LOCATION_CENTROID_LATITUDE',
    'MONITORING_LOCATION_CENTROID_LONGITUDE',
    'MONITORING_LOCATION_ID',
    'MONITORING_LOCATION_LABEL',
    'MONITORING_LOCATION_NAME',
    'SAMPLE_LABEL',
    'SAMPLE_MATRIX_NAME',
    'SAMPLE_SIZE',
    'SAMPLE_TAXON_NAME',
    'SURVEY_COMMENT',
    'SURVEY_DATE',
    'SURVEY_LABEL',
    'SURVEY_NB_INDIVIDUALS',
    'SURVEY_OBSERVER_DEPARTMENT_ID',
    'SURVEY_OBSERVER_DEPARTMENT_LABEL',
    'SURVEY_OBSERVER_DEPARTMENT_NAME',
    'SURVEY_OBSERVER_DEPARTMENT_SANDRE',
    'SURVEY_OBSERVER_ID',
    'SURVEY_OBSERVER_NAME',
    'SURVEY_PROGRAMS_NAME',
    'SURVEY_RECORDER_DEPARTMENT_ID',
    'SURVEY_RECORDER_DEPARTMENT_LABEL',
    'SURVEY_RECORDER_DEPARTMENT_NAME',
    'SURVEY_RECORDER_DEPARTMENT_SANDRE',
    'SURVEY_TIME',
    'SURVEY_UNDER_MORATORIUM',
  ];

  constructor(private fb: FormBuilder) {
    this.filterForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      fields: [[]],
      fieldInput: new FormControl(''),
      startDate: new FormControl<Date | null>(null),
      endDate: new FormControl<Date | null>(null)
    });
  }

  get fieldInputControl(): FormControl {
    return this.filterForm.get('fieldInput') as FormControl;
  }

  get remainingFields(): string[] {
    const selected = this.filterForm.value.fields || [];
    return this.availableFields.filter(f => !selected.includes(f));
  }

  isFormValid(): boolean {
    const { name, fields, startDate, endDate } = this.filterForm.value;

    const nameValid = name && name.trim().length >= 3;
    const fieldsValid = Array.isArray(fields) && fields.length > 0;

    let periodValid = true;
    if (startDate || endDate) {
      periodValid = !!(startDate && endDate && startDate <= endDate);
    }

    return nameValid && fieldsValid && periodValid;
  }

  get fieldsInvalid(): boolean {
    return !this.filterForm.value.fields?.length;
  }

  get dateRangeInvalid(): boolean {
    const { startDate, endDate } = this.filterForm.value;
    if (!startDate && !endDate) return false;
    if (!startDate || !endDate) return true;
    return startDate > endDate;
  }

  addField(field: string): void {
  if (!field) return;

  const fields = (this.filterForm.value.fields as string[]) || [];
  if (!fields.includes(field)) {
    this.filterForm.patchValue({
      fields: [...fields, field],
      fieldInput: ''
    });
  }
}

  removeField(field: string): void {
  const fields = (this.filterForm.value.fields as string[]) || [];
  this.filterForm.patchValue({
    fields: fields.filter((f: string) => f !== field)
  });
}


  applyFilter(): void {
    if (!this.isFormValid()) return;

    const formatDate = (d: Date | null) =>
      d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null;

    const filterData = {
      name: this.filterForm.value.name,
      fields: this.filterForm.value.fields,
      startDate: formatDate(this.filterForm.value.startDate),
      endDate: formatDate(this.filterForm.value.endDate)
    };

    this.apply.emit(filterData);
  }
}
