import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import * as L from "leaflet";
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ModelNewEvent} from "../../../models/model-new-event";
import {CategoriasService} from "../../../services/categorias.service";
import {EventosService} from "../../../services/eventos.service";
import Swal from "sweetalert2";
import {ValidadoresService} from "../../../services/validadores.service";
import {AngularMultiSelect} from "angular2-multiselect-dropdown";

@Component({
  selector: 'app-crear-evento-modal',
  templateUrl: './crear-evento-modal.component.html',
  styleUrls: ['./crear-evento-modal.component.css']
})

/**
 Vista del modal para la creación de eventos
 **/
export class CrearEventoModalComponent implements OnInit{

  @ViewChild('multiselectIntereses',{static: false}) multiselect: AngularMultiSelect;
  @Output() cerrarModalEventos: EventEmitter<any> = new EventEmitter<any>();
  eventoEdit: any;
  map: any;
  marker: any;
  formCreateEvent!: FormGroup;
  categorias: any;
  selectedCat: any;
  lat: number | undefined;
  long: number | undefined
  preview: boolean;
  imgPreview:string;
  multiselectSettings!: any;
  alert = Swal.mixin({
    allowOutsideClick: false,
    allowEscapeKey: false,
    allowEnterKey: false,
    stopKeydownPropagation: true,
    customClass: {
      confirmButton: 'btn btn-danger',
      cancelButton: 'btn btn-light',
    },
    buttonsStyling: false
  });
  loading: boolean;

  /**
   Constructor de la clase
   @param formBuilder {FormBuilder} Clase para contruir un formulario reactivo
   @param catService {CategoriasService} Servicio que gestiona los datos de las categorías
   @param eventoService {EventosService} Servicio que gestiona los datos de los eventos
   **/
  constructor(private formBuilder: FormBuilder, private catService: CategoriasService, private eventoService: EventosService,
              private validador: ValidadoresService) {this.initMultiselect();}

