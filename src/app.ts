// import { generateObserverId, makeObservableData } from './helper/observable2';
//
// const a = {test1: 0, test2: 0};

import { observable } from './helper/han_observable_sample';

const a = { name: '', age: 0 };

const aSubject = observable(a); 
aSubject.age = 10;