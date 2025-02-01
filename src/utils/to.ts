export default class TO {
  static int(value: any) {
    return /^[+-]?\d+(\.\d+)?$/.test(value) ? parseInt(value, 10) : undefined
  }

  static float(value: any) {
    return /^[+-]?\d+(\.\d+)?$/.test(value) ? parseFloat(value) : undefined
  }

  static bool(value: any) {
    if (value === true || /^t(rue)?$/i.test(value) || `${value}` === '1') {
      return true
    }
    if (value === false || /^f(alse)?$/i.test(value) || `${value}` === '0') {
      return false
    }
    return undefined
  }

  static exist<T, T2>(value: T | null | undefined, convert: (v: T) => T2) {
    if (value === null || value === undefined) {
      return value as null | undefined
    }
    return convert(value)
  }
}
