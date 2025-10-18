import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[appHighlightCard]'
})
export class HighlightCard {

  constructor( private ele:ElementRef) {
    this.ele.nativeElement.style.backgroundColor = 'gray'

  }

}
