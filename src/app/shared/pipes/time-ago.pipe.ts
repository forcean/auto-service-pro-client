import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'timeAgo',
    pure: false,
    standalone: false
})
export class TimeAgoPipe implements PipeTransform {

    transform(value: string | Date): string {
        if (!value) return '';

        const date = new Date(value);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 30) {
            return 'เมื่อสักครู่';
        }

        const intervals: { [key: string]: number } = {
            'ปี': 31536000,
            'เดือน': 2592000,
            'วัน': 86400,
            'ชั่วโมง': 3600,
            'นาที': 60,
            'วินาที': 1
        };

        let counter;
        for (const i in intervals) {
            counter = Math.floor(seconds / intervals[i]);
            if (counter > 0) {
                return `${counter} ${i}${counter > 1 ? '' : ''}ที่แล้ว`;
            }
        }
        return value.toString();
    }
}
