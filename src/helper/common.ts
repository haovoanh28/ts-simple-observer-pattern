interface Obj {
  [propName: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function hasOwnProp<T extends object, K extends keyof T>(obj: T, key: string | K): key is K {
  return obj.hasOwnProperty(key);
}

export function isObject(obj: unknown): obj is object {
  return typeof obj === 'object' && obj !== null;
}

export function forEachObject<T extends Obj, K extends Extract<keyof T, string>, V extends T[K]>(
  fn: (value: V, key: K, obj: T) => void,
  obj: T
) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn(obj[key as K] as V, key as K, obj);
    }
  }
}

export function last(arr: any[]) {
  return arr[arr.length - 1];
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === 'undefined';
}

/**
 * check the emptiness(included null) of object or array. if obj parameter is null or undefind, return true
 * @param obj - target object or array
 * @returns the emptiness of obj
 */
export function isEmpty(obj: any) {
  return (
    isNull(obj) ||
    isUndefined(obj) ||
    (!isUndefined(obj.length) && obj.length === 0) ||
    Object.keys(obj).length === 0
  );
}

export function isFunction(obj: unknown): obj is Function {
  return typeof obj === 'function';
}