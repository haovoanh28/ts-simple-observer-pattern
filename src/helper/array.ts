import { notify } from './han_observable_sample';
import { hasOwnProp } from './common';

type ArrayProtoProps = keyof typeof Array.prototype;
type Methods = ArrayProtoProps[];

const methods: Methods = ['splice', 'push', 'pop', 'shift', 'unshift', 'sort'];
const MAX_SAFE_INTEGER = 9007199254740991

export function patchArrayMethods<T>(arr: any[], obj: T, key: string) {
  methods.forEach(method => {
    const patchedMethods = hasOwnProp(arr, method) ? arr[method] : Array.prototype[method];

    arr[method] = function patch(...args: any[]) {
      const result = patchedMethods.apply(this, args);
      notify(obj, key as keyof T);
      return result;
    };
  });

  return arr;
}

export function arrGet<T>(namespaceString: string, obj: any): any {
  const parts = namespaceString.split('.');
  let parent = obj,
    currentPart = '';

  for (let i = 0, length = parts.length; i < length; i += 1) {
    currentPart = parts[i];
    parent[currentPart] = typeof parent[currentPart] === 'undefined' ? null : parent[currentPart];
    parent = parent[currentPart];

    if (parent === null) {
      break;
    }
  }

  return parent;
}

export function isLength<T>(value: any) {
  return typeof value === 'number' && value > -1 && value % 1 === 0 && value <= MAX_SAFE_INTEGER;
}

export function isArrayLike<T>(value: any) {
  return value !== null && typeof value !== 'function' && isLength(value.length);
}

export function pluck<T>(arrays: any[], keyName: string) {
  return arrays.reduce((obj, data) => {
    obj[arrGet(keyName, data)] = data;
    return obj;
  }, {});
}