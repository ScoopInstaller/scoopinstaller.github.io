import { JsonConverter, type JsonCustomConvert } from 'json2typescript';

@JsonConverter
class DateConverter implements JsonCustomConvert<Date> {
  serialize(date: Date): unknown {
    throw new Error('Conversion not supported');
  }

  deserialize(date: string): Date {
    return new Date(date);
  }
}

export default DateConverter;
