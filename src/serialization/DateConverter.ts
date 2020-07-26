/* eslint-disable class-methods-use-this */
import { JsonConverter, JsonCustomConvert } from 'json2typescript';

@JsonConverter
class DateConverter implements JsonCustomConvert<Date> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  serialize(date: Date): unknown {
    throw new Error('Conversion not supported');
  }

  deserialize(date: string): Date {
    return new Date(date);
  }
}

export default DateConverter;
