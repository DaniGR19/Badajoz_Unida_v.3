/**
 @file Servicio que gestiona los datos de los idiomas
 @author Daniel García <danielgarciarasero.guadalupe@alumnado.fundacionloyola.net>
 @author Juan Daniel Carvajal <juandanielcarvajalmontes.guadalupe@alumnado.fundacionloyola.net>
 **/

import { Injectable } from '@angular/core';
import {Model} from "../models/model.model";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})

/**
 Servicio que gestiona los datos de los idiomas
 **/
export class IdiomasService {

  apiUrl: string ='http://localhost:8080/idiomas/';

  /**
   Constructor de la clase
   @param httpClient {HttpClient} Clase para realizar peticiones http
   **/
  constructor(private httpClient: HttpClient) { }

  /**
   Método que obtiene la colección de datos de todos los idiomas disponibles
   @return {Observable} Resultado de la petición GET
   **/
  getIdiomas(){
    return this.httpClient.get(this.apiUrl);
  }

}
