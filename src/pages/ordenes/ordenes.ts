import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';

import { CarritoService } from "../../providers/carrito";

import { OrdenesDetallePage } from "../index.paginas";


@Component({
  selector: 'page-ordenes',
  templateUrl: 'ordenes.html',
})
export class OrdenesPage {

  ordenesDetalle = OrdenesDetallePage;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
    private _cs: CarritoService, public loadingCtrl: LoadingController) {
    

  }

  ionViewWillEnter() {
    console.log("cargando ordenes");
  
    // Create the popup
   //* let loadingPopup = this.loadingCtrl.create({
   //   content: 'Cargando ordenes...'
    //});
    this._cs.cargar_ordenes();
    
    // Show the popup
   // loadingPopup.present(); 
  

    // I've added this timeout just to show the loading popup more time
   /* setTimeout(() => {
      loadingPopup.dismiss();
    }, 1500);*/

   
  }


}
