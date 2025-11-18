import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { GN2CommonModule } from '@geonature_common/GN2Common.module';

// 🔹 Import des composants du module Quadrige
import { ProgrammeListComponent } from './programme-list/programme-list.component';
import { FrontendFilterComponent } from './frontend-filter/frontend-filter.component';
import { ProgramExtractionFilterComponent } from './program-extraction-filter/program-extraction-filter.component';
import { ExtractedLinksComponent } from './extracted-links/extracted-links.component';

@NgModule({
  declarations: [
    ProgrammeListComponent,
    FrontendFilterComponent,
    ProgramExtractionFilterComponent,
    ExtractedLinksComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    GN2CommonModule,   // 🔥 indispensable pour les formulaires GN
  ],
})
export class GnModuleQuadrigeModule {}
