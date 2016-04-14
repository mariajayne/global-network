/**
 * Created by akselreiten on 14/04/16.
 */


GDPChart= function(_parentElement,_data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    //  Debug RAW data
    console.log(this.data);

    this.initVis();
}