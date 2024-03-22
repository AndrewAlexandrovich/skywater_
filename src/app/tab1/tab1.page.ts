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
  public selectedCategory:any = 'default';
  public productToCat:any;
  public home_text:any = false;
  public home_text_title:any = false;
  public to_next_bottle:any = 0;
  public to_next_liter:any = 0;

  public is_auto_category:any = false;
  public products:any;
  public categories:any;
  public showEmptyMsg:any = false;

  openProduct(product_id:any){
    if(product_id >= 1){
      this.router.navigate(['product',{product_id:product_id}]);
    }
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
    let user_id:any = '';
    let token:any   = '';
    if(localStorage.getItem('user_id')){user_id = localStorage.getItem('user_id');}
    if(localStorage.getItem('token')){token = localStorage.getItem('token');}

    let params = {
      user_id : user_id,
      token   : token,
    };
    this.http.post('https://skywater.com.ua/api/index.php?type=home_page', JSON.stringify(params)).subscribe((response) => {

      //set null
      this.templ_b_bottle = 0;
      this.templ_b_liter = 0;

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
        if(this.categories[0]['category_id']){
          this.loadCategory(this.categories[0]['category_id']);
          this.selectedCategory = 'category-'+this.categories[0]['category_id'];
        }
        /*
        this.is_auto_category = false;
        this.loadCategory(this.categories[0]['category_id']);
        this.getActiveTab = 'category-'+this.categories[0]['category_id'];
        */

      }else{
        this.is_auto_category = false;
      }

      this.progress = '0, 700';
      if(homeData.to_next_bonus > 0){
        let segment = 370 / 10;
        let percent =  homeData.to_next_bonus * segment;
        this.progress = percent+', 700';
      }else{
        this.progress = '0, 700';
      }

      if(homeData.bonuses_boutles >=1 ){
        let bounese_boutles = homeData.bonuses_boutles;
            this.templ_b_bottle = homeData.bonuses_boutles;
        this.intervalSetBootles;
      }else{
        this.bonuses_boutles = 0;
        clearInterval(this.intervalSetBootles);
      }

      this.to_next_bottle = (homeData.to_next_bonus) ? homeData.to_next_bonus : 0;
      this.to_next_liter = (homeData.to_next_bonusL) ? homeData.to_next_bonusL : 0;

      if(homeData.to_next_bonusL > 0){
        let segment = 370 / 10;
        let percent =  homeData.to_next_bonusL * segment;
        this.progress_l = percent+', 700';
      }else{
        this.progress_l = '0, 700';
      }

      if(homeData.bonuses_liters >= 1){
        this.templ_b_liter = homeData.bonuses_liters;
        this.intervalSetLiters;
      }else{
        this.bonuses_liters = 0;
        clearInterval(this.intervalSetLiters);
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
    if(this.bonuses_boutles == parseInt(this.templ_b_bottle)){
      clearInterval(this.intervalSetBootles)
    }
  }, 1000);
  public intervalSetLiters = setInterval(() => {

    this.bonuses_liters++;
    if(this.bonuses_liters == parseInt(this.templ_b_liter)){
      clearInterval(this.intervalSetLiters)
    }
  }, 700);
  handleRefresh(event:any) {
    setTimeout(() => {
      this.loadHomeData();
      event.target.complete();
    }, 1500);
  }
ionViewWillEnter(){
  this.loadHomeData();
}
ngOnInit(){
  this.loadHomeData();
}

}
