import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectURL',
  standalone: true
})
export class ObjectURLPipe implements PipeTransform {
  transform(file: File | null): string {
    if (!file) {
      return 'assets/images/default-avatar.png';
    }
    return URL.createObjectURL(file);
  }
} 