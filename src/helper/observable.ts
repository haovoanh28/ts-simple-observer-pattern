export type Observer<T> = {
  update: (value: T) => void;
}

class Observable<T> {
  private observersList: Map<string, Observer<T>>;
  private obValue: T;

  constructor(initValue: T) {
    this.observersList = new Map();
    this.obValue = initValue;
  }

  public setValue(value: T) {
    this.obValue = value;
    this.notify();
  }
  
  subscribe(name: string, observer: Observer<T>) {
    this.observersList.set(name, observer);
  }

  unSubscribe(name: string) {
    this.observersList.delete(name);
  }

  notify() {
    this.observersList.forEach((observer, name) => {
      observer.update(this.obValue);
    })
  }
}

export default Observable;