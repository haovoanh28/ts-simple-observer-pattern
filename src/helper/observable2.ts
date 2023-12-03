import { Dictionary } from '../types/option';
import {isFunction, last} from './common';

type BooleanSet = Dictionary<boolean>;

export type Observable<T extends Dictionary<any>> = T & {
  __storage__: T;
  __propObserverIdSetMap__: Dictionary<BooleanSet>;
};

interface ObserverInfo {
  fn: Function;
  targetObserverIdSets: BooleanSet[];
  sync?: boolean;
}

export const observerInfoMap: Dictionary<ObserverInfo> = {};
// observerId stack for managing recursive observing calls
const observerIdStack: string[] = [];

export const generateObserverId = (() => {
  const idPrefix = '@observer';
  let lastId = 0;

  return () => {
    const _id = idPrefix + lastId;
    lastId++;

    return _id;
  };
})();

/**
 * Run the registered function of a given observer id
 * @param observerId
 */
function callObserver(observerId: string) {
  observerIdStack.push(observerId);
  observerInfoMap[observerId].fn();
  observerIdStack.pop();
}

/**
 *
 * @param observerId
 */
function run(observerId: string) {
  const { fn, targetObserverIdSets } = observerInfoMap[observerId];
  callObserver(observerId);
}

/**
 * Run all observer of the property (key)
 * @param storage the observable data
 * @param resultObj
 * @param observerIdSet the observers list
 * @param key the property
 * @param value the new value
 */
function setValue<T, K extends keyof T>(
  storage: T,
  resultObj: T,
  observerIdSet: BooleanSet,
  key: K,
  value: T[K]
) {
  // The value of the observable has changed
  if (storage[key] !== value) {
    storage[key] = value;
    Object.keys(observerIdSet).forEach(observerId => {
      run(observerId);
    });
  }
}

function observe(fn: Function) {
  const observerId = generateObserverId();
  observerInfoMap[observerId] = { fn, targetObserverIdSets: [] };
  run(observerId);

  return () => {
    observerInfoMap[observerId].targetObserverIdSets.forEach(idSet => {
      delete idSet[observerId];
    });
    delete observerInfoMap[observerId];
  };
}

/**
 * - Turns the given object into an observable object
 * - This uses closure, so after the function is finished, the returned data
 *   still can access and
 * @param obj the object that we want to make it becomes observable
 * @param sync ?
 * @return Observable<T> the observable object from param obj.
 */
export function observable<T extends Dictionary<any>>(
  obj: T,
  sync = false
): Observable<T> {
  // the value of the subject
  const storage = {} as T;
  // contains the observers of each property in the object
  const propObserverIdSetMap = {} as Dictionary<BooleanSet>;
  // the observable object
  const resultObj = {} as T;

  // defines the default data for the observable
  Object.defineProperties(resultObj, {
    __storage__: { value: storage, enumerable: true },
    __propObserverIdSetMap: { value: propObserverIdSetMap, enumerable: true },
  });

  Object.keys(obj).forEach(key => {
    makeObservableData(
      obj,
      resultObj,
      key,
      storage,
      propObserverIdSetMap,
      sync
    );
  });

  return resultObj as Observable<T>;
}

export function makeObservableData<T extends Dictionary<any>>(
  obj: T,
  resultObj: T,
  key: string,
  storage: T,
  propObserverIdSetMap: Dictionary<BooleanSet>,
  sync?: boolean
) {
  // getter of the property of the ORIGINAL object (obj)
  const getter = (Object.getOwnPropertyDescriptor(obj, key) || {}).get;
  // the observer of the property in observable
  const observerIdSet = propObserverIdSetMap[key];

  Object.defineProperty(resultObj, key, {
    get() {
      const observerId = last(observerIdStack);
      if (observerId && !observerIdSet[observerId]) {
        observerIdSet[observerId] = true;
        observerInfoMap[observerId].targetObserverIdSets.push(observerIdSet);
      }
      return storage[key];
    },
  });
  
  if (isFunction(getter)) {
    observe(() => {
      const value = getter.call(resultObj);
      setValue(storage, resultObj, observerIdSet, key, value);
    });
  }

  Object.defineProperty(resultObj, key, {
    set(value) {
      setValue(storage, resultObj, observerIdSet, key, value);
    },
  });
}
