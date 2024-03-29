import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-product',
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {

  public product_name = 'Product name';
  public product_id:any;
  public product_image:any;
  public product_description:any;
  public price:any;
  public special:any;
  public special_status:any;
  public sku:any;
  public category:any;
  public unit:any;
  public product_qty = 1;

  plus(){
    this.product_qty++;
  }
  minus(){
    this.product_qty--;
    if(this.product_qty <= 0){
      this.product_qty = 1;
    }
  }

  addCart(){
    let params = {
        token : localStorage.getItem('token'),
        user_id : localStorage.getItem('user_id'),
        product_id : this.product_id,
        quantity : this.product_qty,
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
      duration: 2000,
      position: 'top',
      buttons: [],
      color:color
    });
    await toast.present();
}

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute:ActivatedRoute,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    /*this.activatedRoute.paramMap.subscribe(
        (data) => {
          console.log(data)
        }
      );
    */
      this.product_id = this.activatedRoute.snapshot.paramMap.get('product_id');
      this.http.get('https://skywater.com.ua/api/index.php?type=product&product_id='+this.product_id).subscribe((response) => {

  	  let json = JSON.parse(JSON.stringify(response));
  	  console.log(response);
  	  console.log(json['product']);
      this.product_name = json['product']['name'];
      this.product_image = json['product']['image'];
      this.product_description = json['product']['description'];
      this.price = json['product']['price'];
      this.special = json['product']['special'];
      this.special_status = json['product']['special_status'];
      this.sku = json['product']['sku'];
      this.category = json['product']['category_name'];
      this.unit = json['product']['unit'];
  	});


  }

}
