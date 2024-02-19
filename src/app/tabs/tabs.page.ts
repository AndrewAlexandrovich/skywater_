import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
	
	public cart_count = 0;
	public chat_count = 0;
	
	getStat(){
		
		if(localStorage.getItem('token')){	
			let params = {
				token : localStorage.getItem('token'),
				user_id : localStorage.getItem('user_id')
			};
			this.http.post('https://skywater.com.ua/api/index.php?type=getTabStat', JSON.stringify(params)).subscribe((response) => {
			  let json = JSON.parse(JSON.stringify(response));

			  if(json['cart_count']){
				this.cart_count = json['cart_count'];
			  }
			  
			  if(json['chat_count'] >= 0){
				this.chat_count = json['chat_count'];
			  }
			  
			  if(json['notification']){
				console.log(json['notification']);
			  }
			  
			});
		
		}
	}
	
	
	public inteval = setInterval(() => {
          
         this.getStat();

    }, 10000); 
	
	
  constructor(private http: HttpClient) {}
  ngOnInit() {
	this.getStat();
	this.inteval;
  }
}
