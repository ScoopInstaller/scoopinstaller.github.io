import { JsonConverter, JsonCustomConvert } from 'json2typescript';

@JsonConverter
export class DateConverter implements JsonCustomConvert<Date> {
  serialize(date: Date): any {
    throw new Error('Conversion not supported');
  }
  deserialize(date: any): Date {
    return new Date(date);
  }
}
