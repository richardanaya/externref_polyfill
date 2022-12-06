
const MAX_GENERATION = 0xfffffff0;

export class GenerationalArena {
  private objects: Array<unknown>;
  // negative generations mean unallocated
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
    const currentGeneration = this.generations[index];
    this.objects[index] = o;
    this.generations[index] = currentGeneration === undefined? 1 : Math.abs(currentGeneration) + 1;

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
    if(generation >= MAX_GENERATION) {
      this.generations[index] = -this.generations[index];
      // don't put handle in free list as it's already totally used
      // this will prevent it from being reused ever again
    } else if (generation === this.generations[index]) {
      this.generations[index] = -this.generations[index];
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
