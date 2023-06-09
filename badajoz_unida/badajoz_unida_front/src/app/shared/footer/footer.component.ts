/**
 @file Contiene del footer
 @author Daniel García <danielgarciarasero.guadalupe@alumnado.fundacionloyola.net>
 @author Juan Daniel Carvajal <juandanielcarvajalmontes.guadalupe@alumnado.fundacionloyola.net>
 **/

import {AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})

/**
 Vista del footer
 **/
export class FooterComponent implements OnInit{

  anio!: number;
  @Output() tamanoFooter: EventEmitter<number> = new EventEmitter<number>();

  /**
   Método que inicializa la vista
   **/
  ngOnInit() {
    this.anio = new Date().getFullYear();
  }

  /**
   Método que abre enlaces a páginas web exteriores
   **/
  redirectTo(link: string){
    window.open(link, '_blank');
  }

}
