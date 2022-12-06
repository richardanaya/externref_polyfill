export class GenerationalArena {
  private objects: Array<unknown>;
  private generations: Array<number>;
  private freeList: Array<number>;
  private nextIndex: number;

  constructor() {
    this.objects = [];
    this.generations = [];
    this.freeList = [];
    this.nextIndex = 0;
  }

  public allocate(o: unknown): bigint {
    let index: number;
    if (this.freeList.length > 0) {
      index = this.freeList.pop();
    } else {
      index = this.nextIndex++;
    }
    this.objects[index] = o;
    this.generations[index] = 0;

    // return handle as big integer that contains
    // index in low 32 bits and generation in high 32 bits
    const low = BigInt(index);
    const high = BigInt(this.generations[index]) << BigInt(32);
    const merged = low | high;
    return merged;
  }

  public deallocate(handle: bigint): void {
    const index = Number(handle & BigInt(0xffffffff));
    const generation = Number(handle >> BigInt(32));
    if (generation === this.generations[index]) {
      this.freeList.push(index);
    } else {
      throw new Error("attempt to deallocate invalid handle");
    }
  }

  public retrieve(handle: bigint): unknown {
    const index = Number(handle & BigInt(0xffffffff));
    const generation = Number(handle >> BigInt(32));
    if (generation === this.generations[index]) {
      return this.objects[index];
    } else {
      throw new Error("attempt to retrieve invalid handle");
    }
  }
}
