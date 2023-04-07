export abstract class DefaultModel implements Iterable<string> {
    /** 
     * @return 모든 속성의 value[] return
     * @example class user {
     *  id = 'visID'
     *  age = 20
     *  name = 'kkh'
     * }
     * user.allValues == ['visID', 20, 'kkh']
     */
    public get allValues(): any[] {
        return [...this].map(key => this[key]);
    }

    /** 
     * @return 모든 속성의 key return
     * @example class user {
     *  id
     *  age
     *  name
     * }
     * user.allKeys == 'id,age,name'
     */
    public get allKeys(): string {
        return [...this].join(',');
    }

    /** 
     * @return 모든 속성의 수 만큼 ?를 return
     * @example class user {
     *  id
     *  age
     *  name
     * }
     * user.allParams == '?,?,?'
     */
    public get allParams() {
        return [...this].map(() => '?').join(',');
    }

    /**
     * @param length ? 개수
     * @return length 만큼의 ? return
     * @example getParams(3) == '?,?,?'
     */
    public getParams(length: number) {
        let qsMark = "?";
        while(--length) qsMark += ',?'
        return qsMark;
    }

    private *keyIterator() {
        yield* Object.keys(this)
    }

    [Symbol.iterator](): Iterator<string, any, undefined> {
        return this.keyIterator();
    }

}