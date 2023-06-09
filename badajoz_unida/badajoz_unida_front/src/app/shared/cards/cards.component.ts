/**
 @file Contiene la vista de las tarjetas de la página
 @author Daniel García <danielgarciarasero.guadalupe@alumnado.fundacionloyola.net>
 @author Juan Daniel Carvajal <juandanielcarvajalmontes.guadalupe@alumnado.fundacionloyola.net>
 **/

import {Component, Input, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {EventosService} from "../../services/eventos.service";
import {Util} from "leaflet";
import formatNum = Util.formatNum;
import {AlertsService} from "../../services/alerts.service";

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})

/**
 Vista de las tarjetas
 **/
export class CardsComponent implements OnInit{

  @Input() evento: any;
  @Input() desapuntarse: boolean = false;

  /**
   Constructor de la clase
   @param router {Router} Clase para la navegación entre componentes
   **/
  constructor(private router: Router, private _eventosService: EventosService, private _alertsService: AlertsService) {
  }

  ngOnInit() {
  }

  /**
   Cambia al componente que muestra los detalles del evento
   **/
  showEvent(id: number){
    this.router.navigate(['/eventos', id]);
  }

  async removeUserFromEvent(eventoId: number){
    let respuesta = await this._alertsService.askConfirmation('Quieres desapuntarte de ' + this.evento.nombre, '¿Estas seguro de querer desapuntarte de este evento?');
    if(respuesta){
      this._eventosService.removeUserFromEvent(eventoId).subscribe((data: any) => {
        if (data['status'] != 'error') {
          this._alertsService.showInfoAlert('Te has desapuntado del evento', 'Que pena que no puedas acompañarnos, esperamos verte en otro evento');
          this._eventosService.setNotificationCards();
        }
      });
    }
  }

}
