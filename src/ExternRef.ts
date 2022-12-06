import { GenerationalArena } from "./GenerationalArena";

const store = new GenerationalArena(); 

export class ExternRef {
    public static create(reference: unknown) : bigint {
        return store.allocate(reference);
    }
    public static load(handle: bigint): unknown {
        return store.retrieve(handle);
    }
    public static delete(handle: bigint): void {
        store.deallocate(handle);
    }
}