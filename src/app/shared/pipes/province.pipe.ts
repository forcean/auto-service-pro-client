import { Pipe, PipeTransform } from '@angular/core';
import { PROVINCES } from '../constant/province.constant';

@Pipe({
  name: 'province',
  standalone: true,
})
export class ProvincePipe implements PipeTransform {
  private readonly provinceMap = new Map(
    PROVINCES.map((p) => [p.code, p.nameTH]),
  );

  transform(code: string): string {
    return this.provinceMap.get(code) ?? code;
  }
}
