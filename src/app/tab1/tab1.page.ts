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

  public progress = '0, 700';
  public progress_l = '0, 700';
  public svg_class = 'circle-chart';
  public sliderItems = [];
  public categoryProducts = [];
  public bonuses_boutles:any = 0;
  public templ_b_bottle:any = 0;
  public templ_b_liter:any = 0;
  public bonuses_liters:any = 0;
  public getActiveTab:any = 'default';
  public productToCat:any;
  public home_text:any = false;
  public home_text_title:any = false;

  public is_auto_category:any = false;
  public products:any;
  public categories:any;
  public showEmptyMsg:any = false;

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

  setProducts(category_id:any){
    for(let cp of this.categoryProducts){
      if(cp['category_id'] == category_id){
        this.productToCat = cp['products'];
      }
    }
  }


  constructor(
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  loadHomeData(){
    this.http.get('https://skywater.com.ua/api/index.php?type=home_page').subscribe((response) => {

  	  let homeData = JSON.parse(JSON.stringify(response));
  	  this.sliderItems = homeData.slider;
  	  this.categoryProducts = homeData.categories_products;
      for(let c of homeData.categories_products){
        if(c.active == 1){
          this.getActiveTab = 'category-'+c['category_id'];
          this.productToCat = c.products;
        }
      }
      if(homeData.categories){
        this.categories = homeData.categories;
        this.is_auto_category = true;
        this.loadCategory(0);
      }else{
        this.is_auto_category = false;
      }


      if(homeData.bonuses_boutles){
        let bounese_boutles = homeData.bonuses_boutles;
            this.templ_b_bottle = homeData.bonuses_boutles;
        let percent = ((bounese_boutles * 10) / 100) * 700;
        this.progress = percent+', 700';
        this.intervalSetBootles;
      }else{
        this.progress = '0, 700';
        this.bonuses_boutles = 0;
      }

      if(homeData.bonuses_liters){
        let bounese_l = homeData.bonuses_liters;
            this.templ_b_liter = homeData.bonuses_liters;
        let percent = ((bounese_l * 19) / 100) * 700;
        if(percent > 500){
          percent = percent / 1.5;
        }
        this.progress_l = percent+', 700';
        this.intervalSetLiters;

      }else{
        this.progress_l = '0, 700';
        this.bonuses_liters = 0;
      }

      if(homeData.home_text_title){
        this.home_text_title = homeData.home_text_title;
      }
      if(homeData.home_text){
        this.home_text = homeData.home_text;
      }

  	});
  }

  public intervalSetBootles = setInterval(() => {
    this.bonuses_boutles++;
    if(this.bonuses_boutles == this.templ_b_bottle){
      clearInterval(this.intervalSetBootles)
    }
  }, 1000);
  public intervalSetLiters = setInterval(() => {
    this.bonuses_liters++;
    if(this.bonuses_liters == this.templ_b_liter){
      clearInterval(this.intervalSetLiters)
    }
  }, 700);

ionViewWillEnter(){
  this.loadHomeData();
}
ngOnInit(){
  this.loadHomeData();
}

}
