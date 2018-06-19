import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { GenresComponent } from './genres.component';

@NgModule({
  declarations: [
    GenresComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [GenresComponent]
})
export class GenresModule { }
