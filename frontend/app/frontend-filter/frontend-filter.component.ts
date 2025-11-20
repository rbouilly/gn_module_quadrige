import { Component, EventEmitter, Output } from '@angular/core';
import {
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

  // 🔹 Typage strict du form
  filterForm: FormGroup<{
    name: FormControl<string>;
    fields: FormControl<string[]>;
    fieldInput: FormControl<string>;
    startDate: FormControl<Date | null>;
    endDate: FormControl<Date | null>;
  }>;

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

    this.filterForm = this.fb.nonNullable.group({
      name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
      fields: this.fb.nonNullable.control<string[]>([]),
      fieldInput: this.fb.nonNullable.control<string>(''),
      startDate: this.fb.control<Date | null>(null),
      endDate: this.fb.control<Date | null>(null),
    });
  }

  // 🔹 Typage strict
  get fieldInputControl(): FormControl<string> {
    return this.filterForm.controls.fieldInput;
  }

  get remainingFields(): string[] {
    const selected: string[] = this.filterForm.controls.fields.value || [];
    return this.availableFields.filter(f => !selected.includes(f));
  }

  // 🔹 Typage strict: plus de implicit any
  isFormValid(): boolean {
    const { name, fields, startDate, endDate } = this.filterForm.value;

    const nameValid = !!name && name.trim().length >= 3;
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

  // 🔹 Typage strict
  addField(field: string): void {
    if (!field) return;

    const current = this.filterForm.controls.fields.value;
    if (!current.includes(field)) {
      this.filterForm.controls.fields.setValue([...current, field]);
      this.filterForm.controls.fieldInput.setValue('');
    }
  }

  removeField(field: string): void {
    const fields = this.filterForm.get('fields') as FormControl<string[]>;
    const current = fields.value ?? [];
    fields.setValue(current.filter((f: string) => f !== field));
  }



  applyFilter(): void {
    if (!this.isFormValid()) return;

    const formatDate = (d: Date | null) =>
      d ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` : null;

    const { name, fields, startDate, endDate } = this.filterForm.value;

    const filterData = {
      name,
      fields,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    };

    this.apply.emit(filterData);
  }
}
