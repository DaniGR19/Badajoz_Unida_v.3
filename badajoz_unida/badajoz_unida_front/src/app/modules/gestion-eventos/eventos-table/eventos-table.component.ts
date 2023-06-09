/**
 @file Contiene la tabla con los datos de los eventos
 @author Daniel García <danielgarciarasero.guadalupe@alumnado.fundacionloyola.net>
 @author Juan Daniel Carvajal <juandanielcarvajalmontes.guadalupe@alumnado.fundacionloyola.net>
 **/

import {AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {EventosService} from "../../../services/eventos.service";
import {Subject} from "rxjs";
import {DataTableDirective} from "angular-datatables";
import {CategoriasService} from "../../../services/categorias.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import Swal from "sweetalert2";

@Component({
  selector: 'app-eventos-table',
  templateUrl: './eventos-table.component.html',
  styleUrls: ['./eventos-table.component.css']
})

/**
 Tabla con los datos de los eventos
 **/
export class EventosTableComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dataTable', { static: false }) table: ElementRef;
  @ViewChild(DataTableDirective, { static: false }) dirDataTable: DataTableDirective;
  @Output() mostrarModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() editEvent: EventEmitter<any> = new EventEmitter<any>();
  eventos: any;
  categorias: any;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any;
  dtTable: DataTables.Api;
  formFilter!: FormGroup;
  loading: boolean = true;
  alert = Swal.mixin({
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    stopKeydownPropagation: true,
    customClass: {
      confirmButton: 'btn btn-danger',
      cancelButton: 'btn btn-light'
    },
    buttonsStyling: false
  });
  /**
   Constructor de la clase
   @param eventoService {EventosService} Servicio que gestiona los datos de los eventos
   **/
  constructor(private eventoService: EventosService, private catService: CategoriasService, private formBuilder: FormBuilder) {
  }

  /**
   Método que inicializa la vista
   **/
  ngOnInit() {
    this.initForm()
    this.catService.getCategorias().subscribe((data) => {
      this.categorias = data;
    });
    this.dtOptions = {
      paging: true,
      searching: true,
      ordering: true,
      info: true,
      destroy: true
    };
    // @ts-ignore
    this.dtTrigger.next();
    this.getEventos();
  }

  /**
   * Método para la obtención de todos los métodos registrados en la aplicación
   */
  getEventos(){
    this.eventoService.getAllEventos().subscribe((data) => {
      this.eventos = data;
      console.log("EVENTOS:", this.eventos);
      this.cargarTabla();
    });
  }
  /**
   Método que realiza acciones después de iniciar la vista
   **/
  ngAfterViewInit() {
  }

  /**
   Método que destruye la vista
   **/
  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
    if (this.dtTable) {
      this.dtTable.destroy()
    }
  }

  /**
   Método que carga los datos en la datatable
   **/
  cargarTabla() {
    this.loading = false;
      $(this.table.nativeElement).DataTable().destroy();
      this.dtOptions = {
        paging: true,
        searching: false,
        ordering: true,
        info: true,
        destroy: true
      };
      setTimeout(() => {
        $(this.table.nativeElement).DataTable(this.dtOptions);
        // @ts-ignore
        this.dtTrigger.next();
      }, 1);
    }

  /**
   * Método para la inicialización del formulario del componente
   * @private
   */
  private initForm() {
    this.formFilter = this.formBuilder.group({
      nombre:[],
      localizacion:[],
      fechaInit:[],
      fechaEnd:[],
      intereses:[]
    });
  }

  /**
   * Método para realizar el filtrado de Eventos en la aplicación
   */
  filtrarBusqueda() {
    const intereses = this.formFilter.get('intereses').value;
    const fechaInitValue = this.formFilter.get('fechaInit').value;
    const fechaEndValue = this.formFilter.get('fechaEnd').value;

    const fechaInit = fechaInitValue ? new Date(fechaInitValue) : null;
    const fechaEnd = fechaEndValue ? new Date(fechaEndValue) : null;

    if (fechaInit && isNaN(fechaInit.getTime())) {
      return;
    }

    if (fechaEnd && isNaN(fechaEnd.getTime())) {
      return;
    }

    const filtros = {
      nombre: this.formFilter.get('nombre').value,
      localizacion: this.formFilter.get('localizacion').value,
      fechaInit: fechaInit ? fechaInit.toISOString() : null,
      fechaEnd: fechaEnd ? fechaEnd.toISOString() : null,
      intereses: Array.isArray(intereses) ? intereses : [intereses]
    };

    console.log("ENVIANDO");
    this.eventoService.getEventosFiltered(filtros).subscribe((data) => {
      this.eventos = data;
      console.log("EVENTOS FILTRADOS", this.eventos);
      this.cargarTabla();
    });
  }

  /**
   * Método para la emisión al componente padre de la señal para desplegar el modal
   */
  mostrarModalEventos(){
    this.mostrarModal.emit();
  }

  /**
   * Método para eliminar un registro de evento del sistema
   * @param eventosId
   * @param evento
   */
  deleteEvent(eventosId: number, evento:any) {
    this.alert.fire({
      icon:'question',
      title:'¿Estás seguro que deseas eliminar el Evento',
      text:'Se eliminara el evento con nombre' + evento?.nombre + 'de forma permanente',
      showConfirmButton: true,
      showCancelButton: true
    }).then((result) =>{
      if(result.isConfirmed){
        this.alert.fire({
          title:'Espere mientras procesamos su solicitud',
          didOpen(popup: HTMLElement) {
            Swal.showLoading();
          }
        })
        this.eventoService.deleteEventById(eventosId).subscribe((data) =>{
          console.log("ELIMINADO", data);
          this.alert.fire({
            title: 'Eliminado con éxito!',
            text: 'El evento con nombre' + evento?.nombre +'ha sido eliminado correctamente.',
            icon: 'success',
            timer: 4000,
            showConfirmButton: false,
            showCancelButton: false,
          });
          this.getEventos();
        }, error=>{
          this.alert.fire({
            title: 'Ocurrió un problema!',
            text: 'Vuelva a intentarlo en otro momento',
            icon: 'error',
            timer: 4000,
            showConfirmButton: false,
            showCancelButton: false,
          });
        });
      }
    });
  }

  /**
   * Método para la modificación de un evento
   * @param eventosId
   */
  modEvent(eventosId: number) {
    this.eventoService.getEventosById(eventosId).subscribe((data) =>{
      this.eventoService.setEditEvent(data);
      this.editEvent.emit()
    });
  }

  /**
   * Método para la exportación de un Evento a excell
   * @param eventosId
   * @param evento
   */
  exportExcell(eventosId: any, evento:any) {
    this.eventoService.getExcellEvent(eventosId).subscribe(data =>{
      const blob = new Blob([data],{type:'application/vnd.ms-excel'})
      const link = document.createElement('a');
      link.href = URL.createObjectURL(data);
      link.download = evento?.nombre+'.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }

  /**
   * Método para la exportación de un Evento a pdf
   * @param eventosId
   * @param evento
   */
  exportPdf(eventosId: any, evento:any){
    this.eventoService.getPdfEvent(eventosId).subscribe(data =>{
      const blob = new Blob([data],{type:'application/pdf'})
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = evento?.nombre+'.pdf';
      link.click();
      URL.revokeObjectURL(link.href);
    });
  }
}
