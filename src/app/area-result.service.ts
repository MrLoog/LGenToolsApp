import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AreaResultService {
  result='No Data';
  onChange:any;

  constructor() { }

  
  getResult(){
    return this.result;
  }

  setResult(result:any){
    this.result=result;
    this.onChange && this.onChange(this.result);
  }

}
