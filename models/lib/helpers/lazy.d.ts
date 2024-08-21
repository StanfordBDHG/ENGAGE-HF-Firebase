export declare class Lazy<T> {
    private _factory?;
    private _value?;
    constructor(factory: () => T);
    get value(): T;
    set value(value: T);
}
