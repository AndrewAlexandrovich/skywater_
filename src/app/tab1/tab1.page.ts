import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';


@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  public progress = 0.5;
  public sliderItems = [];
  public categoryProducts = [];

  openProduct(product_id:any){
	this.router.navigate(['product',{product_id:product_id}])
  }
  addCart(product_id:any, quantity:any){
    let params = {
        token : localStorage.getItem('token'),
        user_id : localStorage.getItem('user_id'),
        product_id : product_id,
        quantity : quantity,
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=addToCart', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      if(json['error']){
        this.showToast(json['error'], 'danger');
      }else if(json['success']){
        this.showToast(json['success'], 'light');
      }
    });
  }

  async showToast(msg:any, color:any) {
    console.log('start show');
    if(color == ''){
      color = 'primary';
    }
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      position: 'bottom',
      buttons: [],
      color:color
    });
    await toast.present();
  }


  constructor(private http: HttpClient, private router: Router, private toastCtrl: ToastController) {
	this.http.get('https://skywater.com.ua/api/index.php?type=home_page').subscribe((response) => {

	  let homeData = JSON.parse(JSON.stringify(response));
	  this.sliderItems = homeData.slider;
	  console.log(homeData);
	  this.categoryProducts = homeData.categories_products;

	});



}

}
