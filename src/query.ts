type ExposedPromiseKeys = 'then' | 'finally' | 'catch';
type Promisish<T> = Pick<Promise<T>, keyof Promise<T> & ExposedPromiseKeys>;

abstract class Executable<T> implements Promisish<T> {
  private promise: Promise<T> | null = null;

  protected abstract execute(): Promise<T>;

  protected isExecuting(): boolean {
    return !!this.promise;
  }

  public then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null,
  ): Promise<TResult1 | TResult2> {
    if (!this.promise) {
      this.promise = this.execute();
    }

    return this.promise.then(onfulfilled, onrejected);
  }

  public catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | undefined
      | null,
  ): Promise<T | TResult> {
    return this.then(undefined, onrejected);
  }

  public finally(onfinally?: (() => void) | undefined | null): Promise<T> {
    return this.then().finally(onfinally);
  }
}

type Keys<T> = keyof T & string;
type Filtered<T, I extends keyof T, E extends keyof T> = T extends
  | null
  | undefined
  ? T
  : Omit<Pick<T, I>, E>;

type FilterExec<T, I extends keyof T, E extends keyof T> = (
  includes: Keys<T>[] | undefined,
  excludes: Keys<T>[] | undefined,
) => Promise<Filtered<T, I, E>[]>;

export class FilteredQuery<
  T,
  I extends keyof T = keyof T,
  E extends keyof T = never,
> extends Executable<Filtered<T, I, E>[]> {
  private includes: Keys<T>[] | undefined;

  private excludes: Keys<T>[] | undefined;

  public constructor(private readonly exec: FilterExec<T, I, E>) {
    super();
  }

  protected execute(): Promise<Filtered<T, I, E>[]> {
    return this.exec(this.includes, this.excludes);
  }

  public include<NI extends Keys<T>>(
    includes: NI[] | null,
  ): FilteredQuery<T, NI, E> {
    this.includes = includes ?? undefined;
    return this as unknown as FilteredQuery<T, NI, E>;
  }

  public exclude<NE extends Keys<T>>(
    excludes: NE[] | null,
  ): FilteredQuery<T, I, NE> {
    this.excludes = excludes ?? undefined;
    return this as unknown as FilteredQuery<T, I, NE>;
  }
}
