class Utils {
  static extractPathFromUrl = (url: string, separator = '/'): string => {
    return url.split('/').slice(-2).join(separator);
  };
}

export default Utils;
