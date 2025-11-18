import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// 🔹 Tes composants (non-standalone désormais)
import { ProgrammeListComponent } from './programme-list/programme-list.component';
import { FrontendFilterComponent } from './frontend-filter/frontend-filter.component';
import { ProgramExtractionFilterComponent } from './program-extraction-filter/program-extraction-filter.component';
import { ExtractedLinksComponent } from './extracted-links/extracted-links.component';

// 🔹 Angular Forms
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// 🔹 Angular Material
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent,
    ProgrammeListComponent,
    FrontendFilterComponent,
    ProgramExtractionFilterComponent,
    ExtractedLinksComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,

    // Forms
    FormsModule,
    ReactiveFormsModule,

    // HTTP
    HttpClientModule,

    // Angular Material
    MatTableModule,
    MatCheckboxModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