  /**
   Método que inicializa la vista
   **/
  ngOnInit() {
    this.catService.getIntereses().subscribe((data) => {
      this.categorias = data;
      console.log("LOS INTERESES", this.categorias);
    });
    this.initForm();
    this.initMap();
    this.eventoService.getEditEvent().subscribe((data) => {
      this.eventoEdit = data;
      console.log("EN EL ONINIT",this.eventoEdit);
      if (this.eventoEdit != null){
        setTimeout(() => {
          this.setFormEdit(this.eventoEdit);
        },1000)

      }else{
        this.resetForm();
      }

    })
  }
  /**
   Método que carga el mapa interactivo
   **/
  initMap(latitud: number = 38.87945, longitud: number = -6.97065) {
    const defaultLatLng = L.latLng([latitud, longitud]); // Latitud y longitud de Badajoz

    this.map = L.map('map').setView(defaultLatLng, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker(defaultLatLng).addTo(this.map);

    this.map.on('click', (e: any) => {
      const latlng = e.latlng;
      this.marker.setLatLng(latlng);
      this.lat = latlng.lat;
      this.long = latlng.lng;
    });
  }

  /**
   Método que envia datos para la búsqueda de una ubicación segun los parametros introducidos
   @param $event {Event} Evento que trae los valores introducidos por el usuario en el campo
   **/
  buscarUbi($event: Event) {
    // @ts-ignore
    const query = $event.target.value;

    if (query.trim() !== '') {
      this.geocodeLocation(query);
    }
  }

  /**
   Método que busca la localización según el parametro introducido por el usuario
   @param query {string} Valor de búsqueda introducido por el usuario
   **/
  geocodeLocation(query: string) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const result = data[0];
          const latlng = L.latLng(result.lat, result.lon);

          this.marker.setLatLng(latlng);
          this.map.setView(latlng, 13);

          console.log("Latitud:", result.lat);
          console.log("Longitud:", result.lon);
        }
      })
      .catch(error => {
        console.error('Error al geocodificar la ubicación:', error);
      });
  }

  /**
   Método que inicializa el formulario reactivo
   **/
  private initForm() {
    this.formCreateEvent = this.formBuilder.group({
      nombreEvento: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      fecha: ['', [Validators.required, this.validador.validateFecha]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      tlf: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
      localizacion: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(100)]],
      intereses: [],
      detalle: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]]
     // img: ['', this.validador.validateImgExtension]
    });
  }

  /**
   Método que valida los campos del formulario de forma general
   @param campo1 {string} Nombre asignado al campo del formulario que se quiere validar
   **/
  validar(campo: string): string | null {
    const control = this.formCreateEvent.get(campo);

    if (control.invalid && control.touched) {
      if (control.errors?.['required']) {
        return 'Este campo es requerido.';
      }

      if (control.errors?.['minlength']) {
        const minLength = control.errors['minlength']['requiredLength'];
        return `El valor mínimo es de ${minLength} caracteres.`;
      }

      if (control.errors?.['maxlength']) {
        const maxLength = control.errors['maxlength']['requiredLength'];
        return `El valor máximo es de ${maxLength} caracteres.`;
      }

      // Validación adicional para el campo de fecha
      if (campo === 'fecha' && control.errors?.['minDate']) {
        return 'La fecha debe ser mayor a la fecha actual.';
      }

      // Validación adicional para el campo de teléfono
      if (campo === 'tlf' && control.errors?.['minlength']) {
        return 'El número de teléfono debe tener 9 dígitos.';
      }

      // Validación adicional para el campo de localización
      if (campo === 'localizacion' && control.errors?.['minlength']) {
        const minLength = control.errors['minlength']['requiredLength'];
        return `La localización debe tener al menos ${minLength} caracteres.`;
      }

      // Validación adicional para el campo de imagen
      if (campo === 'imagen' && control.errors?.['extension']) {
        return 'La imagen debe tener una extensión válida (png, jpg, jpeg).';
      }

      // Si no se encuentra ningún error específico, devuelve el mensaje genérico
      return 'El valor ingresado no es válido.';
    }

    return null;
  }

  /**
   Método que recoge los datos del formulario y los envia al servicio correspondiente
   **/
  sendEvent() {
    if (this.formCreateEvent.invalid || this.formCreateEvent.pending) {
      console.log("MAAAAAAAL");
      console.log(this.formCreateEvent);
      Object.values(this.formCreateEvent.controls).forEach((control) => {
        if (control instanceof FormGroup)
          control.markAsTouched();
      });
      return;
    }
    this.alert.fire({
      icon:'question',
      title:'¿Estas seguro que deseas registrar un nuevo evento?',
      html:'<ul class="list-group list-group-flush d-flex">'+
        '<li class="list-group-item text-left">Nombre: ' + this.formCreateEvent.get('nombre')?.value + '</li>'+
        '<li class="list-group-item text-left">Descripcion: ' + this.formCreateEvent.get('descripcion')?.value + '</li>'+
        '<li class="list-group-item text-left">Detalles: ' + this.formCreateEvent.get('detalles')?.value + '</li>'+
        '<li class="list-group-item text-left">Localización: ' + this.formCreateEvent.get('localizacion')?.value + '</li>'+
        '<li class="list-group-item text-left">Fecha: ' + this.formCreateEvent.get('fechaHora')?.value + '</li>'+
        '<li class="list-group-item text-left">Tlf: ' + this.formCreateEvent.get('tlf')?.value + '</li>'+
        '<li class="list-group-item text-left">Intereses: ' + this.formCreateEvent.get('intereses')?.value + '</li>'+
        '</ul>',

      showConfirmButton: true,
      showCancelButton: true,
    }).then((result) => {
      this.alert.fire({
        title:'Espereme mientras gestionamos su solicitud',
        didOpen(popup: HTMLElement) {
          Swal.showLoading();
        }
      })
      if (result.isConfirmed) {
        const interesesAll = this.formCreateEvent.get('intereses').value;
        const inter =[];
        for (let int of interesesAll){
          console.log("INT", int.interesId);
          inter.push(parseInt(int.interesId));

        }
        console.log(inter);
        const formData = new FormData();
        if (this.eventoEdit != null ){
          formData.append('eventosId', this.eventoEdit.eventosId);
        }
        formData.append('nombre', this.formCreateEvent.get('nombreEvento').value);
        formData.append('descripcion', this.formCreateEvent.get('descripcion').value);
        formData.append('detalles', this.formCreateEvent.get('detalle').value);
        formData.append('localizacion', this.formCreateEvent.get('localizacion').value);
        formData.append('fechaHora', new Date(this.formCreateEvent.get('fecha').value).toISOString());
        formData.append('telefonoContacto', this.formCreateEvent.get('tlf').value.toString());
        formData.append('latitud', this.lat.toString());
        formData.append('longitud', this.long.toString());
        if (this.getImg() != null){
          formData.append('imagen', this.getImg());
        }
        formData.append('intereses', inter.join(','));
        console.log("EL FORMDATA A ENVIAR",formData);
        this.eventoService.createEvento(formData).subscribe((data) => {
          console.log("DATA", data);
          this.alert.fire({
            icon:'success',
            title:'Evento registrado con éxito',
            timer:4000,
          })
        },error => {
          this.alert.fire({
            icon:'error',
            title:'No se ha podido realizar el registro',
            text:error.error,
            timer:4000,
          })
        })

      } else {
        this.alert.fire({
          title: 'Registro cancelado con éxito',
          text: 'Te seguimos esperando, vuelve a intentarlo cuando quieras',
          icon: 'info',
          timer: 4000,
          showConfirmButton: false,
          showCancelButton: false,
        })
      }
    })
  }

  /**
   Método que guarda la imagen seleccionada por el usuario
   **/
  getImg(){
    const file = (document.getElementById('imgPortada') as HTMLInputElement).files[0];
    console.log("ENTRA EN OBTENER IMG", file);
    if (file!=null || file != undefined){
      console.log("EL FILE", file);
      return file;
    }
    return null;
  }

  /**
   * Método para la carga dinámica de la imagen seleccionada a subir
   * @param $event
   */
  previewImg($event) {
    const file = $event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.preview = true
        this.imgPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      this.preview = false
      this.imgPreview = null;
    }
  }

  /**
   * Método para el cierre del modal desarrollado en el template
   */
  cerrarModal(){
    this.cerrarModalEventos.emit();
    this.eventoService.deleteEditEvent();
  }

  /**
   * Método para el seteo de valores en el formulario para la edición de un evento
   * @param evento
   */
  setFormEdit(evento: any){
    console.log("EVENTO EN MODAL DE CREAR MODAL", evento);
    let intereses = [];
    this.eventoEdit = evento;
    let fecha = new Date(evento.fechaHora);
    this.formCreateEvent.setValue({
      nombreEvento: evento?.nombre,
      fecha: `${fecha.getFullYear()}-${this.padZero(fecha.getMonth() + 1)}-${this.padZero(fecha.getDate())}T${this.padZero(fecha.getHours())}:${this.padZero(fecha.getMinutes())}`,
      descripcion: evento?.descripcion,
      tlf: evento?.telefonoContacto,
      localizacion: evento?.localizacion,
      intereses: evento.intereses,
      detalle: evento?.detalles
    });
    this.marker.setLatLng(L.latLng([evento?.latitud, evento?.longitud]));
    this.lat = evento?.latitud;
    this.long = evento?.longitud;
    this.selectedCat=intereses;
    this.multiselect.selectedItems = intereses
    console.log("SELECCIONADOS", this.selectedCat);
  }

  padZero(num) {
    return num.toString().padStart(2, '0');
  }

  /**
   * Método para el reinicio del formulario a valores en blanco
   */
  resetForm() {
    console.log("reseteando formulario")
    this.eventoEdit = null;
    this.formCreateEvent.reset();
  }

  /**
   * Método para el instanciamiento de ajustes del módulo AngularMultiselectModule
   * @private
   */
  private initMultiselect() {
    this.multiselectSettings = {
      singleSelection: false,
      text: 'Seleccione intereses relacionados',
      searchPlaceHolder: 'Buscar',
      textField:'titulo',
      labelKey:'titulo',
      idField: 'interesId',
      enableSearchFilter: true,
      badgeShowLimit: 6,
      primaryKey: 'interesId',
      searchBy: 'titulo',
      tagToBody: true,
      noDataLabel: 'No disponibles'
    }
  }
}
