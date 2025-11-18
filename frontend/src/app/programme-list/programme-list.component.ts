import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Programme } from '../models/programmes';
import { ExtractedLink } from '../models/extractedLinks';
import { ExtractionResponse } from '../models/extraction-response';
import { ProgramExtractionResponse } from '../models/program-extraction-response';

@Component({
  selector: 'app-programme-list',
  templateUrl: './programme-list.component.html',
  styleUrls: ['./programme-list.component.scss']
})
export class ProgrammeListComponent implements OnInit {

  programmes: Programme[] = [];

  extractedDataFiles: ExtractedLink[] = [];
  extractedProgramFiles: ExtractedLink[] = [];
  displayedColumns: string[] = ['select', 'name', 'libelle', 'startDate', 'etat', 'responsable'];

  message: string = '';
  isLoading: boolean = false;
  allSelected = false;
  searchText: string = '';
  showDataFilter = false;
  showProgramFilter = false;

  dataFilter: any = null;
  programFilter: any = null;

  monitoringLocation: string = '';
  monitoringLabel: string = '';

  private locationLabels = [
    { code: '126-', label: 'Réunion' },
    { code: '145-', label: 'Mayotte' },
    { code: '048-', label: 'Maurice' },
    { code: '153-', label: 'Île Tromelin' },
    { code: '152-', label: 'Îles Glorieuses' },
    { code: '154-', label: 'Île Juan de Nova' },
    { code: '155-', label: 'Île Bassas da India' },
    { code: '156-', label: 'Île Europa' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.initialiserProgrammes();
  }

  private initialiserProgrammes() {
    this.http.get<any>('http://localhost:5000/last-programmes').subscribe({
      next: (res) => {
        if (res?.status === 'ok' && Array.isArray(res?.programmes) && res.programmes.length > 0) {

          this.programmes = (res.programmes as Programme[]).map((p: Programme) => ({
            ...p,
            checked: false
          }));

          this.monitoringLocation = res?.monitoringLocation || '';
          this.updateMonitoringLabel();
          this.extractedProgramFiles = this.mapToExtractedLinks(res?.fichiers_csv || []);
          this.message = `✅ ${this.programmes.length} programmes chargés (${this.monitoringLocation})`;
        } else {
          this.extractedProgramFiles = this.mapToExtractedLinks(res?.fichiers_csv || []);
          this.message = "Aucun programme sauvegardé.";
        }
      },
      error: (err) => {
        console.error("[FRONTEND] ❌ Erreur backend :", err);
        this.message = "Erreur lors du chargement des derniers programmes.";
      }
    });
  }

  private updateMonitoringLabel(): void {
    const found = this.locationLabels.find(l => this.monitoringLocation.startsWith(l.code));
    this.monitoringLabel = found ? found.label : '';
  }

  private mapToExtractedLinks(raw: any): ExtractedLink[] {
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item: any) => ({
        file_name: item?.file_name ?? item?.programme ?? item?.name ?? 'fichier',
        url: item?.url ?? ''
      }))
      .filter((f: ExtractedLink) => !!f.url);
  }

  get filteredProgrammes() {
    if (!this.searchText) return this.programmes;
    return this.programmes.filter(p =>
      p.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  isSearchActive(): boolean {
    return this.searchText.trim().length > 0;
  }

  toggleAll() {
    this.programmes.forEach(p => (p.checked = this.allSelected));
  }

  openDataFilter() {
    this.showProgramFilter = false;
    this.showDataFilter = true;
  }

  openProgramFilter() {
    this.showDataFilter = false;
    this.showProgramFilter = true;
  }

  onDataFilterApplied(filterData: any) {
    this.message = 'filtre de données appliqué.';
    this.showDataFilter = false;

    const { monitoringLocation, ...filterWithoutLocation } = filterData;
    this.dataFilter = filterWithoutLocation;
  }

  onProgramFilterApplied(filterData: any) {
    this.message = 'filtre de programmes appliqué.';
    this.showProgramFilter = false;
    this.programFilter = filterData;
  }

  extractPrograms() {
    if (!this.programFilter) {
      this.message = 'Veuillez définir un filtre d’extraction de programmes.';
      return;
    }

    this.isLoading = true;
    this.message = 'Extraction et filtrage des programmes en cours...';

    this.http.post<ProgramExtractionResponse>(
      'http://localhost:5000/program-extraction',
      { filter: this.programFilter }
    ).subscribe({
      next: (res) => {
        this.monitoringLocation = this.programFilter?.monitoringLocation || '';
        this.updateMonitoringLabel();

        if (res?.status === 'ok') {
          this.extractedProgramFiles = this.mapToExtractedLinks(res.fichiers_csv);

          if (Array.isArray(res.programmes)) {
            this.programmes = (res.programmes as Programme[]).map((p: Programme) => ({
              ...p,
              checked: false
            }));
          }

          this.message = `✅ Extraction terminée (${this.programmes.length} programmes)`;
        } else {
          this.message = res?.message ?? 'Réponse inattendue du serveur';
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.message = err?.error?.message ?? 'Erreur serveur inattendue';
        this.isLoading = false;
      }
    });
  }

  relancerFiltrageSeul() {
    this.isLoading = true;

    this.http.post<any>(
      'http://localhost:5000/filtrage_seul',
      { filter: this.programFilter || {} }
    ).subscribe({
      next: (res) => {
        this.extractedProgramFiles = this.mapToExtractedLinks(res.fichiers_csv || []);

        if (Array.isArray(res.programmes)) {
          this.programmes = (res.programmes as Programme[]).map((p: Programme) => ({
            ...p,
            checked: false
          }));
          this.message = `✅ Filtrage relancé (${this.programmes.length} programmes)`;
        } else {
          this.message = res?.message ?? 'Aucun programme trouvé';
        }

        this.isLoading = false;
      },
      error: () => {
        this.message = "Erreur lors du filtrage seul.";
        this.isLoading = false;
      }
    });
  }

  extractData() {
    const selectedPrograms = this.programmes
      .filter(p => p.checked)
      .map(p => p.name);

    if (!this.dataFilter) {
      this.message = 'Veuillez définir un filtre avant de lancer une extraction.';
      return;
    }

    if (selectedPrograms.length === 0) {
      this.message = 'Veuillez sélectionner au moins un programme.';
      return;
    }

    this.isLoading = true;
    this.message = 'Extraction des données en cours...';

    this.http.post<ExtractionResponse>(
      'http://localhost:5000/data-extractions',
      { programmes: selectedPrograms, filter: this.dataFilter }
    ).subscribe({
      next: (res) => {
        if (res?.status === 'ok') {
          this.extractedDataFiles = this.mapToExtractedLinks(res?.fichiers_zip);
          this.message = `Fichiers extraits (${this.extractedDataFiles.length})`;
        } else {
          this.message = res?.message ?? 'Réponse inattendue du serveur';
          this.extractedDataFiles = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.message = err?.error?.message ?? 'Erreur serveur inattendue';
        this.extractedDataFiles = [];
        this.isLoading = false;
      }
    });
  }
}
