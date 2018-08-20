import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ToastController, LoadingController } from 'ionic-angular';

import { CarritoService } from "../../providers/carrito";

@Component({
  selector: 'page-ordenes-detalle',
  templateUrl: 'ordenes-detalle.html',
})
export class OrdenesDetallePage {

  orden:any = {}

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private _cs:CarritoService,
              private alertCtrl: AlertController, 
			  private toastCtrl: ToastController,
	  public loadingCtrl: LoadingController ) {

	

	  this.orden = this.navParams.get("orden");

		
		// Should be just this:
		// this.users= data;
		// loadingPopup.dismiss();
	
  }
	
  borrar_orden(orden_id: string) {


    let alert = this.alertCtrl.create({
      title: 'Cancelar orden',
      message: '¿Desea cancelar la orden?',
      buttons: [{
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Aceptar',
          handler: () => {
            this._cs.borrar_orden(orden_id)
              .subscribe(data => {
                if (data.error) {
                  this.alertCtrl.create({
                    title: "Error al borrar",
                    subTitle: data.mensaje,
                    buttons: ["OK"]
                  }).present();
                } else {
                  this.navCtrl.pop()
                  this.toast("La orden ha sido cancelada");
                }
              });
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


	presentLoadingBubbles() {
		let loading = this.loadingCtrl.create({
			spinner: 'bubbles',
			content: 'This is the "bubbles" spinner. It will dismiss after 3 seconds.',
			duration: 3000
		});

		loading.present();
	}


}
