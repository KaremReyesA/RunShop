import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/map';

import { AlertController, Platform, ModalController, ToastController } from "ionic-angular";


// Plugin storage
import { Storage } from '@ionic/storage';

// usuario service
import { UsuarioService } from "./usuario";

import { URL_SERVICIOS } from "../config/url.servicios";

// paginas del modal
import { LoginPage, CarritoPage } from "../pages/index.paginas";

@Injectable()
export class CarritoService {

  items:any[] = [];
  total_carrito:number = 0;
  ordenes:any[] = [];


  constructor(public http: Http,
    private alertCtrl: AlertController,
    private platform: Platform,
    private storage: Storage,
    private modalCtrl: ModalController,
	private _us: UsuarioService,
	private toastCtrl: ToastController) {
    console.log('Hello Carrito Provider');

    this.cargar_storage();
    this.actualizar_total();
  }

  remove_item(idx: number) {
	//Seguro que desea eliminar el articulo?
	let alert = this.alertCtrl.create({
		  title: 'Eliminar artículo',
		  message: '¿Desea eliminar el artículo del carrito de compras?',
		  buttons: [
			  {
				  text: 'Cancelar',
				  role: 'cancel',
				  handler: () => {
					  console.log('Cancel clicked');
				  }
			  },
			  {
				  text: 'Eliminar',
				  handler: () => {
					  console.log('Buy clicked');
					  this.items.splice(idx, 1);
					  this.guardar_storage();
					  this.toast("El artículo ha sido eliminado del carrito de compras");
				  }
			  }
		  ]
	  });
	  alert.present();
}

  realizar_pedido() {

    let data = new URLSearchParams();
    let codigos: string[] = [];

    for (let item of this.items) {
      codigos.push(item.codigo);
    }

    data.append("items", codigos.join(","));

    let url = `${ URL_SERVICIOS }/pedidos/realizar_orden/${ this._us.token }/${ this._us.id_usuario }`;

    this.http.post(url, data)
      .subscribe(resp => {

        let respuesta = resp.json();

        if (respuesta.error) {
          // mostramos error
          this.alertCtrl.create({
            title: "Ha ocurrido un error al procesar la orden",
            subTitle: respuesta.mensaje,
            buttons: ["Aceptar"]
          }).present();

        } else {
          // todo bien!
          this.items = [];
          this.alertCtrl.create({
            title: "La orden ha sido procesada con exito",
            subTitle: "Nos contactaremos con usted próximamente",
            buttons: ["Aceptar"]
          }).present();
        }


      })

  }


  ver_carrito() {
    let modal: any;

    if (this._us.token) {
      //mostrar pagina del carrito
      modal = this.modalCtrl.create(CarritoPage);

    } else {
      // mostrar el login
      modal = this.modalCtrl.create(LoginPage);
    }

    modal.present();

    modal.onDidDismiss((abrirCarrito: boolean) => {

      console.log(abrirCarrito);

      if (abrirCarrito) {
        this.modalCtrl.create(CarritoPage).present();
      }

    })
  }

  agregar_carrito(item_parametro: any) {
    for (let item of this.items) {
      if (item.codigo == item_parametro.codigo) {

        this.alertCtrl.create({
          title: "El artículo ya se encuentra en el carrito de compras",
          buttons: ["Aceptar"]
        }).present();

        return;
      }
    }
    //toast
	console.log("Articulo agregado al carrito");
	
	this.toast("El artículo ha sido agregado al carrito de compras");
	this.items.push(item_parametro);
    this.actualizar_total();
    this.guardar_storage();
  }

  toast(message:string){
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

  actualizar_total() {

    this.total_carrito = 0;
    for (let item of this.items) {
      this.total_carrito += Number(item.precio_compra);
    }

  }


  private guardar_storage() {

    if (this.platform.is("cordova")) {
      // dispositivo
      this.storage.set('items', this.items);

    } else {
      // computadora
      localStorage.setItem("items", JSON.stringify(this.items));

    }


  }

  cargar_storage() {

    let promesa = new Promise((resolve, reject) => {

      if (this.platform.is("cordova")) {
        // dispositivo
        this.storage.ready()
          .then(() => {

            this.storage.get("items")
              .then(items => {
                if (items) {
                  this.items = items;
                }
                resolve();
              })

          })


      } else {
        // computadora
        if (localStorage.getItem("items")) {
          //Existe items en el localstorage
          this.items = JSON.parse(localStorage.getItem("items"));
        }

        resolve();

      }

    });

    return promesa;

  }



  cargar_ordenes() {

    let url = `${ URL_SERVICIOS }/pedidos/obtener_pedidos/${ this._us.token }/${ this._us.id_usuario }`;

    this.http.get(url)
      .map(resp => resp.json())
      .subscribe(data => {

        if (data.error) {
          // manejar el error
        } else {

          this.ordenes = data.ordenes;

        }

      })


  }

  borrar_orden(orden_id: string) {
    let url = `${ URL_SERVICIOS }/pedidos/borrar_pedido/${ this._us.token }/${ this._us.id_usuario }/${ orden_id }`;

    return this.http.delete(url)
      .map(resp => resp.json());
  }
  }
