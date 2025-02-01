type Func = (...args: unknown[]) => unknown

class IS {
  /**
   * @link https://github.com/microsoft/TypeScript/issues/4196
   */
  static exist(v: unknown): v is Func | boolean | number | object | string {
    return v !== undefined && v !== null
  }

  static nil(v: unknown): v is null | undefined {
    return v === undefined || v === null
  }

  /**
   * is string / array / object empty ?
   *
   * ! Note: null / undefined => false
   */
  static empty(v?: object | string | unknown[] | null) {
    if (IS.string(v) || IS.array(v)) {
      return (v as string | unknown[]).length === 0
    }
    return !!v && Object.getOwnPropertyNames(v).length === 0 && Object.getOwnPropertySymbols(v).length === 0
  }

  /**
   * - '12.34' = true
   * - 12.34 = true
   * - 1234 = true
   */
  static numeric(v?: number | string | null) {
    return /^[+-]?\d+(\.\d+)?$/.test(`${v}`)
  }

  /**
   * - '1234' = true
   * - 1234 = true
   * - 12.34 = false
   */
  static int(v?: number | string | null) {
    return /^[+-]?\d+$/.test(`${v}`)
  }

  /**
   * true / 'true' / '1' / 1 / 't' = true
   * - **Note**: case insensitive
   */
  static truely(v?: boolean | number | string | null) {
    return v === true || /^t(rue)?$/i.test(`${v}`) || `${v}` === '1'
  }

  /**
   * false / 'false' / '0' / 0 / 'f' = true
   * - **Note**: case insensitive
   */
  static falsy(v?: boolean | number | string | null) {
    return v === false || /^f(alse)?$/i.test(`${v}`) || `${v}` === '0'
  }

  static ipv4(v?: string | null, privacy = false) {
    if (privacy) {
      return /^(10|127|169\.254|172\.(1[6-9]|2[0-9]|3[0-1])|192\.168)\./.test(`${v}`)
    }

    return /^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/.test(`${v}`)
  }

  static ipv6(v?: string | null) {
    return /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i.test(`${v}`)
  }

  static ip(v?: string | null) {
    return IS.ipv4(v) || IS.ipv6(v)
  }

  static email(v?: string | null) {
    // eslint-disable-next-line no-control-regex, no-useless-escape
    return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(`${v}`)
  }

  static url(v?: string | null) {
    return /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i.test(`${v}`)
  }

  static chinese(v?: string | null) {
    return /^([\u4E00-\u9FCC\u3400-\u4DB5\uFA0E\uFA0F\uFA11\uFA13\uFA14\uFA1F\uFA21\uFA23\uFA24\uFA27-\uFA29]|[\ud840-\ud868][\udc00-\udfff]|\ud869[\udc00-\uded6\udf00-\udfff]|[\ud86a-\ud86c][\udc00-\udfff]|\ud86d[\udc00-\udf34\udf40-\udfff]|\ud86e[\udc00-\udc1d])+$/.test(`${v}`)
  }

  static iso8601(v?: string | null) {
    try {
      return new Date(`${v}`).toISOString() === v
    } catch (err) {
      return false
    }
  }

  static string(v: unknown): v is string {
    return typeof v === 'string' || v instanceof String
  }

  static bool(v: unknown): v is boolean | typeof Boolean {
    return v === true || v === false || v instanceof Boolean
  }

  static array(v: unknown): v is unknown[] {
    return Array.isArray ? Array.isArray(v) : Object.prototype.toString.call(v) === '[object Array]'
  }

  static date(v: unknown): v is Date {
    return !!v && Object.prototype.toString.call(v) === '[object Date]' && !Number.isNaN(v)
  }

  static func(v: unknown): v is Func {
    return typeof v === 'function'
  }

  static promise(v: unknown): v is Promise<unknown> {
    return !!v && Object.prototype.toString.call(v) === '[object Promise]'
  }

  static primitive(v: unknown): v is boolean | number | string | null | undefined {
    return v === null || v === undefined || (typeof v !== 'object' && typeof v !== 'function')
  }
}

export default IS
