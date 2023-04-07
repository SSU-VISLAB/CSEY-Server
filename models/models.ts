export abstract class DefaultModel implements Iterable<string> {
    public get allValues(): any[] {
        return [...this].map(key => this[key]);
    }

    public get allKeys(): string {
        return [...this].join(',');
    }

    public get allParams() {
        return this.allValues.map(() => '?').join(',');
    }

    private *keyIterator() {
        yield* Object.keys(this)
    }

    [Symbol.iterator](): Iterator<string, any, undefined> {
        return this.keyIterator();
    }

}