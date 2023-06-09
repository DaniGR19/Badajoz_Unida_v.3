import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UsuariosService} from "../../../services/usuarios.service";
import {DataTableDirective} from "angular-datatables";
import {Subject} from "rxjs";
import Swal from "sweetalert2";

@Component({
  selector: 'app-gestion-usuarios-table',
  templateUrl: './gestion-usuarios-table.component.html',
  styleUrls: ['./gestion-usuarios-table.component.css']
})
export class GestionUsuariosTableComponent implements OnInit{
  @ViewChild(DataTableDirective, { static: false }) dirDataTable: DataTableDirective;
  @ViewChild('dataTable', { static: false }) table: ElementRef;
  dtTrigger: Subject<any> = new Subject<any>();
  dtOptions: any;
  usuarios: any;
  loading: boolean;
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
  constructor(private usuarioService: UsuariosService) {

  }

  ngOnInit() {
    this.loading = true;
    this.usuarioService.getAll().subscribe((data) => {
      this.usuarios = data;
      this.cargarTabla();
      this.loading = false;
      console.log("Los usuarios de la aplicación",this.usuarios);
    })
  }
  /**
   * Método para el reinstanciamiento de la datatable del template
   */
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
   * Método para la asignación de roles a usuarios de la aplicación
   * @param number
   */
  asignarPrivilegio(number: number, usuario: any) {
    let privilegio = '';
    if (number == 2){
      privilegio = 'usuario';
    } else if (number == 3){
      privilegio = 'colaborador';
    }
    this.alert.fire({
      icon:'question',
      title:'¿Seguro que deseas asignar estos privilegios?',
      text:'Vas a asignar a ' + usuario?.nombreUsuario + ' los privilegios de ' + privilegio +
        ', estos privilegios pueden volver a cambiar por el administrador del sistema.',
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
        this.usuarioService.cambioRol(usuario.userId,number).subscribe((data) => {
          console.log('USUARIO ROLEADO',data);
          this.alert.fire({
            title: 'Actualizado con éxito!',
            text: 'El usuario con nombre' + usuario?.nombreUsuario +'ha sido actualizado correctamente.',
            icon: 'success',
            timer: 4000,
            showConfirmButton: false,
            showCancelButton: false,
          });
          setTimeout(()=>{
            this.ngOnInit();
          },4000)
        }, error => {
          this.alert.fire({
            title: 'Hubo un problema!',
            text: 'El usuario con nombre' + usuario?.nombreUsuario +'no ha sido actualizado correctamente.',
            icon: 'error',
            timer: 4000,
            showConfirmButton: false,
            showCancelButton: false,
          });
        })
      }
    });
  }
}
