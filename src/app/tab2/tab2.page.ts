import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, NavigationExtras } from '@angular/router';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  public qrcode:any = false;
  public show_empty:any = true;
  public count_bottles:any=0;
  public count_liters:any=0;
  public progress_ll:any = 0;
  public to_next_l:any = 10;

  getApiData(){
    let params = {
        token       : localStorage.getItem('token'),
        user_id     : localStorage.getItem('user_id')
    };

    this.http.post('https://skywater.com.ua/api/index.php?type=getQrAndBonuses', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      if(json['error']){
        //this.showToast(json['error'], 'danger');
        console.log(json['error']);
      }else{
        this.show_empty = false;
        if(json.bonuses_boutles){
          this.count_bottles = json.bonuses_boutles;
        }
        if(json.bonuses_liters){
          this.count_liters = json.bonuses_liters;
          this.progress_ll = json.bonuses_liters / 10;
        }
        if(json.qr_code_path){
          this.qrcode = json.qr_code_path;
        }

        if(json.to_next_bonusL){
          this.to_next_l = json.to_next_bonusL;
        }


      }
    });

  }
  /*old function to this page*/
  public categories:any;
  public products:any;
  public showEmptyMsg = false;
  loadCategory(category_id:any){
    let params = {
        token       : localStorage.getItem('token'),
        user_id     : localStorage.getItem('user_id'),
        category_id : category_id
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=getProductsByCategory', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      if(json['error']){
        this.showToast(json['error'], 'danger');
      }else{
        this.products = json['products'];
        if(this.products.length <= 0){
          this.showEmptyMsg = true;
        }else{
          this.showEmptyMsg = false;
        }
      }
    });
  }

  getCategories(){
    let params = {
        token : localStorage.getItem('token'),
        user_id : localStorage.getItem('user_id')
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=getCategories', JSON.stringify(params)).subscribe((response) => {
      let json = JSON.parse(JSON.stringify(response));
      if(json['error']){
        this.showToast(json['error'], 'danger');
      }else{
        this.categories = json['categories'];
        this.loadCategory(0);
      }
    });
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

  openProduct(product_id:any){
	   this.router.navigate(['product',{product_id:product_id}])
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


  constructor(private http: HttpClient, private router: Router,private toastCtrl: ToastController) { }
  ngOnInit() {
    this.getApiData();
  }
  ionViewWillEnter() {
    this.getApiData();
  }
}
