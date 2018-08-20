import {  Injectable} from '@angular/core';
import {  Http,  URLSearchParams} from '@angular/http';
import 'rxjs/add/operator/map';

import {  URL_SERVICIOS} from "../config/url.servicios";

import {  AlertController, Platform, ToastController} from "ionic-angular";

// Plugin storage
import {  Storage } from '@ionic/storage';


@Injectable()
export class UsuarioService {

  token: string;
  id_usuario: string;


  constructor(public http: Http,
    private alertCtrl: AlertController,
    private platform: Platform,
    private storage: Storage,
    private toastCtrl: ToastController) {

    console.log('Hello Usuario Provider');
    this.cargar_storage();
  }

  activo(): boolean {

    if (this.token) {
      return true;
    } else {
      return false;
    }

  }

  ingresar(correo: string, contrasena: string) {

    let data = new URLSearchParams();
    data.append("correo", correo);
    console.log(correo);
    data.append("contrasena", contrasena);
    console.log(data);

    let url = URL_SERVICIOS + "/login";

    return this.http.post(url, data).map(resp => {
     
      let data_resp = resp.json();
      console.log(data_resp);

      if (data_resp.error) {
        this.alertCtrl.create({
          title: "Error al iniciar",
          subTitle: data_resp.mensaje,
          buttons: ["OK"]
        }).present();

      } else {
        this.token = data_resp.token;
        this.id_usuario = data_resp.id_usuario;
        console.log(this.id_usuario);
        // Guardar Storage
        this.guardar_storage();
      }
    });
  }

  cerrar_sesion() {

    //Seguro de cerrar sesión?
    let alert = this.alertCtrl.create({
      title: 'Cerrar sesión',
      message: '¿Está seguro que desea cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this.token = null;
            this.id_usuario = null;

            // guardar storage
            this.guardar_storage();

            this.toast("Se ha cerrado sesión correctamente");
          }
        }
      ]
    });
    alert.present();
  }


  toast(message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'top'
    });

    toast.onDidDismiss(() => {
      console.log('Dismissed toast');
    });

    toast.present();
  }

  private guardar_storage() {

    if (this.platform.is("cordova")) {
      // dispositivo
      this.storage.set('token', this.token);
      this.storage.set('id_usuario', this.id_usuario);

    } else {
      // computadora
      if (this.token) {
        localStorage.setItem("token", this.token);
        localStorage.setItem("id_usuario", this.id_usuario);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("id_usuario");
      }

    }


  }

  cargar_storage() {

    let promesa = new Promise((resolve, reject) => {

      if (this.platform.is("cordova")) {
        // dispositivo
        this.storage.ready()
          .then(() => {

            this.storage.get("token")
              .then(token => {
                if (token) {
                  this.token = token;
                }
              })

            this.storage.get("id_usuario")
              .then(id_usuario => {
                if (id_usuario) {
                  this.id_usuario = id_usuario;
                }
                resolve();
              })

          })


      } else {
        // computadora
        if (localStorage.getItem("token")) {
          //Existe items en el localstorage
          this.token = localStorage.getItem("token");
          this.id_usuario = localStorage.getItem("id_usuario");

        }

        resolve();

      }

    });

    return promesa;

  }


}
