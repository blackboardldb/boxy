
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model ClassSession
 * 
 */
export type ClassSession = $Result.DefaultSelection<Prisma.$ClassSessionPayload>
/**
 * Model Discipline
 * 
 */
export type Discipline = $Result.DefaultSelection<Prisma.$DisciplinePayload>
/**
 * Model Instructor
 * 
 */
export type Instructor = $Result.DefaultSelection<Prisma.$InstructorPayload>
/**
 * Model MembershipPlan
 * 
 */
export type MembershipPlan = $Result.DefaultSelection<Prisma.$MembershipPlanPayload>
/**
 * Model Organization
 * 
 */
export type Organization = $Result.DefaultSelection<Prisma.$OrganizationPayload>
/**
 * Model ClassRegistration
 * 
 */
export type ClassRegistration = $Result.DefaultSelection<Prisma.$ClassRegistrationPayload>
/**
 * Model MembershipRenewal
 * 
 */
export type MembershipRenewal = $Result.DefaultSelection<Prisma.$MembershipRenewalPayload>
/**
 * Model SystemLog
 * 
 */
export type SystemLog = $Result.DefaultSelection<Prisma.$SystemLogPayload>
/**
 * Model PerformanceMetric
 * 
 */
export type PerformanceMetric = $Result.DefaultSelection<Prisma.$PerformanceMetricPayload>
/**
 * Model Expense
 * 
 */
export type Expense = $Result.DefaultSelection<Prisma.$ExpensePayload>
/**
 * Model InAppAlert
 * 
 */
export type InAppAlert = $Result.DefaultSelection<Prisma.$InAppAlertPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.classSession`: Exposes CRUD operations for the **ClassSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ClassSessions
    * const classSessions = await prisma.classSession.findMany()
    * ```
    */
  get classSession(): Prisma.ClassSessionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.discipline`: Exposes CRUD operations for the **Discipline** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Disciplines
    * const disciplines = await prisma.discipline.findMany()
    * ```
    */
  get discipline(): Prisma.DisciplineDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.instructor`: Exposes CRUD operations for the **Instructor** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Instructors
    * const instructors = await prisma.instructor.findMany()
    * ```
    */
  get instructor(): Prisma.InstructorDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.membershipPlan`: Exposes CRUD operations for the **MembershipPlan** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MembershipPlans
    * const membershipPlans = await prisma.membershipPlan.findMany()
    * ```
    */
  get membershipPlan(): Prisma.MembershipPlanDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.organization`: Exposes CRUD operations for the **Organization** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Organizations
    * const organizations = await prisma.organization.findMany()
    * ```
    */
  get organization(): Prisma.OrganizationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.classRegistration`: Exposes CRUD operations for the **ClassRegistration** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ClassRegistrations
    * const classRegistrations = await prisma.classRegistration.findMany()
    * ```
    */
  get classRegistration(): Prisma.ClassRegistrationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.membershipRenewal`: Exposes CRUD operations for the **MembershipRenewal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MembershipRenewals
    * const membershipRenewals = await prisma.membershipRenewal.findMany()
    * ```
    */
  get membershipRenewal(): Prisma.MembershipRenewalDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.systemLog`: Exposes CRUD operations for the **SystemLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SystemLogs
    * const systemLogs = await prisma.systemLog.findMany()
    * ```
    */
  get systemLog(): Prisma.SystemLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.performanceMetric`: Exposes CRUD operations for the **PerformanceMetric** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PerformanceMetrics
    * const performanceMetrics = await prisma.performanceMetric.findMany()
    * ```
    */
  get performanceMetric(): Prisma.PerformanceMetricDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.expense`: Exposes CRUD operations for the **Expense** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Expenses
    * const expenses = await prisma.expense.findMany()
    * ```
    */
  get expense(): Prisma.ExpenseDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.inAppAlert`: Exposes CRUD operations for the **InAppAlert** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more InAppAlerts
    * const inAppAlerts = await prisma.inAppAlert.findMany()
    * ```
    */
  get inAppAlert(): Prisma.InAppAlertDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.19.2
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    ClassSession: 'ClassSession',
    Discipline: 'Discipline',
    Instructor: 'Instructor',
    MembershipPlan: 'MembershipPlan',
    Organization: 'Organization',
    ClassRegistration: 'ClassRegistration',
    MembershipRenewal: 'MembershipRenewal',
    SystemLog: 'SystemLog',
    PerformanceMetric: 'PerformanceMetric',
    Expense: 'Expense',
    InAppAlert: 'InAppAlert'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "classSession" | "discipline" | "instructor" | "membershipPlan" | "organization" | "classRegistration" | "membershipRenewal" | "systemLog" | "performanceMetric" | "expense" | "inAppAlert"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      ClassSession: {
        payload: Prisma.$ClassSessionPayload<ExtArgs>
        fields: Prisma.ClassSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClassSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClassSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassSessionPayload>
          }
          findFirst: {
            args: Prisma.ClassSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClassSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassSessionPayload>
          }
          findMany: {
            args: Prisma.ClassSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassSessionPayload>[]
          }
          create: {
            args: Prisma.ClassSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassSessionPayload>
          }
          createMany: {
            args: Prisma.ClassSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClassSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassSessionPayload>[]
          }
          delete: {
            args: Prisma.ClassSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassSessionPayload>
          }
          update: {
            args: Prisma.ClassSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassSessionPayload>
          }
          deleteMany: {
            args: Prisma.ClassSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClassSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClassSessionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassSessionPayload>[]
          }
          upsert: {
            args: Prisma.ClassSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassSessionPayload>
          }
          aggregate: {
            args: Prisma.ClassSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClassSession>
          }
          groupBy: {
            args: Prisma.ClassSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClassSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClassSessionCountArgs<ExtArgs>
            result: $Utils.Optional<ClassSessionCountAggregateOutputType> | number
          }
        }
      }
      Discipline: {
        payload: Prisma.$DisciplinePayload<ExtArgs>
        fields: Prisma.DisciplineFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DisciplineFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DisciplinePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DisciplineFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DisciplinePayload>
          }
          findFirst: {
            args: Prisma.DisciplineFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DisciplinePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DisciplineFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DisciplinePayload>
          }
          findMany: {
            args: Prisma.DisciplineFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DisciplinePayload>[]
          }
          create: {
            args: Prisma.DisciplineCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DisciplinePayload>
          }
          createMany: {
            args: Prisma.DisciplineCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DisciplineCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DisciplinePayload>[]
          }
          delete: {
            args: Prisma.DisciplineDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DisciplinePayload>
          }
          update: {
            args: Prisma.DisciplineUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DisciplinePayload>
          }
          deleteMany: {
            args: Prisma.DisciplineDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DisciplineUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DisciplineUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DisciplinePayload>[]
          }
          upsert: {
            args: Prisma.DisciplineUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DisciplinePayload>
          }
          aggregate: {
            args: Prisma.DisciplineAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDiscipline>
          }
          groupBy: {
            args: Prisma.DisciplineGroupByArgs<ExtArgs>
            result: $Utils.Optional<DisciplineGroupByOutputType>[]
          }
          count: {
            args: Prisma.DisciplineCountArgs<ExtArgs>
            result: $Utils.Optional<DisciplineCountAggregateOutputType> | number
          }
        }
      }
      Instructor: {
        payload: Prisma.$InstructorPayload<ExtArgs>
        fields: Prisma.InstructorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InstructorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InstructorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InstructorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InstructorPayload>
          }
          findFirst: {
            args: Prisma.InstructorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InstructorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InstructorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InstructorPayload>
          }
          findMany: {
            args: Prisma.InstructorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InstructorPayload>[]
          }
          create: {
            args: Prisma.InstructorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InstructorPayload>
          }
          createMany: {
            args: Prisma.InstructorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InstructorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InstructorPayload>[]
          }
          delete: {
            args: Prisma.InstructorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InstructorPayload>
          }
          update: {
            args: Prisma.InstructorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InstructorPayload>
          }
          deleteMany: {
            args: Prisma.InstructorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InstructorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InstructorUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InstructorPayload>[]
          }
          upsert: {
            args: Prisma.InstructorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InstructorPayload>
          }
          aggregate: {
            args: Prisma.InstructorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInstructor>
          }
          groupBy: {
            args: Prisma.InstructorGroupByArgs<ExtArgs>
            result: $Utils.Optional<InstructorGroupByOutputType>[]
          }
          count: {
            args: Prisma.InstructorCountArgs<ExtArgs>
            result: $Utils.Optional<InstructorCountAggregateOutputType> | number
          }
        }
      }
      MembershipPlan: {
        payload: Prisma.$MembershipPlanPayload<ExtArgs>
        fields: Prisma.MembershipPlanFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MembershipPlanFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MembershipPlanFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          findFirst: {
            args: Prisma.MembershipPlanFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MembershipPlanFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          findMany: {
            args: Prisma.MembershipPlanFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>[]
          }
          create: {
            args: Prisma.MembershipPlanCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          createMany: {
            args: Prisma.MembershipPlanCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MembershipPlanCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>[]
          }
          delete: {
            args: Prisma.MembershipPlanDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          update: {
            args: Prisma.MembershipPlanUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          deleteMany: {
            args: Prisma.MembershipPlanDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MembershipPlanUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MembershipPlanUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>[]
          }
          upsert: {
            args: Prisma.MembershipPlanUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipPlanPayload>
          }
          aggregate: {
            args: Prisma.MembershipPlanAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMembershipPlan>
          }
          groupBy: {
            args: Prisma.MembershipPlanGroupByArgs<ExtArgs>
            result: $Utils.Optional<MembershipPlanGroupByOutputType>[]
          }
          count: {
            args: Prisma.MembershipPlanCountArgs<ExtArgs>
            result: $Utils.Optional<MembershipPlanCountAggregateOutputType> | number
          }
        }
      }
      Organization: {
        payload: Prisma.$OrganizationPayload<ExtArgs>
        fields: Prisma.OrganizationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrganizationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrganizationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findFirst: {
            args: Prisma.OrganizationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrganizationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          findMany: {
            args: Prisma.OrganizationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          create: {
            args: Prisma.OrganizationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          createMany: {
            args: Prisma.OrganizationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrganizationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          delete: {
            args: Prisma.OrganizationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          update: {
            args: Prisma.OrganizationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          deleteMany: {
            args: Prisma.OrganizationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrganizationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrganizationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>[]
          }
          upsert: {
            args: Prisma.OrganizationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrganizationPayload>
          }
          aggregate: {
            args: Prisma.OrganizationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrganization>
          }
          groupBy: {
            args: Prisma.OrganizationGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrganizationGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrganizationCountArgs<ExtArgs>
            result: $Utils.Optional<OrganizationCountAggregateOutputType> | number
          }
        }
      }
      ClassRegistration: {
        payload: Prisma.$ClassRegistrationPayload<ExtArgs>
        fields: Prisma.ClassRegistrationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ClassRegistrationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassRegistrationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ClassRegistrationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassRegistrationPayload>
          }
          findFirst: {
            args: Prisma.ClassRegistrationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassRegistrationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ClassRegistrationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassRegistrationPayload>
          }
          findMany: {
            args: Prisma.ClassRegistrationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassRegistrationPayload>[]
          }
          create: {
            args: Prisma.ClassRegistrationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassRegistrationPayload>
          }
          createMany: {
            args: Prisma.ClassRegistrationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ClassRegistrationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassRegistrationPayload>[]
          }
          delete: {
            args: Prisma.ClassRegistrationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassRegistrationPayload>
          }
          update: {
            args: Prisma.ClassRegistrationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassRegistrationPayload>
          }
          deleteMany: {
            args: Prisma.ClassRegistrationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ClassRegistrationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ClassRegistrationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassRegistrationPayload>[]
          }
          upsert: {
            args: Prisma.ClassRegistrationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ClassRegistrationPayload>
          }
          aggregate: {
            args: Prisma.ClassRegistrationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateClassRegistration>
          }
          groupBy: {
            args: Prisma.ClassRegistrationGroupByArgs<ExtArgs>
            result: $Utils.Optional<ClassRegistrationGroupByOutputType>[]
          }
          count: {
            args: Prisma.ClassRegistrationCountArgs<ExtArgs>
            result: $Utils.Optional<ClassRegistrationCountAggregateOutputType> | number
          }
        }
      }
      MembershipRenewal: {
        payload: Prisma.$MembershipRenewalPayload<ExtArgs>
        fields: Prisma.MembershipRenewalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MembershipRenewalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipRenewalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MembershipRenewalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipRenewalPayload>
          }
          findFirst: {
            args: Prisma.MembershipRenewalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipRenewalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MembershipRenewalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipRenewalPayload>
          }
          findMany: {
            args: Prisma.MembershipRenewalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipRenewalPayload>[]
          }
          create: {
            args: Prisma.MembershipRenewalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipRenewalPayload>
          }
          createMany: {
            args: Prisma.MembershipRenewalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MembershipRenewalCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipRenewalPayload>[]
          }
          delete: {
            args: Prisma.MembershipRenewalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipRenewalPayload>
          }
          update: {
            args: Prisma.MembershipRenewalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipRenewalPayload>
          }
          deleteMany: {
            args: Prisma.MembershipRenewalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MembershipRenewalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MembershipRenewalUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipRenewalPayload>[]
          }
          upsert: {
            args: Prisma.MembershipRenewalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MembershipRenewalPayload>
          }
          aggregate: {
            args: Prisma.MembershipRenewalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMembershipRenewal>
          }
          groupBy: {
            args: Prisma.MembershipRenewalGroupByArgs<ExtArgs>
            result: $Utils.Optional<MembershipRenewalGroupByOutputType>[]
          }
          count: {
            args: Prisma.MembershipRenewalCountArgs<ExtArgs>
            result: $Utils.Optional<MembershipRenewalCountAggregateOutputType> | number
          }
        }
      }
      SystemLog: {
        payload: Prisma.$SystemLogPayload<ExtArgs>
        fields: Prisma.SystemLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SystemLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SystemLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          findFirst: {
            args: Prisma.SystemLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SystemLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          findMany: {
            args: Prisma.SystemLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>[]
          }
          create: {
            args: Prisma.SystemLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          createMany: {
            args: Prisma.SystemLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SystemLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>[]
          }
          delete: {
            args: Prisma.SystemLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          update: {
            args: Prisma.SystemLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          deleteMany: {
            args: Prisma.SystemLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SystemLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SystemLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>[]
          }
          upsert: {
            args: Prisma.SystemLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SystemLogPayload>
          }
          aggregate: {
            args: Prisma.SystemLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSystemLog>
          }
          groupBy: {
            args: Prisma.SystemLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<SystemLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.SystemLogCountArgs<ExtArgs>
            result: $Utils.Optional<SystemLogCountAggregateOutputType> | number
          }
        }
      }
      PerformanceMetric: {
        payload: Prisma.$PerformanceMetricPayload<ExtArgs>
        fields: Prisma.PerformanceMetricFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PerformanceMetricFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PerformanceMetricFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          findFirst: {
            args: Prisma.PerformanceMetricFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PerformanceMetricFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          findMany: {
            args: Prisma.PerformanceMetricFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>[]
          }
          create: {
            args: Prisma.PerformanceMetricCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          createMany: {
            args: Prisma.PerformanceMetricCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PerformanceMetricCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>[]
          }
          delete: {
            args: Prisma.PerformanceMetricDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          update: {
            args: Prisma.PerformanceMetricUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          deleteMany: {
            args: Prisma.PerformanceMetricDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PerformanceMetricUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PerformanceMetricUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>[]
          }
          upsert: {
            args: Prisma.PerformanceMetricUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PerformanceMetricPayload>
          }
          aggregate: {
            args: Prisma.PerformanceMetricAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePerformanceMetric>
          }
          groupBy: {
            args: Prisma.PerformanceMetricGroupByArgs<ExtArgs>
            result: $Utils.Optional<PerformanceMetricGroupByOutputType>[]
          }
          count: {
            args: Prisma.PerformanceMetricCountArgs<ExtArgs>
            result: $Utils.Optional<PerformanceMetricCountAggregateOutputType> | number
          }
        }
      }
      Expense: {
        payload: Prisma.$ExpensePayload<ExtArgs>
        fields: Prisma.ExpenseFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ExpenseFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ExpenseFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          findFirst: {
            args: Prisma.ExpenseFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ExpenseFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          findMany: {
            args: Prisma.ExpenseFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>[]
          }
          create: {
            args: Prisma.ExpenseCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          createMany: {
            args: Prisma.ExpenseCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ExpenseCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>[]
          }
          delete: {
            args: Prisma.ExpenseDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          update: {
            args: Prisma.ExpenseUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          deleteMany: {
            args: Prisma.ExpenseDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ExpenseUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ExpenseUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>[]
          }
          upsert: {
            args: Prisma.ExpenseUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ExpensePayload>
          }
          aggregate: {
            args: Prisma.ExpenseAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateExpense>
          }
          groupBy: {
            args: Prisma.ExpenseGroupByArgs<ExtArgs>
            result: $Utils.Optional<ExpenseGroupByOutputType>[]
          }
          count: {
            args: Prisma.ExpenseCountArgs<ExtArgs>
            result: $Utils.Optional<ExpenseCountAggregateOutputType> | number
          }
        }
      }
      InAppAlert: {
        payload: Prisma.$InAppAlertPayload<ExtArgs>
        fields: Prisma.InAppAlertFieldRefs
        operations: {
          findUnique: {
            args: Prisma.InAppAlertFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InAppAlertPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.InAppAlertFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InAppAlertPayload>
          }
          findFirst: {
            args: Prisma.InAppAlertFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InAppAlertPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.InAppAlertFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InAppAlertPayload>
          }
          findMany: {
            args: Prisma.InAppAlertFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InAppAlertPayload>[]
          }
          create: {
            args: Prisma.InAppAlertCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InAppAlertPayload>
          }
          createMany: {
            args: Prisma.InAppAlertCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.InAppAlertCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InAppAlertPayload>[]
          }
          delete: {
            args: Prisma.InAppAlertDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InAppAlertPayload>
          }
          update: {
            args: Prisma.InAppAlertUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InAppAlertPayload>
          }
          deleteMany: {
            args: Prisma.InAppAlertDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.InAppAlertUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.InAppAlertUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InAppAlertPayload>[]
          }
          upsert: {
            args: Prisma.InAppAlertUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$InAppAlertPayload>
          }
          aggregate: {
            args: Prisma.InAppAlertAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateInAppAlert>
          }
          groupBy: {
            args: Prisma.InAppAlertGroupByArgs<ExtArgs>
            result: $Utils.Optional<InAppAlertGroupByOutputType>[]
          }
          count: {
            args: Prisma.InAppAlertCountArgs<ExtArgs>
            result: $Utils.Optional<InAppAlertCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    classSession?: ClassSessionOmit
    discipline?: DisciplineOmit
    instructor?: InstructorOmit
    membershipPlan?: MembershipPlanOmit
    organization?: OrganizationOmit
    classRegistration?: ClassRegistrationOmit
    membershipRenewal?: MembershipRenewalOmit
    systemLog?: SystemLogOmit
    performanceMetric?: PerformanceMetricOmit
    expense?: ExpenseOmit
    inAppAlert?: InAppAlertOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    classRegistrations: number
    membershipRenewals: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    classRegistrations?: boolean | UserCountOutputTypeCountClassRegistrationsArgs
    membershipRenewals?: boolean | UserCountOutputTypeCountMembershipRenewalsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountClassRegistrationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClassRegistrationWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountMembershipRenewalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MembershipRenewalWhereInput
  }


  /**
   * Count Type ClassSessionCountOutputType
   */

  export type ClassSessionCountOutputType = {
    registrations: number
  }

  export type ClassSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    registrations?: boolean | ClassSessionCountOutputTypeCountRegistrationsArgs
  }

  // Custom InputTypes
  /**
   * ClassSessionCountOutputType without action
   */
  export type ClassSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSessionCountOutputType
     */
    select?: ClassSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ClassSessionCountOutputType without action
   */
  export type ClassSessionCountOutputTypeCountRegistrationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClassRegistrationWhereInput
  }


  /**
   * Count Type DisciplineCountOutputType
   */

  export type DisciplineCountOutputType = {
    classes: number
  }

  export type DisciplineCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    classes?: boolean | DisciplineCountOutputTypeCountClassesArgs
  }

  // Custom InputTypes
  /**
   * DisciplineCountOutputType without action
   */
  export type DisciplineCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DisciplineCountOutputType
     */
    select?: DisciplineCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * DisciplineCountOutputType without action
   */
  export type DisciplineCountOutputTypeCountClassesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClassSessionWhereInput
  }


  /**
   * Count Type InstructorCountOutputType
   */

  export type InstructorCountOutputType = {
    classes: number
  }

  export type InstructorCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    classes?: boolean | InstructorCountOutputTypeCountClassesArgs
  }

  // Custom InputTypes
  /**
   * InstructorCountOutputType without action
   */
  export type InstructorCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InstructorCountOutputType
     */
    select?: InstructorCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * InstructorCountOutputType without action
   */
  export type InstructorCountOutputTypeCountClassesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClassSessionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    phone: string | null
    role: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    phone: string | null
    role: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    firstName: number
    lastName: number
    email: number
    phone: number
    role: number
    createdAt: number
    updatedAt: number
    membership: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    phone?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    phone?: true
    role?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    phone?: true
    role?: true
    createdAt?: true
    updatedAt?: true
    membership?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    role: string
    createdAt: Date
    updatedAt: Date
    membership: JsonValue | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    phone?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    membership?: boolean
    classRegistrations?: boolean | User$classRegistrationsArgs<ExtArgs>
    membershipRenewals?: boolean | User$membershipRenewalsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    phone?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    membership?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    phone?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    membership?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    phone?: boolean
    role?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    membership?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "firstName" | "lastName" | "email" | "phone" | "role" | "createdAt" | "updatedAt" | "membership", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    classRegistrations?: boolean | User$classRegistrationsArgs<ExtArgs>
    membershipRenewals?: boolean | User$membershipRenewalsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      classRegistrations: Prisma.$ClassRegistrationPayload<ExtArgs>[]
      membershipRenewals: Prisma.$MembershipRenewalPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      firstName: string
      lastName: string
      email: string
      phone: string | null
      role: string
      createdAt: Date
      updatedAt: Date
      membership: Prisma.JsonValue | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    classRegistrations<T extends User$classRegistrationsArgs<ExtArgs> = {}>(args?: Subset<T, User$classRegistrationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    membershipRenewals<T extends User$membershipRenewalsArgs<ExtArgs> = {}>(args?: Subset<T, User$membershipRenewalsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly firstName: FieldRef<"User", 'String'>
    readonly lastName: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly membership: FieldRef<"User", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.classRegistrations
   */
  export type User$classRegistrationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
    where?: ClassRegistrationWhereInput
    orderBy?: ClassRegistrationOrderByWithRelationInput | ClassRegistrationOrderByWithRelationInput[]
    cursor?: ClassRegistrationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClassRegistrationScalarFieldEnum | ClassRegistrationScalarFieldEnum[]
  }

  /**
   * User.membershipRenewals
   */
  export type User$membershipRenewalsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalInclude<ExtArgs> | null
    where?: MembershipRenewalWhereInput
    orderBy?: MembershipRenewalOrderByWithRelationInput | MembershipRenewalOrderByWithRelationInput[]
    cursor?: MembershipRenewalWhereUniqueInput
    take?: number
    skip?: number
    distinct?: MembershipRenewalScalarFieldEnum | MembershipRenewalScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model ClassSession
   */

  export type AggregateClassSession = {
    _count: ClassSessionCountAggregateOutputType | null
    _avg: ClassSessionAvgAggregateOutputType | null
    _sum: ClassSessionSumAggregateOutputType | null
    _min: ClassSessionMinAggregateOutputType | null
    _max: ClassSessionMaxAggregateOutputType | null
  }

  export type ClassSessionAvgAggregateOutputType = {
    durationMinutes: number | null
    capacity: number | null
  }

  export type ClassSessionSumAggregateOutputType = {
    durationMinutes: number | null
    capacity: number | null
  }

  export type ClassSessionMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    disciplineId: string | null
    name: string | null
    dateTime: Date | null
    durationMinutes: number | null
    instructorId: string | null
    capacity: number | null
    status: string | null
    notes: string | null
    isGenerated: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClassSessionMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    disciplineId: string | null
    name: string | null
    dateTime: Date | null
    durationMinutes: number | null
    instructorId: string | null
    capacity: number | null
    status: string | null
    notes: string | null
    isGenerated: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ClassSessionCountAggregateOutputType = {
    id: number
    organizationId: number
    disciplineId: number
    name: number
    dateTime: number
    durationMinutes: number
    instructorId: number
    capacity: number
    registeredParticipantsIds: number
    waitlistParticipantsIds: number
    status: number
    notes: number
    isGenerated: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ClassSessionAvgAggregateInputType = {
    durationMinutes?: true
    capacity?: true
  }

  export type ClassSessionSumAggregateInputType = {
    durationMinutes?: true
    capacity?: true
  }

  export type ClassSessionMinAggregateInputType = {
    id?: true
    organizationId?: true
    disciplineId?: true
    name?: true
    dateTime?: true
    durationMinutes?: true
    instructorId?: true
    capacity?: true
    status?: true
    notes?: true
    isGenerated?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClassSessionMaxAggregateInputType = {
    id?: true
    organizationId?: true
    disciplineId?: true
    name?: true
    dateTime?: true
    durationMinutes?: true
    instructorId?: true
    capacity?: true
    status?: true
    notes?: true
    isGenerated?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ClassSessionCountAggregateInputType = {
    id?: true
    organizationId?: true
    disciplineId?: true
    name?: true
    dateTime?: true
    durationMinutes?: true
    instructorId?: true
    capacity?: true
    registeredParticipantsIds?: true
    waitlistParticipantsIds?: true
    status?: true
    notes?: true
    isGenerated?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ClassSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClassSession to aggregate.
     */
    where?: ClassSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClassSessions to fetch.
     */
    orderBy?: ClassSessionOrderByWithRelationInput | ClassSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClassSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClassSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClassSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ClassSessions
    **/
    _count?: true | ClassSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ClassSessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ClassSessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClassSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClassSessionMaxAggregateInputType
  }

  export type GetClassSessionAggregateType<T extends ClassSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateClassSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClassSession[P]>
      : GetScalarType<T[P], AggregateClassSession[P]>
  }




  export type ClassSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClassSessionWhereInput
    orderBy?: ClassSessionOrderByWithAggregationInput | ClassSessionOrderByWithAggregationInput[]
    by: ClassSessionScalarFieldEnum[] | ClassSessionScalarFieldEnum
    having?: ClassSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClassSessionCountAggregateInputType | true
    _avg?: ClassSessionAvgAggregateInputType
    _sum?: ClassSessionSumAggregateInputType
    _min?: ClassSessionMinAggregateInputType
    _max?: ClassSessionMaxAggregateInputType
  }

  export type ClassSessionGroupByOutputType = {
    id: string
    organizationId: string
    disciplineId: string
    name: string
    dateTime: Date
    durationMinutes: number
    instructorId: string
    capacity: number
    registeredParticipantsIds: string[]
    waitlistParticipantsIds: string[]
    status: string
    notes: string | null
    isGenerated: boolean
    createdAt: Date
    updatedAt: Date
    _count: ClassSessionCountAggregateOutputType | null
    _avg: ClassSessionAvgAggregateOutputType | null
    _sum: ClassSessionSumAggregateOutputType | null
    _min: ClassSessionMinAggregateOutputType | null
    _max: ClassSessionMaxAggregateOutputType | null
  }

  type GetClassSessionGroupByPayload<T extends ClassSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClassSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClassSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClassSessionGroupByOutputType[P]>
            : GetScalarType<T[P], ClassSessionGroupByOutputType[P]>
        }
      >
    >


  export type ClassSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    disciplineId?: boolean
    name?: boolean
    dateTime?: boolean
    durationMinutes?: boolean
    instructorId?: boolean
    capacity?: boolean
    registeredParticipantsIds?: boolean
    waitlistParticipantsIds?: boolean
    status?: boolean
    notes?: boolean
    isGenerated?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    discipline?: boolean | DisciplineDefaultArgs<ExtArgs>
    instructor?: boolean | InstructorDefaultArgs<ExtArgs>
    registrations?: boolean | ClassSession$registrationsArgs<ExtArgs>
    _count?: boolean | ClassSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["classSession"]>

  export type ClassSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    disciplineId?: boolean
    name?: boolean
    dateTime?: boolean
    durationMinutes?: boolean
    instructorId?: boolean
    capacity?: boolean
    registeredParticipantsIds?: boolean
    waitlistParticipantsIds?: boolean
    status?: boolean
    notes?: boolean
    isGenerated?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    discipline?: boolean | DisciplineDefaultArgs<ExtArgs>
    instructor?: boolean | InstructorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["classSession"]>

  export type ClassSessionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    disciplineId?: boolean
    name?: boolean
    dateTime?: boolean
    durationMinutes?: boolean
    instructorId?: boolean
    capacity?: boolean
    registeredParticipantsIds?: boolean
    waitlistParticipantsIds?: boolean
    status?: boolean
    notes?: boolean
    isGenerated?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    discipline?: boolean | DisciplineDefaultArgs<ExtArgs>
    instructor?: boolean | InstructorDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["classSession"]>

  export type ClassSessionSelectScalar = {
    id?: boolean
    organizationId?: boolean
    disciplineId?: boolean
    name?: boolean
    dateTime?: boolean
    durationMinutes?: boolean
    instructorId?: boolean
    capacity?: boolean
    registeredParticipantsIds?: boolean
    waitlistParticipantsIds?: boolean
    status?: boolean
    notes?: boolean
    isGenerated?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ClassSessionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "disciplineId" | "name" | "dateTime" | "durationMinutes" | "instructorId" | "capacity" | "registeredParticipantsIds" | "waitlistParticipantsIds" | "status" | "notes" | "isGenerated" | "createdAt" | "updatedAt", ExtArgs["result"]["classSession"]>
  export type ClassSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    discipline?: boolean | DisciplineDefaultArgs<ExtArgs>
    instructor?: boolean | InstructorDefaultArgs<ExtArgs>
    registrations?: boolean | ClassSession$registrationsArgs<ExtArgs>
    _count?: boolean | ClassSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ClassSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    discipline?: boolean | DisciplineDefaultArgs<ExtArgs>
    instructor?: boolean | InstructorDefaultArgs<ExtArgs>
  }
  export type ClassSessionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    discipline?: boolean | DisciplineDefaultArgs<ExtArgs>
    instructor?: boolean | InstructorDefaultArgs<ExtArgs>
  }

  export type $ClassSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ClassSession"
    objects: {
      discipline: Prisma.$DisciplinePayload<ExtArgs>
      instructor: Prisma.$InstructorPayload<ExtArgs>
      registrations: Prisma.$ClassRegistrationPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      disciplineId: string
      name: string
      dateTime: Date
      durationMinutes: number
      instructorId: string
      capacity: number
      registeredParticipantsIds: string[]
      waitlistParticipantsIds: string[]
      status: string
      notes: string | null
      isGenerated: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["classSession"]>
    composites: {}
  }

  type ClassSessionGetPayload<S extends boolean | null | undefined | ClassSessionDefaultArgs> = $Result.GetResult<Prisma.$ClassSessionPayload, S>

  type ClassSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClassSessionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClassSessionCountAggregateInputType | true
    }

  export interface ClassSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ClassSession'], meta: { name: 'ClassSession' } }
    /**
     * Find zero or one ClassSession that matches the filter.
     * @param {ClassSessionFindUniqueArgs} args - Arguments to find a ClassSession
     * @example
     * // Get one ClassSession
     * const classSession = await prisma.classSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClassSessionFindUniqueArgs>(args: SelectSubset<T, ClassSessionFindUniqueArgs<ExtArgs>>): Prisma__ClassSessionClient<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ClassSession that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClassSessionFindUniqueOrThrowArgs} args - Arguments to find a ClassSession
     * @example
     * // Get one ClassSession
     * const classSession = await prisma.classSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClassSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, ClassSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClassSessionClient<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClassSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassSessionFindFirstArgs} args - Arguments to find a ClassSession
     * @example
     * // Get one ClassSession
     * const classSession = await prisma.classSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClassSessionFindFirstArgs>(args?: SelectSubset<T, ClassSessionFindFirstArgs<ExtArgs>>): Prisma__ClassSessionClient<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClassSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassSessionFindFirstOrThrowArgs} args - Arguments to find a ClassSession
     * @example
     * // Get one ClassSession
     * const classSession = await prisma.classSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClassSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, ClassSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClassSessionClient<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ClassSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ClassSessions
     * const classSessions = await prisma.classSession.findMany()
     * 
     * // Get first 10 ClassSessions
     * const classSessions = await prisma.classSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const classSessionWithIdOnly = await prisma.classSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClassSessionFindManyArgs>(args?: SelectSubset<T, ClassSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ClassSession.
     * @param {ClassSessionCreateArgs} args - Arguments to create a ClassSession.
     * @example
     * // Create one ClassSession
     * const ClassSession = await prisma.classSession.create({
     *   data: {
     *     // ... data to create a ClassSession
     *   }
     * })
     * 
     */
    create<T extends ClassSessionCreateArgs>(args: SelectSubset<T, ClassSessionCreateArgs<ExtArgs>>): Prisma__ClassSessionClient<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ClassSessions.
     * @param {ClassSessionCreateManyArgs} args - Arguments to create many ClassSessions.
     * @example
     * // Create many ClassSessions
     * const classSession = await prisma.classSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClassSessionCreateManyArgs>(args?: SelectSubset<T, ClassSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ClassSessions and returns the data saved in the database.
     * @param {ClassSessionCreateManyAndReturnArgs} args - Arguments to create many ClassSessions.
     * @example
     * // Create many ClassSessions
     * const classSession = await prisma.classSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ClassSessions and only return the `id`
     * const classSessionWithIdOnly = await prisma.classSession.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClassSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, ClassSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ClassSession.
     * @param {ClassSessionDeleteArgs} args - Arguments to delete one ClassSession.
     * @example
     * // Delete one ClassSession
     * const ClassSession = await prisma.classSession.delete({
     *   where: {
     *     // ... filter to delete one ClassSession
     *   }
     * })
     * 
     */
    delete<T extends ClassSessionDeleteArgs>(args: SelectSubset<T, ClassSessionDeleteArgs<ExtArgs>>): Prisma__ClassSessionClient<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ClassSession.
     * @param {ClassSessionUpdateArgs} args - Arguments to update one ClassSession.
     * @example
     * // Update one ClassSession
     * const classSession = await prisma.classSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClassSessionUpdateArgs>(args: SelectSubset<T, ClassSessionUpdateArgs<ExtArgs>>): Prisma__ClassSessionClient<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ClassSessions.
     * @param {ClassSessionDeleteManyArgs} args - Arguments to filter ClassSessions to delete.
     * @example
     * // Delete a few ClassSessions
     * const { count } = await prisma.classSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClassSessionDeleteManyArgs>(args?: SelectSubset<T, ClassSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClassSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ClassSessions
     * const classSession = await prisma.classSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClassSessionUpdateManyArgs>(args: SelectSubset<T, ClassSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClassSessions and returns the data updated in the database.
     * @param {ClassSessionUpdateManyAndReturnArgs} args - Arguments to update many ClassSessions.
     * @example
     * // Update many ClassSessions
     * const classSession = await prisma.classSession.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ClassSessions and only return the `id`
     * const classSessionWithIdOnly = await prisma.classSession.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClassSessionUpdateManyAndReturnArgs>(args: SelectSubset<T, ClassSessionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ClassSession.
     * @param {ClassSessionUpsertArgs} args - Arguments to update or create a ClassSession.
     * @example
     * // Update or create a ClassSession
     * const classSession = await prisma.classSession.upsert({
     *   create: {
     *     // ... data to create a ClassSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ClassSession we want to update
     *   }
     * })
     */
    upsert<T extends ClassSessionUpsertArgs>(args: SelectSubset<T, ClassSessionUpsertArgs<ExtArgs>>): Prisma__ClassSessionClient<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ClassSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassSessionCountArgs} args - Arguments to filter ClassSessions to count.
     * @example
     * // Count the number of ClassSessions
     * const count = await prisma.classSession.count({
     *   where: {
     *     // ... the filter for the ClassSessions we want to count
     *   }
     * })
    **/
    count<T extends ClassSessionCountArgs>(
      args?: Subset<T, ClassSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClassSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ClassSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClassSessionAggregateArgs>(args: Subset<T, ClassSessionAggregateArgs>): Prisma.PrismaPromise<GetClassSessionAggregateType<T>>

    /**
     * Group by ClassSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClassSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClassSessionGroupByArgs['orderBy'] }
        : { orderBy?: ClassSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClassSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClassSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ClassSession model
   */
  readonly fields: ClassSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ClassSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClassSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    discipline<T extends DisciplineDefaultArgs<ExtArgs> = {}>(args?: Subset<T, DisciplineDefaultArgs<ExtArgs>>): Prisma__DisciplineClient<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    instructor<T extends InstructorDefaultArgs<ExtArgs> = {}>(args?: Subset<T, InstructorDefaultArgs<ExtArgs>>): Prisma__InstructorClient<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    registrations<T extends ClassSession$registrationsArgs<ExtArgs> = {}>(args?: Subset<T, ClassSession$registrationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ClassSession model
   */
  interface ClassSessionFieldRefs {
    readonly id: FieldRef<"ClassSession", 'String'>
    readonly organizationId: FieldRef<"ClassSession", 'String'>
    readonly disciplineId: FieldRef<"ClassSession", 'String'>
    readonly name: FieldRef<"ClassSession", 'String'>
    readonly dateTime: FieldRef<"ClassSession", 'DateTime'>
    readonly durationMinutes: FieldRef<"ClassSession", 'Int'>
    readonly instructorId: FieldRef<"ClassSession", 'String'>
    readonly capacity: FieldRef<"ClassSession", 'Int'>
    readonly registeredParticipantsIds: FieldRef<"ClassSession", 'String[]'>
    readonly waitlistParticipantsIds: FieldRef<"ClassSession", 'String[]'>
    readonly status: FieldRef<"ClassSession", 'String'>
    readonly notes: FieldRef<"ClassSession", 'String'>
    readonly isGenerated: FieldRef<"ClassSession", 'Boolean'>
    readonly createdAt: FieldRef<"ClassSession", 'DateTime'>
    readonly updatedAt: FieldRef<"ClassSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ClassSession findUnique
   */
  export type ClassSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
    /**
     * Filter, which ClassSession to fetch.
     */
    where: ClassSessionWhereUniqueInput
  }

  /**
   * ClassSession findUniqueOrThrow
   */
  export type ClassSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
    /**
     * Filter, which ClassSession to fetch.
     */
    where: ClassSessionWhereUniqueInput
  }

  /**
   * ClassSession findFirst
   */
  export type ClassSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
    /**
     * Filter, which ClassSession to fetch.
     */
    where?: ClassSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClassSessions to fetch.
     */
    orderBy?: ClassSessionOrderByWithRelationInput | ClassSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClassSessions.
     */
    cursor?: ClassSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClassSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClassSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClassSessions.
     */
    distinct?: ClassSessionScalarFieldEnum | ClassSessionScalarFieldEnum[]
  }

  /**
   * ClassSession findFirstOrThrow
   */
  export type ClassSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
    /**
     * Filter, which ClassSession to fetch.
     */
    where?: ClassSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClassSessions to fetch.
     */
    orderBy?: ClassSessionOrderByWithRelationInput | ClassSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClassSessions.
     */
    cursor?: ClassSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClassSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClassSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClassSessions.
     */
    distinct?: ClassSessionScalarFieldEnum | ClassSessionScalarFieldEnum[]
  }

  /**
   * ClassSession findMany
   */
  export type ClassSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
    /**
     * Filter, which ClassSessions to fetch.
     */
    where?: ClassSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClassSessions to fetch.
     */
    orderBy?: ClassSessionOrderByWithRelationInput | ClassSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ClassSessions.
     */
    cursor?: ClassSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClassSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClassSessions.
     */
    skip?: number
    distinct?: ClassSessionScalarFieldEnum | ClassSessionScalarFieldEnum[]
  }

  /**
   * ClassSession create
   */
  export type ClassSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a ClassSession.
     */
    data: XOR<ClassSessionCreateInput, ClassSessionUncheckedCreateInput>
  }

  /**
   * ClassSession createMany
   */
  export type ClassSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ClassSessions.
     */
    data: ClassSessionCreateManyInput | ClassSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ClassSession createManyAndReturn
   */
  export type ClassSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * The data used to create many ClassSessions.
     */
    data: ClassSessionCreateManyInput | ClassSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClassSession update
   */
  export type ClassSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a ClassSession.
     */
    data: XOR<ClassSessionUpdateInput, ClassSessionUncheckedUpdateInput>
    /**
     * Choose, which ClassSession to update.
     */
    where: ClassSessionWhereUniqueInput
  }

  /**
   * ClassSession updateMany
   */
  export type ClassSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ClassSessions.
     */
    data: XOR<ClassSessionUpdateManyMutationInput, ClassSessionUncheckedUpdateManyInput>
    /**
     * Filter which ClassSessions to update
     */
    where?: ClassSessionWhereInput
    /**
     * Limit how many ClassSessions to update.
     */
    limit?: number
  }

  /**
   * ClassSession updateManyAndReturn
   */
  export type ClassSessionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * The data used to update ClassSessions.
     */
    data: XOR<ClassSessionUpdateManyMutationInput, ClassSessionUncheckedUpdateManyInput>
    /**
     * Filter which ClassSessions to update
     */
    where?: ClassSessionWhereInput
    /**
     * Limit how many ClassSessions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClassSession upsert
   */
  export type ClassSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the ClassSession to update in case it exists.
     */
    where: ClassSessionWhereUniqueInput
    /**
     * In case the ClassSession found by the `where` argument doesn't exist, create a new ClassSession with this data.
     */
    create: XOR<ClassSessionCreateInput, ClassSessionUncheckedCreateInput>
    /**
     * In case the ClassSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClassSessionUpdateInput, ClassSessionUncheckedUpdateInput>
  }

  /**
   * ClassSession delete
   */
  export type ClassSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
    /**
     * Filter which ClassSession to delete.
     */
    where: ClassSessionWhereUniqueInput
  }

  /**
   * ClassSession deleteMany
   */
  export type ClassSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClassSessions to delete
     */
    where?: ClassSessionWhereInput
    /**
     * Limit how many ClassSessions to delete.
     */
    limit?: number
  }

  /**
   * ClassSession.registrations
   */
  export type ClassSession$registrationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
    where?: ClassRegistrationWhereInput
    orderBy?: ClassRegistrationOrderByWithRelationInput | ClassRegistrationOrderByWithRelationInput[]
    cursor?: ClassRegistrationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClassRegistrationScalarFieldEnum | ClassRegistrationScalarFieldEnum[]
  }

  /**
   * ClassSession without action
   */
  export type ClassSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
  }


  /**
   * Model Discipline
   */

  export type AggregateDiscipline = {
    _count: DisciplineCountAggregateOutputType | null
    _min: DisciplineMinAggregateOutputType | null
    _max: DisciplineMaxAggregateOutputType | null
  }

  export type DisciplineMinAggregateOutputType = {
    id: string | null
    organizationId: string | null
    name: string | null
    description: string | null
    color: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DisciplineMaxAggregateOutputType = {
    id: string | null
    organizationId: string | null
    name: string | null
    description: string | null
    color: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type DisciplineCountAggregateOutputType = {
    id: number
    organizationId: number
    name: number
    description: number
    color: number
    isActive: number
    createdAt: number
    updatedAt: number
    schedule: number
    cancellationRules: number
    _all: number
  }


  export type DisciplineMinAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    description?: true
    color?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DisciplineMaxAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    description?: true
    color?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type DisciplineCountAggregateInputType = {
    id?: true
    organizationId?: true
    name?: true
    description?: true
    color?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    schedule?: true
    cancellationRules?: true
    _all?: true
  }

  export type DisciplineAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Discipline to aggregate.
     */
    where?: DisciplineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Disciplines to fetch.
     */
    orderBy?: DisciplineOrderByWithRelationInput | DisciplineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DisciplineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Disciplines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Disciplines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Disciplines
    **/
    _count?: true | DisciplineCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DisciplineMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DisciplineMaxAggregateInputType
  }

  export type GetDisciplineAggregateType<T extends DisciplineAggregateArgs> = {
        [P in keyof T & keyof AggregateDiscipline]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDiscipline[P]>
      : GetScalarType<T[P], AggregateDiscipline[P]>
  }




  export type DisciplineGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DisciplineWhereInput
    orderBy?: DisciplineOrderByWithAggregationInput | DisciplineOrderByWithAggregationInput[]
    by: DisciplineScalarFieldEnum[] | DisciplineScalarFieldEnum
    having?: DisciplineScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DisciplineCountAggregateInputType | true
    _min?: DisciplineMinAggregateInputType
    _max?: DisciplineMaxAggregateInputType
  }

  export type DisciplineGroupByOutputType = {
    id: string
    organizationId: string
    name: string
    description: string | null
    color: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    schedule: JsonValue | null
    cancellationRules: JsonValue | null
    _count: DisciplineCountAggregateOutputType | null
    _min: DisciplineMinAggregateOutputType | null
    _max: DisciplineMaxAggregateOutputType | null
  }

  type GetDisciplineGroupByPayload<T extends DisciplineGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DisciplineGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DisciplineGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DisciplineGroupByOutputType[P]>
            : GetScalarType<T[P], DisciplineGroupByOutputType[P]>
        }
      >
    >


  export type DisciplineSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    description?: boolean
    color?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schedule?: boolean
    cancellationRules?: boolean
    classes?: boolean | Discipline$classesArgs<ExtArgs>
    _count?: boolean | DisciplineCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["discipline"]>

  export type DisciplineSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    description?: boolean
    color?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schedule?: boolean
    cancellationRules?: boolean
  }, ExtArgs["result"]["discipline"]>

  export type DisciplineSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    organizationId?: boolean
    name?: boolean
    description?: boolean
    color?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schedule?: boolean
    cancellationRules?: boolean
  }, ExtArgs["result"]["discipline"]>

  export type DisciplineSelectScalar = {
    id?: boolean
    organizationId?: boolean
    name?: boolean
    description?: boolean
    color?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    schedule?: boolean
    cancellationRules?: boolean
  }

  export type DisciplineOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "organizationId" | "name" | "description" | "color" | "isActive" | "createdAt" | "updatedAt" | "schedule" | "cancellationRules", ExtArgs["result"]["discipline"]>
  export type DisciplineInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    classes?: boolean | Discipline$classesArgs<ExtArgs>
    _count?: boolean | DisciplineCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type DisciplineIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type DisciplineIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $DisciplinePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Discipline"
    objects: {
      classes: Prisma.$ClassSessionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      organizationId: string
      name: string
      description: string | null
      color: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
      schedule: Prisma.JsonValue | null
      cancellationRules: Prisma.JsonValue | null
    }, ExtArgs["result"]["discipline"]>
    composites: {}
  }

  type DisciplineGetPayload<S extends boolean | null | undefined | DisciplineDefaultArgs> = $Result.GetResult<Prisma.$DisciplinePayload, S>

  type DisciplineCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DisciplineFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DisciplineCountAggregateInputType | true
    }

  export interface DisciplineDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Discipline'], meta: { name: 'Discipline' } }
    /**
     * Find zero or one Discipline that matches the filter.
     * @param {DisciplineFindUniqueArgs} args - Arguments to find a Discipline
     * @example
     * // Get one Discipline
     * const discipline = await prisma.discipline.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DisciplineFindUniqueArgs>(args: SelectSubset<T, DisciplineFindUniqueArgs<ExtArgs>>): Prisma__DisciplineClient<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Discipline that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DisciplineFindUniqueOrThrowArgs} args - Arguments to find a Discipline
     * @example
     * // Get one Discipline
     * const discipline = await prisma.discipline.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DisciplineFindUniqueOrThrowArgs>(args: SelectSubset<T, DisciplineFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DisciplineClient<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Discipline that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DisciplineFindFirstArgs} args - Arguments to find a Discipline
     * @example
     * // Get one Discipline
     * const discipline = await prisma.discipline.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DisciplineFindFirstArgs>(args?: SelectSubset<T, DisciplineFindFirstArgs<ExtArgs>>): Prisma__DisciplineClient<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Discipline that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DisciplineFindFirstOrThrowArgs} args - Arguments to find a Discipline
     * @example
     * // Get one Discipline
     * const discipline = await prisma.discipline.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DisciplineFindFirstOrThrowArgs>(args?: SelectSubset<T, DisciplineFindFirstOrThrowArgs<ExtArgs>>): Prisma__DisciplineClient<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Disciplines that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DisciplineFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Disciplines
     * const disciplines = await prisma.discipline.findMany()
     * 
     * // Get first 10 Disciplines
     * const disciplines = await prisma.discipline.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const disciplineWithIdOnly = await prisma.discipline.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DisciplineFindManyArgs>(args?: SelectSubset<T, DisciplineFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Discipline.
     * @param {DisciplineCreateArgs} args - Arguments to create a Discipline.
     * @example
     * // Create one Discipline
     * const Discipline = await prisma.discipline.create({
     *   data: {
     *     // ... data to create a Discipline
     *   }
     * })
     * 
     */
    create<T extends DisciplineCreateArgs>(args: SelectSubset<T, DisciplineCreateArgs<ExtArgs>>): Prisma__DisciplineClient<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Disciplines.
     * @param {DisciplineCreateManyArgs} args - Arguments to create many Disciplines.
     * @example
     * // Create many Disciplines
     * const discipline = await prisma.discipline.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DisciplineCreateManyArgs>(args?: SelectSubset<T, DisciplineCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Disciplines and returns the data saved in the database.
     * @param {DisciplineCreateManyAndReturnArgs} args - Arguments to create many Disciplines.
     * @example
     * // Create many Disciplines
     * const discipline = await prisma.discipline.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Disciplines and only return the `id`
     * const disciplineWithIdOnly = await prisma.discipline.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DisciplineCreateManyAndReturnArgs>(args?: SelectSubset<T, DisciplineCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Discipline.
     * @param {DisciplineDeleteArgs} args - Arguments to delete one Discipline.
     * @example
     * // Delete one Discipline
     * const Discipline = await prisma.discipline.delete({
     *   where: {
     *     // ... filter to delete one Discipline
     *   }
     * })
     * 
     */
    delete<T extends DisciplineDeleteArgs>(args: SelectSubset<T, DisciplineDeleteArgs<ExtArgs>>): Prisma__DisciplineClient<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Discipline.
     * @param {DisciplineUpdateArgs} args - Arguments to update one Discipline.
     * @example
     * // Update one Discipline
     * const discipline = await prisma.discipline.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DisciplineUpdateArgs>(args: SelectSubset<T, DisciplineUpdateArgs<ExtArgs>>): Prisma__DisciplineClient<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Disciplines.
     * @param {DisciplineDeleteManyArgs} args - Arguments to filter Disciplines to delete.
     * @example
     * // Delete a few Disciplines
     * const { count } = await prisma.discipline.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DisciplineDeleteManyArgs>(args?: SelectSubset<T, DisciplineDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Disciplines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DisciplineUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Disciplines
     * const discipline = await prisma.discipline.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DisciplineUpdateManyArgs>(args: SelectSubset<T, DisciplineUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Disciplines and returns the data updated in the database.
     * @param {DisciplineUpdateManyAndReturnArgs} args - Arguments to update many Disciplines.
     * @example
     * // Update many Disciplines
     * const discipline = await prisma.discipline.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Disciplines and only return the `id`
     * const disciplineWithIdOnly = await prisma.discipline.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DisciplineUpdateManyAndReturnArgs>(args: SelectSubset<T, DisciplineUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Discipline.
     * @param {DisciplineUpsertArgs} args - Arguments to update or create a Discipline.
     * @example
     * // Update or create a Discipline
     * const discipline = await prisma.discipline.upsert({
     *   create: {
     *     // ... data to create a Discipline
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Discipline we want to update
     *   }
     * })
     */
    upsert<T extends DisciplineUpsertArgs>(args: SelectSubset<T, DisciplineUpsertArgs<ExtArgs>>): Prisma__DisciplineClient<$Result.GetResult<Prisma.$DisciplinePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Disciplines.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DisciplineCountArgs} args - Arguments to filter Disciplines to count.
     * @example
     * // Count the number of Disciplines
     * const count = await prisma.discipline.count({
     *   where: {
     *     // ... the filter for the Disciplines we want to count
     *   }
     * })
    **/
    count<T extends DisciplineCountArgs>(
      args?: Subset<T, DisciplineCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DisciplineCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Discipline.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DisciplineAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DisciplineAggregateArgs>(args: Subset<T, DisciplineAggregateArgs>): Prisma.PrismaPromise<GetDisciplineAggregateType<T>>

    /**
     * Group by Discipline.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DisciplineGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DisciplineGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DisciplineGroupByArgs['orderBy'] }
        : { orderBy?: DisciplineGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DisciplineGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDisciplineGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Discipline model
   */
  readonly fields: DisciplineFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Discipline.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DisciplineClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    classes<T extends Discipline$classesArgs<ExtArgs> = {}>(args?: Subset<T, Discipline$classesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Discipline model
   */
  interface DisciplineFieldRefs {
    readonly id: FieldRef<"Discipline", 'String'>
    readonly organizationId: FieldRef<"Discipline", 'String'>
    readonly name: FieldRef<"Discipline", 'String'>
    readonly description: FieldRef<"Discipline", 'String'>
    readonly color: FieldRef<"Discipline", 'String'>
    readonly isActive: FieldRef<"Discipline", 'Boolean'>
    readonly createdAt: FieldRef<"Discipline", 'DateTime'>
    readonly updatedAt: FieldRef<"Discipline", 'DateTime'>
    readonly schedule: FieldRef<"Discipline", 'Json'>
    readonly cancellationRules: FieldRef<"Discipline", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * Discipline findUnique
   */
  export type DisciplineFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DisciplineInclude<ExtArgs> | null
    /**
     * Filter, which Discipline to fetch.
     */
    where: DisciplineWhereUniqueInput
  }

  /**
   * Discipline findUniqueOrThrow
   */
  export type DisciplineFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DisciplineInclude<ExtArgs> | null
    /**
     * Filter, which Discipline to fetch.
     */
    where: DisciplineWhereUniqueInput
  }

  /**
   * Discipline findFirst
   */
  export type DisciplineFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DisciplineInclude<ExtArgs> | null
    /**
     * Filter, which Discipline to fetch.
     */
    where?: DisciplineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Disciplines to fetch.
     */
    orderBy?: DisciplineOrderByWithRelationInput | DisciplineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Disciplines.
     */
    cursor?: DisciplineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Disciplines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Disciplines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Disciplines.
     */
    distinct?: DisciplineScalarFieldEnum | DisciplineScalarFieldEnum[]
  }

  /**
   * Discipline findFirstOrThrow
   */
  export type DisciplineFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DisciplineInclude<ExtArgs> | null
    /**
     * Filter, which Discipline to fetch.
     */
    where?: DisciplineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Disciplines to fetch.
     */
    orderBy?: DisciplineOrderByWithRelationInput | DisciplineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Disciplines.
     */
    cursor?: DisciplineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Disciplines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Disciplines.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Disciplines.
     */
    distinct?: DisciplineScalarFieldEnum | DisciplineScalarFieldEnum[]
  }

  /**
   * Discipline findMany
   */
  export type DisciplineFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DisciplineInclude<ExtArgs> | null
    /**
     * Filter, which Disciplines to fetch.
     */
    where?: DisciplineWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Disciplines to fetch.
     */
    orderBy?: DisciplineOrderByWithRelationInput | DisciplineOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Disciplines.
     */
    cursor?: DisciplineWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Disciplines from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Disciplines.
     */
    skip?: number
    distinct?: DisciplineScalarFieldEnum | DisciplineScalarFieldEnum[]
  }

  /**
   * Discipline create
   */
  export type DisciplineCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DisciplineInclude<ExtArgs> | null
    /**
     * The data needed to create a Discipline.
     */
    data: XOR<DisciplineCreateInput, DisciplineUncheckedCreateInput>
  }

  /**
   * Discipline createMany
   */
  export type DisciplineCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Disciplines.
     */
    data: DisciplineCreateManyInput | DisciplineCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Discipline createManyAndReturn
   */
  export type DisciplineCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * The data used to create many Disciplines.
     */
    data: DisciplineCreateManyInput | DisciplineCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Discipline update
   */
  export type DisciplineUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DisciplineInclude<ExtArgs> | null
    /**
     * The data needed to update a Discipline.
     */
    data: XOR<DisciplineUpdateInput, DisciplineUncheckedUpdateInput>
    /**
     * Choose, which Discipline to update.
     */
    where: DisciplineWhereUniqueInput
  }

  /**
   * Discipline updateMany
   */
  export type DisciplineUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Disciplines.
     */
    data: XOR<DisciplineUpdateManyMutationInput, DisciplineUncheckedUpdateManyInput>
    /**
     * Filter which Disciplines to update
     */
    where?: DisciplineWhereInput
    /**
     * Limit how many Disciplines to update.
     */
    limit?: number
  }

  /**
   * Discipline updateManyAndReturn
   */
  export type DisciplineUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * The data used to update Disciplines.
     */
    data: XOR<DisciplineUpdateManyMutationInput, DisciplineUncheckedUpdateManyInput>
    /**
     * Filter which Disciplines to update
     */
    where?: DisciplineWhereInput
    /**
     * Limit how many Disciplines to update.
     */
    limit?: number
  }

  /**
   * Discipline upsert
   */
  export type DisciplineUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DisciplineInclude<ExtArgs> | null
    /**
     * The filter to search for the Discipline to update in case it exists.
     */
    where: DisciplineWhereUniqueInput
    /**
     * In case the Discipline found by the `where` argument doesn't exist, create a new Discipline with this data.
     */
    create: XOR<DisciplineCreateInput, DisciplineUncheckedCreateInput>
    /**
     * In case the Discipline was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DisciplineUpdateInput, DisciplineUncheckedUpdateInput>
  }

  /**
   * Discipline delete
   */
  export type DisciplineDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DisciplineInclude<ExtArgs> | null
    /**
     * Filter which Discipline to delete.
     */
    where: DisciplineWhereUniqueInput
  }

  /**
   * Discipline deleteMany
   */
  export type DisciplineDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Disciplines to delete
     */
    where?: DisciplineWhereInput
    /**
     * Limit how many Disciplines to delete.
     */
    limit?: number
  }

  /**
   * Discipline.classes
   */
  export type Discipline$classesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
    where?: ClassSessionWhereInput
    orderBy?: ClassSessionOrderByWithRelationInput | ClassSessionOrderByWithRelationInput[]
    cursor?: ClassSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClassSessionScalarFieldEnum | ClassSessionScalarFieldEnum[]
  }

  /**
   * Discipline without action
   */
  export type DisciplineDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Discipline
     */
    select?: DisciplineSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Discipline
     */
    omit?: DisciplineOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DisciplineInclude<ExtArgs> | null
  }


  /**
   * Model Instructor
   */

  export type AggregateInstructor = {
    _count: InstructorCountAggregateOutputType | null
    _min: InstructorMinAggregateOutputType | null
    _max: InstructorMaxAggregateOutputType | null
  }

  export type InstructorMinAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    phone: string | null
    role: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InstructorMaxAggregateOutputType = {
    id: string | null
    firstName: string | null
    lastName: string | null
    email: string | null
    phone: string | null
    role: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InstructorCountAggregateOutputType = {
    id: number
    firstName: number
    lastName: number
    email: number
    phone: number
    role: number
    isActive: number
    createdAt: number
    updatedAt: number
    profile: number
    _all: number
  }


  export type InstructorMinAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    phone?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InstructorMaxAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    phone?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InstructorCountAggregateInputType = {
    id?: true
    firstName?: true
    lastName?: true
    email?: true
    phone?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    profile?: true
    _all?: true
  }

  export type InstructorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Instructor to aggregate.
     */
    where?: InstructorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Instructors to fetch.
     */
    orderBy?: InstructorOrderByWithRelationInput | InstructorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InstructorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Instructors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Instructors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Instructors
    **/
    _count?: true | InstructorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InstructorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InstructorMaxAggregateInputType
  }

  export type GetInstructorAggregateType<T extends InstructorAggregateArgs> = {
        [P in keyof T & keyof AggregateInstructor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInstructor[P]>
      : GetScalarType<T[P], AggregateInstructor[P]>
  }




  export type InstructorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InstructorWhereInput
    orderBy?: InstructorOrderByWithAggregationInput | InstructorOrderByWithAggregationInput[]
    by: InstructorScalarFieldEnum[] | InstructorScalarFieldEnum
    having?: InstructorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InstructorCountAggregateInputType | true
    _min?: InstructorMinAggregateInputType
    _max?: InstructorMaxAggregateInputType
  }

  export type InstructorGroupByOutputType = {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    role: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    profile: JsonValue | null
    _count: InstructorCountAggregateOutputType | null
    _min: InstructorMinAggregateOutputType | null
    _max: InstructorMaxAggregateOutputType | null
  }

  type GetInstructorGroupByPayload<T extends InstructorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InstructorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InstructorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InstructorGroupByOutputType[P]>
            : GetScalarType<T[P], InstructorGroupByOutputType[P]>
        }
      >
    >


  export type InstructorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    phone?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    profile?: boolean
    classes?: boolean | Instructor$classesArgs<ExtArgs>
    _count?: boolean | InstructorCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["instructor"]>

  export type InstructorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    phone?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    profile?: boolean
  }, ExtArgs["result"]["instructor"]>

  export type InstructorSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    phone?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    profile?: boolean
  }, ExtArgs["result"]["instructor"]>

  export type InstructorSelectScalar = {
    id?: boolean
    firstName?: boolean
    lastName?: boolean
    email?: boolean
    phone?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    profile?: boolean
  }

  export type InstructorOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "firstName" | "lastName" | "email" | "phone" | "role" | "isActive" | "createdAt" | "updatedAt" | "profile", ExtArgs["result"]["instructor"]>
  export type InstructorInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    classes?: boolean | Instructor$classesArgs<ExtArgs>
    _count?: boolean | InstructorCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type InstructorIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type InstructorIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $InstructorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Instructor"
    objects: {
      classes: Prisma.$ClassSessionPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      firstName: string
      lastName: string
      email: string
      phone: string | null
      role: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
      profile: Prisma.JsonValue | null
    }, ExtArgs["result"]["instructor"]>
    composites: {}
  }

  type InstructorGetPayload<S extends boolean | null | undefined | InstructorDefaultArgs> = $Result.GetResult<Prisma.$InstructorPayload, S>

  type InstructorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InstructorFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InstructorCountAggregateInputType | true
    }

  export interface InstructorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Instructor'], meta: { name: 'Instructor' } }
    /**
     * Find zero or one Instructor that matches the filter.
     * @param {InstructorFindUniqueArgs} args - Arguments to find a Instructor
     * @example
     * // Get one Instructor
     * const instructor = await prisma.instructor.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InstructorFindUniqueArgs>(args: SelectSubset<T, InstructorFindUniqueArgs<ExtArgs>>): Prisma__InstructorClient<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Instructor that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InstructorFindUniqueOrThrowArgs} args - Arguments to find a Instructor
     * @example
     * // Get one Instructor
     * const instructor = await prisma.instructor.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InstructorFindUniqueOrThrowArgs>(args: SelectSubset<T, InstructorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InstructorClient<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Instructor that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InstructorFindFirstArgs} args - Arguments to find a Instructor
     * @example
     * // Get one Instructor
     * const instructor = await prisma.instructor.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InstructorFindFirstArgs>(args?: SelectSubset<T, InstructorFindFirstArgs<ExtArgs>>): Prisma__InstructorClient<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Instructor that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InstructorFindFirstOrThrowArgs} args - Arguments to find a Instructor
     * @example
     * // Get one Instructor
     * const instructor = await prisma.instructor.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InstructorFindFirstOrThrowArgs>(args?: SelectSubset<T, InstructorFindFirstOrThrowArgs<ExtArgs>>): Prisma__InstructorClient<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Instructors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InstructorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Instructors
     * const instructors = await prisma.instructor.findMany()
     * 
     * // Get first 10 Instructors
     * const instructors = await prisma.instructor.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const instructorWithIdOnly = await prisma.instructor.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InstructorFindManyArgs>(args?: SelectSubset<T, InstructorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Instructor.
     * @param {InstructorCreateArgs} args - Arguments to create a Instructor.
     * @example
     * // Create one Instructor
     * const Instructor = await prisma.instructor.create({
     *   data: {
     *     // ... data to create a Instructor
     *   }
     * })
     * 
     */
    create<T extends InstructorCreateArgs>(args: SelectSubset<T, InstructorCreateArgs<ExtArgs>>): Prisma__InstructorClient<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Instructors.
     * @param {InstructorCreateManyArgs} args - Arguments to create many Instructors.
     * @example
     * // Create many Instructors
     * const instructor = await prisma.instructor.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InstructorCreateManyArgs>(args?: SelectSubset<T, InstructorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Instructors and returns the data saved in the database.
     * @param {InstructorCreateManyAndReturnArgs} args - Arguments to create many Instructors.
     * @example
     * // Create many Instructors
     * const instructor = await prisma.instructor.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Instructors and only return the `id`
     * const instructorWithIdOnly = await prisma.instructor.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InstructorCreateManyAndReturnArgs>(args?: SelectSubset<T, InstructorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Instructor.
     * @param {InstructorDeleteArgs} args - Arguments to delete one Instructor.
     * @example
     * // Delete one Instructor
     * const Instructor = await prisma.instructor.delete({
     *   where: {
     *     // ... filter to delete one Instructor
     *   }
     * })
     * 
     */
    delete<T extends InstructorDeleteArgs>(args: SelectSubset<T, InstructorDeleteArgs<ExtArgs>>): Prisma__InstructorClient<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Instructor.
     * @param {InstructorUpdateArgs} args - Arguments to update one Instructor.
     * @example
     * // Update one Instructor
     * const instructor = await prisma.instructor.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InstructorUpdateArgs>(args: SelectSubset<T, InstructorUpdateArgs<ExtArgs>>): Prisma__InstructorClient<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Instructors.
     * @param {InstructorDeleteManyArgs} args - Arguments to filter Instructors to delete.
     * @example
     * // Delete a few Instructors
     * const { count } = await prisma.instructor.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InstructorDeleteManyArgs>(args?: SelectSubset<T, InstructorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Instructors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InstructorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Instructors
     * const instructor = await prisma.instructor.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InstructorUpdateManyArgs>(args: SelectSubset<T, InstructorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Instructors and returns the data updated in the database.
     * @param {InstructorUpdateManyAndReturnArgs} args - Arguments to update many Instructors.
     * @example
     * // Update many Instructors
     * const instructor = await prisma.instructor.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Instructors and only return the `id`
     * const instructorWithIdOnly = await prisma.instructor.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InstructorUpdateManyAndReturnArgs>(args: SelectSubset<T, InstructorUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Instructor.
     * @param {InstructorUpsertArgs} args - Arguments to update or create a Instructor.
     * @example
     * // Update or create a Instructor
     * const instructor = await prisma.instructor.upsert({
     *   create: {
     *     // ... data to create a Instructor
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Instructor we want to update
     *   }
     * })
     */
    upsert<T extends InstructorUpsertArgs>(args: SelectSubset<T, InstructorUpsertArgs<ExtArgs>>): Prisma__InstructorClient<$Result.GetResult<Prisma.$InstructorPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Instructors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InstructorCountArgs} args - Arguments to filter Instructors to count.
     * @example
     * // Count the number of Instructors
     * const count = await prisma.instructor.count({
     *   where: {
     *     // ... the filter for the Instructors we want to count
     *   }
     * })
    **/
    count<T extends InstructorCountArgs>(
      args?: Subset<T, InstructorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InstructorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Instructor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InstructorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InstructorAggregateArgs>(args: Subset<T, InstructorAggregateArgs>): Prisma.PrismaPromise<GetInstructorAggregateType<T>>

    /**
     * Group by Instructor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InstructorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InstructorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InstructorGroupByArgs['orderBy'] }
        : { orderBy?: InstructorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InstructorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInstructorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Instructor model
   */
  readonly fields: InstructorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Instructor.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InstructorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    classes<T extends Instructor$classesArgs<ExtArgs> = {}>(args?: Subset<T, Instructor$classesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Instructor model
   */
  interface InstructorFieldRefs {
    readonly id: FieldRef<"Instructor", 'String'>
    readonly firstName: FieldRef<"Instructor", 'String'>
    readonly lastName: FieldRef<"Instructor", 'String'>
    readonly email: FieldRef<"Instructor", 'String'>
    readonly phone: FieldRef<"Instructor", 'String'>
    readonly role: FieldRef<"Instructor", 'String'>
    readonly isActive: FieldRef<"Instructor", 'Boolean'>
    readonly createdAt: FieldRef<"Instructor", 'DateTime'>
    readonly updatedAt: FieldRef<"Instructor", 'DateTime'>
    readonly profile: FieldRef<"Instructor", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * Instructor findUnique
   */
  export type InstructorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InstructorInclude<ExtArgs> | null
    /**
     * Filter, which Instructor to fetch.
     */
    where: InstructorWhereUniqueInput
  }

  /**
   * Instructor findUniqueOrThrow
   */
  export type InstructorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InstructorInclude<ExtArgs> | null
    /**
     * Filter, which Instructor to fetch.
     */
    where: InstructorWhereUniqueInput
  }

  /**
   * Instructor findFirst
   */
  export type InstructorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InstructorInclude<ExtArgs> | null
    /**
     * Filter, which Instructor to fetch.
     */
    where?: InstructorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Instructors to fetch.
     */
    orderBy?: InstructorOrderByWithRelationInput | InstructorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Instructors.
     */
    cursor?: InstructorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Instructors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Instructors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Instructors.
     */
    distinct?: InstructorScalarFieldEnum | InstructorScalarFieldEnum[]
  }

  /**
   * Instructor findFirstOrThrow
   */
  export type InstructorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InstructorInclude<ExtArgs> | null
    /**
     * Filter, which Instructor to fetch.
     */
    where?: InstructorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Instructors to fetch.
     */
    orderBy?: InstructorOrderByWithRelationInput | InstructorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Instructors.
     */
    cursor?: InstructorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Instructors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Instructors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Instructors.
     */
    distinct?: InstructorScalarFieldEnum | InstructorScalarFieldEnum[]
  }

  /**
   * Instructor findMany
   */
  export type InstructorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InstructorInclude<ExtArgs> | null
    /**
     * Filter, which Instructors to fetch.
     */
    where?: InstructorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Instructors to fetch.
     */
    orderBy?: InstructorOrderByWithRelationInput | InstructorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Instructors.
     */
    cursor?: InstructorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Instructors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Instructors.
     */
    skip?: number
    distinct?: InstructorScalarFieldEnum | InstructorScalarFieldEnum[]
  }

  /**
   * Instructor create
   */
  export type InstructorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InstructorInclude<ExtArgs> | null
    /**
     * The data needed to create a Instructor.
     */
    data: XOR<InstructorCreateInput, InstructorUncheckedCreateInput>
  }

  /**
   * Instructor createMany
   */
  export type InstructorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Instructors.
     */
    data: InstructorCreateManyInput | InstructorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Instructor createManyAndReturn
   */
  export type InstructorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * The data used to create many Instructors.
     */
    data: InstructorCreateManyInput | InstructorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Instructor update
   */
  export type InstructorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InstructorInclude<ExtArgs> | null
    /**
     * The data needed to update a Instructor.
     */
    data: XOR<InstructorUpdateInput, InstructorUncheckedUpdateInput>
    /**
     * Choose, which Instructor to update.
     */
    where: InstructorWhereUniqueInput
  }

  /**
   * Instructor updateMany
   */
  export type InstructorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Instructors.
     */
    data: XOR<InstructorUpdateManyMutationInput, InstructorUncheckedUpdateManyInput>
    /**
     * Filter which Instructors to update
     */
    where?: InstructorWhereInput
    /**
     * Limit how many Instructors to update.
     */
    limit?: number
  }

  /**
   * Instructor updateManyAndReturn
   */
  export type InstructorUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * The data used to update Instructors.
     */
    data: XOR<InstructorUpdateManyMutationInput, InstructorUncheckedUpdateManyInput>
    /**
     * Filter which Instructors to update
     */
    where?: InstructorWhereInput
    /**
     * Limit how many Instructors to update.
     */
    limit?: number
  }

  /**
   * Instructor upsert
   */
  export type InstructorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InstructorInclude<ExtArgs> | null
    /**
     * The filter to search for the Instructor to update in case it exists.
     */
    where: InstructorWhereUniqueInput
    /**
     * In case the Instructor found by the `where` argument doesn't exist, create a new Instructor with this data.
     */
    create: XOR<InstructorCreateInput, InstructorUncheckedCreateInput>
    /**
     * In case the Instructor was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InstructorUpdateInput, InstructorUncheckedUpdateInput>
  }

  /**
   * Instructor delete
   */
  export type InstructorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InstructorInclude<ExtArgs> | null
    /**
     * Filter which Instructor to delete.
     */
    where: InstructorWhereUniqueInput
  }

  /**
   * Instructor deleteMany
   */
  export type InstructorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Instructors to delete
     */
    where?: InstructorWhereInput
    /**
     * Limit how many Instructors to delete.
     */
    limit?: number
  }

  /**
   * Instructor.classes
   */
  export type Instructor$classesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassSession
     */
    select?: ClassSessionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassSession
     */
    omit?: ClassSessionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassSessionInclude<ExtArgs> | null
    where?: ClassSessionWhereInput
    orderBy?: ClassSessionOrderByWithRelationInput | ClassSessionOrderByWithRelationInput[]
    cursor?: ClassSessionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ClassSessionScalarFieldEnum | ClassSessionScalarFieldEnum[]
  }

  /**
   * Instructor without action
   */
  export type InstructorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Instructor
     */
    select?: InstructorSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Instructor
     */
    omit?: InstructorOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: InstructorInclude<ExtArgs> | null
  }


  /**
   * Model MembershipPlan
   */

  export type AggregateMembershipPlan = {
    _count: MembershipPlanCountAggregateOutputType | null
    _avg: MembershipPlanAvgAggregateOutputType | null
    _sum: MembershipPlanSumAggregateOutputType | null
    _min: MembershipPlanMinAggregateOutputType | null
    _max: MembershipPlanMaxAggregateOutputType | null
  }

  export type MembershipPlanAvgAggregateOutputType = {
    price: number | null
    duration: number | null
  }

  export type MembershipPlanSumAggregateOutputType = {
    price: number | null
    duration: number | null
  }

  export type MembershipPlanMinAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    price: number | null
    duration: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MembershipPlanMaxAggregateOutputType = {
    id: string | null
    name: string | null
    description: string | null
    price: number | null
    duration: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MembershipPlanCountAggregateOutputType = {
    id: number
    name: number
    description: number
    price: number
    duration: number
    isActive: number
    createdAt: number
    updatedAt: number
    features: number
    config: number
    _all: number
  }


  export type MembershipPlanAvgAggregateInputType = {
    price?: true
    duration?: true
  }

  export type MembershipPlanSumAggregateInputType = {
    price?: true
    duration?: true
  }

  export type MembershipPlanMinAggregateInputType = {
    id?: true
    name?: true
    description?: true
    price?: true
    duration?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MembershipPlanMaxAggregateInputType = {
    id?: true
    name?: true
    description?: true
    price?: true
    duration?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MembershipPlanCountAggregateInputType = {
    id?: true
    name?: true
    description?: true
    price?: true
    duration?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    features?: true
    config?: true
    _all?: true
  }

  export type MembershipPlanAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MembershipPlan to aggregate.
     */
    where?: MembershipPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipPlans to fetch.
     */
    orderBy?: MembershipPlanOrderByWithRelationInput | MembershipPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MembershipPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MembershipPlans
    **/
    _count?: true | MembershipPlanCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MembershipPlanAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MembershipPlanSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MembershipPlanMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MembershipPlanMaxAggregateInputType
  }

  export type GetMembershipPlanAggregateType<T extends MembershipPlanAggregateArgs> = {
        [P in keyof T & keyof AggregateMembershipPlan]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMembershipPlan[P]>
      : GetScalarType<T[P], AggregateMembershipPlan[P]>
  }




  export type MembershipPlanGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MembershipPlanWhereInput
    orderBy?: MembershipPlanOrderByWithAggregationInput | MembershipPlanOrderByWithAggregationInput[]
    by: MembershipPlanScalarFieldEnum[] | MembershipPlanScalarFieldEnum
    having?: MembershipPlanScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MembershipPlanCountAggregateInputType | true
    _avg?: MembershipPlanAvgAggregateInputType
    _sum?: MembershipPlanSumAggregateInputType
    _min?: MembershipPlanMinAggregateInputType
    _max?: MembershipPlanMaxAggregateInputType
  }

  export type MembershipPlanGroupByOutputType = {
    id: string
    name: string
    description: string | null
    price: number
    duration: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    features: JsonValue | null
    config: JsonValue | null
    _count: MembershipPlanCountAggregateOutputType | null
    _avg: MembershipPlanAvgAggregateOutputType | null
    _sum: MembershipPlanSumAggregateOutputType | null
    _min: MembershipPlanMinAggregateOutputType | null
    _max: MembershipPlanMaxAggregateOutputType | null
  }

  type GetMembershipPlanGroupByPayload<T extends MembershipPlanGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MembershipPlanGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MembershipPlanGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MembershipPlanGroupByOutputType[P]>
            : GetScalarType<T[P], MembershipPlanGroupByOutputType[P]>
        }
      >
    >


  export type MembershipPlanSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    duration?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    features?: boolean
    config?: boolean
  }, ExtArgs["result"]["membershipPlan"]>

  export type MembershipPlanSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    duration?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    features?: boolean
    config?: boolean
  }, ExtArgs["result"]["membershipPlan"]>

  export type MembershipPlanSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    duration?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    features?: boolean
    config?: boolean
  }, ExtArgs["result"]["membershipPlan"]>

  export type MembershipPlanSelectScalar = {
    id?: boolean
    name?: boolean
    description?: boolean
    price?: boolean
    duration?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    features?: boolean
    config?: boolean
  }

  export type MembershipPlanOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "description" | "price" | "duration" | "isActive" | "createdAt" | "updatedAt" | "features" | "config", ExtArgs["result"]["membershipPlan"]>

  export type $MembershipPlanPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MembershipPlan"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      description: string | null
      price: number
      duration: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
      features: Prisma.JsonValue | null
      config: Prisma.JsonValue | null
    }, ExtArgs["result"]["membershipPlan"]>
    composites: {}
  }

  type MembershipPlanGetPayload<S extends boolean | null | undefined | MembershipPlanDefaultArgs> = $Result.GetResult<Prisma.$MembershipPlanPayload, S>

  type MembershipPlanCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MembershipPlanFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MembershipPlanCountAggregateInputType | true
    }

  export interface MembershipPlanDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MembershipPlan'], meta: { name: 'MembershipPlan' } }
    /**
     * Find zero or one MembershipPlan that matches the filter.
     * @param {MembershipPlanFindUniqueArgs} args - Arguments to find a MembershipPlan
     * @example
     * // Get one MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MembershipPlanFindUniqueArgs>(args: SelectSubset<T, MembershipPlanFindUniqueArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MembershipPlan that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MembershipPlanFindUniqueOrThrowArgs} args - Arguments to find a MembershipPlan
     * @example
     * // Get one MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MembershipPlanFindUniqueOrThrowArgs>(args: SelectSubset<T, MembershipPlanFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MembershipPlan that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanFindFirstArgs} args - Arguments to find a MembershipPlan
     * @example
     * // Get one MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MembershipPlanFindFirstArgs>(args?: SelectSubset<T, MembershipPlanFindFirstArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MembershipPlan that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanFindFirstOrThrowArgs} args - Arguments to find a MembershipPlan
     * @example
     * // Get one MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MembershipPlanFindFirstOrThrowArgs>(args?: SelectSubset<T, MembershipPlanFindFirstOrThrowArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MembershipPlans that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MembershipPlans
     * const membershipPlans = await prisma.membershipPlan.findMany()
     * 
     * // Get first 10 MembershipPlans
     * const membershipPlans = await prisma.membershipPlan.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const membershipPlanWithIdOnly = await prisma.membershipPlan.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MembershipPlanFindManyArgs>(args?: SelectSubset<T, MembershipPlanFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MembershipPlan.
     * @param {MembershipPlanCreateArgs} args - Arguments to create a MembershipPlan.
     * @example
     * // Create one MembershipPlan
     * const MembershipPlan = await prisma.membershipPlan.create({
     *   data: {
     *     // ... data to create a MembershipPlan
     *   }
     * })
     * 
     */
    create<T extends MembershipPlanCreateArgs>(args: SelectSubset<T, MembershipPlanCreateArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MembershipPlans.
     * @param {MembershipPlanCreateManyArgs} args - Arguments to create many MembershipPlans.
     * @example
     * // Create many MembershipPlans
     * const membershipPlan = await prisma.membershipPlan.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MembershipPlanCreateManyArgs>(args?: SelectSubset<T, MembershipPlanCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MembershipPlans and returns the data saved in the database.
     * @param {MembershipPlanCreateManyAndReturnArgs} args - Arguments to create many MembershipPlans.
     * @example
     * // Create many MembershipPlans
     * const membershipPlan = await prisma.membershipPlan.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MembershipPlans and only return the `id`
     * const membershipPlanWithIdOnly = await prisma.membershipPlan.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MembershipPlanCreateManyAndReturnArgs>(args?: SelectSubset<T, MembershipPlanCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MembershipPlan.
     * @param {MembershipPlanDeleteArgs} args - Arguments to delete one MembershipPlan.
     * @example
     * // Delete one MembershipPlan
     * const MembershipPlan = await prisma.membershipPlan.delete({
     *   where: {
     *     // ... filter to delete one MembershipPlan
     *   }
     * })
     * 
     */
    delete<T extends MembershipPlanDeleteArgs>(args: SelectSubset<T, MembershipPlanDeleteArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MembershipPlan.
     * @param {MembershipPlanUpdateArgs} args - Arguments to update one MembershipPlan.
     * @example
     * // Update one MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MembershipPlanUpdateArgs>(args: SelectSubset<T, MembershipPlanUpdateArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MembershipPlans.
     * @param {MembershipPlanDeleteManyArgs} args - Arguments to filter MembershipPlans to delete.
     * @example
     * // Delete a few MembershipPlans
     * const { count } = await prisma.membershipPlan.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MembershipPlanDeleteManyArgs>(args?: SelectSubset<T, MembershipPlanDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MembershipPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MembershipPlans
     * const membershipPlan = await prisma.membershipPlan.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MembershipPlanUpdateManyArgs>(args: SelectSubset<T, MembershipPlanUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MembershipPlans and returns the data updated in the database.
     * @param {MembershipPlanUpdateManyAndReturnArgs} args - Arguments to update many MembershipPlans.
     * @example
     * // Update many MembershipPlans
     * const membershipPlan = await prisma.membershipPlan.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MembershipPlans and only return the `id`
     * const membershipPlanWithIdOnly = await prisma.membershipPlan.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MembershipPlanUpdateManyAndReturnArgs>(args: SelectSubset<T, MembershipPlanUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MembershipPlan.
     * @param {MembershipPlanUpsertArgs} args - Arguments to update or create a MembershipPlan.
     * @example
     * // Update or create a MembershipPlan
     * const membershipPlan = await prisma.membershipPlan.upsert({
     *   create: {
     *     // ... data to create a MembershipPlan
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MembershipPlan we want to update
     *   }
     * })
     */
    upsert<T extends MembershipPlanUpsertArgs>(args: SelectSubset<T, MembershipPlanUpsertArgs<ExtArgs>>): Prisma__MembershipPlanClient<$Result.GetResult<Prisma.$MembershipPlanPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MembershipPlans.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanCountArgs} args - Arguments to filter MembershipPlans to count.
     * @example
     * // Count the number of MembershipPlans
     * const count = await prisma.membershipPlan.count({
     *   where: {
     *     // ... the filter for the MembershipPlans we want to count
     *   }
     * })
    **/
    count<T extends MembershipPlanCountArgs>(
      args?: Subset<T, MembershipPlanCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MembershipPlanCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MembershipPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MembershipPlanAggregateArgs>(args: Subset<T, MembershipPlanAggregateArgs>): Prisma.PrismaPromise<GetMembershipPlanAggregateType<T>>

    /**
     * Group by MembershipPlan.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipPlanGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MembershipPlanGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MembershipPlanGroupByArgs['orderBy'] }
        : { orderBy?: MembershipPlanGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MembershipPlanGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMembershipPlanGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MembershipPlan model
   */
  readonly fields: MembershipPlanFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MembershipPlan.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MembershipPlanClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MembershipPlan model
   */
  interface MembershipPlanFieldRefs {
    readonly id: FieldRef<"MembershipPlan", 'String'>
    readonly name: FieldRef<"MembershipPlan", 'String'>
    readonly description: FieldRef<"MembershipPlan", 'String'>
    readonly price: FieldRef<"MembershipPlan", 'Float'>
    readonly duration: FieldRef<"MembershipPlan", 'Int'>
    readonly isActive: FieldRef<"MembershipPlan", 'Boolean'>
    readonly createdAt: FieldRef<"MembershipPlan", 'DateTime'>
    readonly updatedAt: FieldRef<"MembershipPlan", 'DateTime'>
    readonly features: FieldRef<"MembershipPlan", 'Json'>
    readonly config: FieldRef<"MembershipPlan", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * MembershipPlan findUnique
   */
  export type MembershipPlanFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Filter, which MembershipPlan to fetch.
     */
    where: MembershipPlanWhereUniqueInput
  }

  /**
   * MembershipPlan findUniqueOrThrow
   */
  export type MembershipPlanFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Filter, which MembershipPlan to fetch.
     */
    where: MembershipPlanWhereUniqueInput
  }

  /**
   * MembershipPlan findFirst
   */
  export type MembershipPlanFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Filter, which MembershipPlan to fetch.
     */
    where?: MembershipPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipPlans to fetch.
     */
    orderBy?: MembershipPlanOrderByWithRelationInput | MembershipPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MembershipPlans.
     */
    cursor?: MembershipPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MembershipPlans.
     */
    distinct?: MembershipPlanScalarFieldEnum | MembershipPlanScalarFieldEnum[]
  }

  /**
   * MembershipPlan findFirstOrThrow
   */
  export type MembershipPlanFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Filter, which MembershipPlan to fetch.
     */
    where?: MembershipPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipPlans to fetch.
     */
    orderBy?: MembershipPlanOrderByWithRelationInput | MembershipPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MembershipPlans.
     */
    cursor?: MembershipPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipPlans.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MembershipPlans.
     */
    distinct?: MembershipPlanScalarFieldEnum | MembershipPlanScalarFieldEnum[]
  }

  /**
   * MembershipPlan findMany
   */
  export type MembershipPlanFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Filter, which MembershipPlans to fetch.
     */
    where?: MembershipPlanWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipPlans to fetch.
     */
    orderBy?: MembershipPlanOrderByWithRelationInput | MembershipPlanOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MembershipPlans.
     */
    cursor?: MembershipPlanWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipPlans from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipPlans.
     */
    skip?: number
    distinct?: MembershipPlanScalarFieldEnum | MembershipPlanScalarFieldEnum[]
  }

  /**
   * MembershipPlan create
   */
  export type MembershipPlanCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * The data needed to create a MembershipPlan.
     */
    data: XOR<MembershipPlanCreateInput, MembershipPlanUncheckedCreateInput>
  }

  /**
   * MembershipPlan createMany
   */
  export type MembershipPlanCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MembershipPlans.
     */
    data: MembershipPlanCreateManyInput | MembershipPlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MembershipPlan createManyAndReturn
   */
  export type MembershipPlanCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * The data used to create many MembershipPlans.
     */
    data: MembershipPlanCreateManyInput | MembershipPlanCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MembershipPlan update
   */
  export type MembershipPlanUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * The data needed to update a MembershipPlan.
     */
    data: XOR<MembershipPlanUpdateInput, MembershipPlanUncheckedUpdateInput>
    /**
     * Choose, which MembershipPlan to update.
     */
    where: MembershipPlanWhereUniqueInput
  }

  /**
   * MembershipPlan updateMany
   */
  export type MembershipPlanUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MembershipPlans.
     */
    data: XOR<MembershipPlanUpdateManyMutationInput, MembershipPlanUncheckedUpdateManyInput>
    /**
     * Filter which MembershipPlans to update
     */
    where?: MembershipPlanWhereInput
    /**
     * Limit how many MembershipPlans to update.
     */
    limit?: number
  }

  /**
   * MembershipPlan updateManyAndReturn
   */
  export type MembershipPlanUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * The data used to update MembershipPlans.
     */
    data: XOR<MembershipPlanUpdateManyMutationInput, MembershipPlanUncheckedUpdateManyInput>
    /**
     * Filter which MembershipPlans to update
     */
    where?: MembershipPlanWhereInput
    /**
     * Limit how many MembershipPlans to update.
     */
    limit?: number
  }

  /**
   * MembershipPlan upsert
   */
  export type MembershipPlanUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * The filter to search for the MembershipPlan to update in case it exists.
     */
    where: MembershipPlanWhereUniqueInput
    /**
     * In case the MembershipPlan found by the `where` argument doesn't exist, create a new MembershipPlan with this data.
     */
    create: XOR<MembershipPlanCreateInput, MembershipPlanUncheckedCreateInput>
    /**
     * In case the MembershipPlan was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MembershipPlanUpdateInput, MembershipPlanUncheckedUpdateInput>
  }

  /**
   * MembershipPlan delete
   */
  export type MembershipPlanDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
    /**
     * Filter which MembershipPlan to delete.
     */
    where: MembershipPlanWhereUniqueInput
  }

  /**
   * MembershipPlan deleteMany
   */
  export type MembershipPlanDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MembershipPlans to delete
     */
    where?: MembershipPlanWhereInput
    /**
     * Limit how many MembershipPlans to delete.
     */
    limit?: number
  }

  /**
   * MembershipPlan without action
   */
  export type MembershipPlanDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipPlan
     */
    select?: MembershipPlanSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipPlan
     */
    omit?: MembershipPlanOmit<ExtArgs> | null
  }


  /**
   * Model Organization
   */

  export type AggregateOrganization = {
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  export type OrganizationMinAggregateOutputType = {
    id: string | null
    name: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganizationMaxAggregateOutputType = {
    id: string | null
    name: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrganizationCountAggregateOutputType = {
    id: number
    name: number
    settings: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrganizationMinAggregateInputType = {
    id?: true
    name?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganizationMaxAggregateInputType = {
    id?: true
    name?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrganizationCountAggregateInputType = {
    id?: true
    name?: true
    settings?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrganizationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organization to aggregate.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Organizations
    **/
    _count?: true | OrganizationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrganizationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrganizationMaxAggregateInputType
  }

  export type GetOrganizationAggregateType<T extends OrganizationAggregateArgs> = {
        [P in keyof T & keyof AggregateOrganization]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrganization[P]>
      : GetScalarType<T[P], AggregateOrganization[P]>
  }




  export type OrganizationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrganizationWhereInput
    orderBy?: OrganizationOrderByWithAggregationInput | OrganizationOrderByWithAggregationInput[]
    by: OrganizationScalarFieldEnum[] | OrganizationScalarFieldEnum
    having?: OrganizationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrganizationCountAggregateInputType | true
    _min?: OrganizationMinAggregateInputType
    _max?: OrganizationMaxAggregateInputType
  }

  export type OrganizationGroupByOutputType = {
    id: string
    name: string
    settings: JsonValue | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: OrganizationCountAggregateOutputType | null
    _min: OrganizationMinAggregateOutputType | null
    _max: OrganizationMaxAggregateOutputType | null
  }

  type GetOrganizationGroupByPayload<T extends OrganizationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrganizationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrganizationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
            : GetScalarType<T[P], OrganizationGroupByOutputType[P]>
        }
      >
    >


  export type OrganizationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    settings?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    settings?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    settings?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["organization"]>

  export type OrganizationSelectScalar = {
    id?: boolean
    name?: boolean
    settings?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrganizationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "settings" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["organization"]>

  export type $OrganizationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Organization"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      settings: Prisma.JsonValue | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["organization"]>
    composites: {}
  }

  type OrganizationGetPayload<S extends boolean | null | undefined | OrganizationDefaultArgs> = $Result.GetResult<Prisma.$OrganizationPayload, S>

  type OrganizationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrganizationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrganizationCountAggregateInputType | true
    }

  export interface OrganizationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Organization'], meta: { name: 'Organization' } }
    /**
     * Find zero or one Organization that matches the filter.
     * @param {OrganizationFindUniqueArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrganizationFindUniqueArgs>(args: SelectSubset<T, OrganizationFindUniqueArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Organization that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrganizationFindUniqueOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrganizationFindUniqueOrThrowArgs>(args: SelectSubset<T, OrganizationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrganizationFindFirstArgs>(args?: SelectSubset<T, OrganizationFindFirstArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Organization that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindFirstOrThrowArgs} args - Arguments to find a Organization
     * @example
     * // Get one Organization
     * const organization = await prisma.organization.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrganizationFindFirstOrThrowArgs>(args?: SelectSubset<T, OrganizationFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Organizations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Organizations
     * const organizations = await prisma.organization.findMany()
     * 
     * // Get first 10 Organizations
     * const organizations = await prisma.organization.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const organizationWithIdOnly = await prisma.organization.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrganizationFindManyArgs>(args?: SelectSubset<T, OrganizationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Organization.
     * @param {OrganizationCreateArgs} args - Arguments to create a Organization.
     * @example
     * // Create one Organization
     * const Organization = await prisma.organization.create({
     *   data: {
     *     // ... data to create a Organization
     *   }
     * })
     * 
     */
    create<T extends OrganizationCreateArgs>(args: SelectSubset<T, OrganizationCreateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Organizations.
     * @param {OrganizationCreateManyArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrganizationCreateManyArgs>(args?: SelectSubset<T, OrganizationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Organizations and returns the data saved in the database.
     * @param {OrganizationCreateManyAndReturnArgs} args - Arguments to create many Organizations.
     * @example
     * // Create many Organizations
     * const organization = await prisma.organization.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrganizationCreateManyAndReturnArgs>(args?: SelectSubset<T, OrganizationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Organization.
     * @param {OrganizationDeleteArgs} args - Arguments to delete one Organization.
     * @example
     * // Delete one Organization
     * const Organization = await prisma.organization.delete({
     *   where: {
     *     // ... filter to delete one Organization
     *   }
     * })
     * 
     */
    delete<T extends OrganizationDeleteArgs>(args: SelectSubset<T, OrganizationDeleteArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Organization.
     * @param {OrganizationUpdateArgs} args - Arguments to update one Organization.
     * @example
     * // Update one Organization
     * const organization = await prisma.organization.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrganizationUpdateArgs>(args: SelectSubset<T, OrganizationUpdateArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Organizations.
     * @param {OrganizationDeleteManyArgs} args - Arguments to filter Organizations to delete.
     * @example
     * // Delete a few Organizations
     * const { count } = await prisma.organization.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrganizationDeleteManyArgs>(args?: SelectSubset<T, OrganizationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrganizationUpdateManyArgs>(args: SelectSubset<T, OrganizationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Organizations and returns the data updated in the database.
     * @param {OrganizationUpdateManyAndReturnArgs} args - Arguments to update many Organizations.
     * @example
     * // Update many Organizations
     * const organization = await prisma.organization.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Organizations and only return the `id`
     * const organizationWithIdOnly = await prisma.organization.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrganizationUpdateManyAndReturnArgs>(args: SelectSubset<T, OrganizationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Organization.
     * @param {OrganizationUpsertArgs} args - Arguments to update or create a Organization.
     * @example
     * // Update or create a Organization
     * const organization = await prisma.organization.upsert({
     *   create: {
     *     // ... data to create a Organization
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Organization we want to update
     *   }
     * })
     */
    upsert<T extends OrganizationUpsertArgs>(args: SelectSubset<T, OrganizationUpsertArgs<ExtArgs>>): Prisma__OrganizationClient<$Result.GetResult<Prisma.$OrganizationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Organizations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationCountArgs} args - Arguments to filter Organizations to count.
     * @example
     * // Count the number of Organizations
     * const count = await prisma.organization.count({
     *   where: {
     *     // ... the filter for the Organizations we want to count
     *   }
     * })
    **/
    count<T extends OrganizationCountArgs>(
      args?: Subset<T, OrganizationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrganizationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends OrganizationAggregateArgs>(args: Subset<T, OrganizationAggregateArgs>): Prisma.PrismaPromise<GetOrganizationAggregateType<T>>

    /**
     * Group by Organization.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrganizationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends OrganizationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrganizationGroupByArgs['orderBy'] }
        : { orderBy?: OrganizationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, OrganizationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrganizationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Organization model
   */
  readonly fields: OrganizationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Organization.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrganizationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Organization model
   */
  interface OrganizationFieldRefs {
    readonly id: FieldRef<"Organization", 'String'>
    readonly name: FieldRef<"Organization", 'String'>
    readonly settings: FieldRef<"Organization", 'Json'>
    readonly isActive: FieldRef<"Organization", 'Boolean'>
    readonly createdAt: FieldRef<"Organization", 'DateTime'>
    readonly updatedAt: FieldRef<"Organization", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Organization findUnique
   */
  export type OrganizationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findUniqueOrThrow
   */
  export type OrganizationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization findFirst
   */
  export type OrganizationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findFirstOrThrow
   */
  export type OrganizationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Filter, which Organization to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Organizations.
     */
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization findMany
   */
  export type OrganizationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Filter, which Organizations to fetch.
     */
    where?: OrganizationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Organizations to fetch.
     */
    orderBy?: OrganizationOrderByWithRelationInput | OrganizationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Organizations.
     */
    cursor?: OrganizationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Organizations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Organizations.
     */
    skip?: number
    distinct?: OrganizationScalarFieldEnum | OrganizationScalarFieldEnum[]
  }

  /**
   * Organization create
   */
  export type OrganizationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data needed to create a Organization.
     */
    data: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
  }

  /**
   * Organization createMany
   */
  export type OrganizationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization createManyAndReturn
   */
  export type OrganizationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to create many Organizations.
     */
    data: OrganizationCreateManyInput | OrganizationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Organization update
   */
  export type OrganizationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data needed to update a Organization.
     */
    data: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
    /**
     * Choose, which Organization to update.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization updateMany
   */
  export type OrganizationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization updateManyAndReturn
   */
  export type OrganizationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The data used to update Organizations.
     */
    data: XOR<OrganizationUpdateManyMutationInput, OrganizationUncheckedUpdateManyInput>
    /**
     * Filter which Organizations to update
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to update.
     */
    limit?: number
  }

  /**
   * Organization upsert
   */
  export type OrganizationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * The filter to search for the Organization to update in case it exists.
     */
    where: OrganizationWhereUniqueInput
    /**
     * In case the Organization found by the `where` argument doesn't exist, create a new Organization with this data.
     */
    create: XOR<OrganizationCreateInput, OrganizationUncheckedCreateInput>
    /**
     * In case the Organization was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrganizationUpdateInput, OrganizationUncheckedUpdateInput>
  }

  /**
   * Organization delete
   */
  export type OrganizationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
    /**
     * Filter which Organization to delete.
     */
    where: OrganizationWhereUniqueInput
  }

  /**
   * Organization deleteMany
   */
  export type OrganizationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Organizations to delete
     */
    where?: OrganizationWhereInput
    /**
     * Limit how many Organizations to delete.
     */
    limit?: number
  }

  /**
   * Organization without action
   */
  export type OrganizationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Organization
     */
    select?: OrganizationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Organization
     */
    omit?: OrganizationOmit<ExtArgs> | null
  }


  /**
   * Model ClassRegistration
   */

  export type AggregateClassRegistration = {
    _count: ClassRegistrationCountAggregateOutputType | null
    _min: ClassRegistrationMinAggregateOutputType | null
    _max: ClassRegistrationMaxAggregateOutputType | null
  }

  export type ClassRegistrationMinAggregateOutputType = {
    id: string | null
    userId: string | null
    classId: string | null
    status: string | null
    registeredAt: Date | null
    cancelledAt: Date | null
    notes: string | null
  }

  export type ClassRegistrationMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    classId: string | null
    status: string | null
    registeredAt: Date | null
    cancelledAt: Date | null
    notes: string | null
  }

  export type ClassRegistrationCountAggregateOutputType = {
    id: number
    userId: number
    classId: number
    status: number
    registeredAt: number
    cancelledAt: number
    notes: number
    _all: number
  }


  export type ClassRegistrationMinAggregateInputType = {
    id?: true
    userId?: true
    classId?: true
    status?: true
    registeredAt?: true
    cancelledAt?: true
    notes?: true
  }

  export type ClassRegistrationMaxAggregateInputType = {
    id?: true
    userId?: true
    classId?: true
    status?: true
    registeredAt?: true
    cancelledAt?: true
    notes?: true
  }

  export type ClassRegistrationCountAggregateInputType = {
    id?: true
    userId?: true
    classId?: true
    status?: true
    registeredAt?: true
    cancelledAt?: true
    notes?: true
    _all?: true
  }

  export type ClassRegistrationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClassRegistration to aggregate.
     */
    where?: ClassRegistrationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClassRegistrations to fetch.
     */
    orderBy?: ClassRegistrationOrderByWithRelationInput | ClassRegistrationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ClassRegistrationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClassRegistrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClassRegistrations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ClassRegistrations
    **/
    _count?: true | ClassRegistrationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ClassRegistrationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ClassRegistrationMaxAggregateInputType
  }

  export type GetClassRegistrationAggregateType<T extends ClassRegistrationAggregateArgs> = {
        [P in keyof T & keyof AggregateClassRegistration]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateClassRegistration[P]>
      : GetScalarType<T[P], AggregateClassRegistration[P]>
  }




  export type ClassRegistrationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ClassRegistrationWhereInput
    orderBy?: ClassRegistrationOrderByWithAggregationInput | ClassRegistrationOrderByWithAggregationInput[]
    by: ClassRegistrationScalarFieldEnum[] | ClassRegistrationScalarFieldEnum
    having?: ClassRegistrationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ClassRegistrationCountAggregateInputType | true
    _min?: ClassRegistrationMinAggregateInputType
    _max?: ClassRegistrationMaxAggregateInputType
  }

  export type ClassRegistrationGroupByOutputType = {
    id: string
    userId: string
    classId: string
    status: string
    registeredAt: Date
    cancelledAt: Date | null
    notes: string | null
    _count: ClassRegistrationCountAggregateOutputType | null
    _min: ClassRegistrationMinAggregateOutputType | null
    _max: ClassRegistrationMaxAggregateOutputType | null
  }

  type GetClassRegistrationGroupByPayload<T extends ClassRegistrationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ClassRegistrationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ClassRegistrationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ClassRegistrationGroupByOutputType[P]>
            : GetScalarType<T[P], ClassRegistrationGroupByOutputType[P]>
        }
      >
    >


  export type ClassRegistrationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    classId?: boolean
    status?: boolean
    registeredAt?: boolean
    cancelledAt?: boolean
    notes?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    class?: boolean | ClassSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["classRegistration"]>

  export type ClassRegistrationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    classId?: boolean
    status?: boolean
    registeredAt?: boolean
    cancelledAt?: boolean
    notes?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    class?: boolean | ClassSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["classRegistration"]>

  export type ClassRegistrationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    classId?: boolean
    status?: boolean
    registeredAt?: boolean
    cancelledAt?: boolean
    notes?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    class?: boolean | ClassSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["classRegistration"]>

  export type ClassRegistrationSelectScalar = {
    id?: boolean
    userId?: boolean
    classId?: boolean
    status?: boolean
    registeredAt?: boolean
    cancelledAt?: boolean
    notes?: boolean
  }

  export type ClassRegistrationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "classId" | "status" | "registeredAt" | "cancelledAt" | "notes", ExtArgs["result"]["classRegistration"]>
  export type ClassRegistrationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    class?: boolean | ClassSessionDefaultArgs<ExtArgs>
  }
  export type ClassRegistrationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    class?: boolean | ClassSessionDefaultArgs<ExtArgs>
  }
  export type ClassRegistrationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    class?: boolean | ClassSessionDefaultArgs<ExtArgs>
  }

  export type $ClassRegistrationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ClassRegistration"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      class: Prisma.$ClassSessionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      classId: string
      status: string
      registeredAt: Date
      cancelledAt: Date | null
      notes: string | null
    }, ExtArgs["result"]["classRegistration"]>
    composites: {}
  }

  type ClassRegistrationGetPayload<S extends boolean | null | undefined | ClassRegistrationDefaultArgs> = $Result.GetResult<Prisma.$ClassRegistrationPayload, S>

  type ClassRegistrationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ClassRegistrationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ClassRegistrationCountAggregateInputType | true
    }

  export interface ClassRegistrationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ClassRegistration'], meta: { name: 'ClassRegistration' } }
    /**
     * Find zero or one ClassRegistration that matches the filter.
     * @param {ClassRegistrationFindUniqueArgs} args - Arguments to find a ClassRegistration
     * @example
     * // Get one ClassRegistration
     * const classRegistration = await prisma.classRegistration.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ClassRegistrationFindUniqueArgs>(args: SelectSubset<T, ClassRegistrationFindUniqueArgs<ExtArgs>>): Prisma__ClassRegistrationClient<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ClassRegistration that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ClassRegistrationFindUniqueOrThrowArgs} args - Arguments to find a ClassRegistration
     * @example
     * // Get one ClassRegistration
     * const classRegistration = await prisma.classRegistration.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ClassRegistrationFindUniqueOrThrowArgs>(args: SelectSubset<T, ClassRegistrationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ClassRegistrationClient<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClassRegistration that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassRegistrationFindFirstArgs} args - Arguments to find a ClassRegistration
     * @example
     * // Get one ClassRegistration
     * const classRegistration = await prisma.classRegistration.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ClassRegistrationFindFirstArgs>(args?: SelectSubset<T, ClassRegistrationFindFirstArgs<ExtArgs>>): Prisma__ClassRegistrationClient<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ClassRegistration that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassRegistrationFindFirstOrThrowArgs} args - Arguments to find a ClassRegistration
     * @example
     * // Get one ClassRegistration
     * const classRegistration = await prisma.classRegistration.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ClassRegistrationFindFirstOrThrowArgs>(args?: SelectSubset<T, ClassRegistrationFindFirstOrThrowArgs<ExtArgs>>): Prisma__ClassRegistrationClient<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ClassRegistrations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassRegistrationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ClassRegistrations
     * const classRegistrations = await prisma.classRegistration.findMany()
     * 
     * // Get first 10 ClassRegistrations
     * const classRegistrations = await prisma.classRegistration.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const classRegistrationWithIdOnly = await prisma.classRegistration.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ClassRegistrationFindManyArgs>(args?: SelectSubset<T, ClassRegistrationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ClassRegistration.
     * @param {ClassRegistrationCreateArgs} args - Arguments to create a ClassRegistration.
     * @example
     * // Create one ClassRegistration
     * const ClassRegistration = await prisma.classRegistration.create({
     *   data: {
     *     // ... data to create a ClassRegistration
     *   }
     * })
     * 
     */
    create<T extends ClassRegistrationCreateArgs>(args: SelectSubset<T, ClassRegistrationCreateArgs<ExtArgs>>): Prisma__ClassRegistrationClient<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ClassRegistrations.
     * @param {ClassRegistrationCreateManyArgs} args - Arguments to create many ClassRegistrations.
     * @example
     * // Create many ClassRegistrations
     * const classRegistration = await prisma.classRegistration.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ClassRegistrationCreateManyArgs>(args?: SelectSubset<T, ClassRegistrationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ClassRegistrations and returns the data saved in the database.
     * @param {ClassRegistrationCreateManyAndReturnArgs} args - Arguments to create many ClassRegistrations.
     * @example
     * // Create many ClassRegistrations
     * const classRegistration = await prisma.classRegistration.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ClassRegistrations and only return the `id`
     * const classRegistrationWithIdOnly = await prisma.classRegistration.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ClassRegistrationCreateManyAndReturnArgs>(args?: SelectSubset<T, ClassRegistrationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ClassRegistration.
     * @param {ClassRegistrationDeleteArgs} args - Arguments to delete one ClassRegistration.
     * @example
     * // Delete one ClassRegistration
     * const ClassRegistration = await prisma.classRegistration.delete({
     *   where: {
     *     // ... filter to delete one ClassRegistration
     *   }
     * })
     * 
     */
    delete<T extends ClassRegistrationDeleteArgs>(args: SelectSubset<T, ClassRegistrationDeleteArgs<ExtArgs>>): Prisma__ClassRegistrationClient<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ClassRegistration.
     * @param {ClassRegistrationUpdateArgs} args - Arguments to update one ClassRegistration.
     * @example
     * // Update one ClassRegistration
     * const classRegistration = await prisma.classRegistration.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ClassRegistrationUpdateArgs>(args: SelectSubset<T, ClassRegistrationUpdateArgs<ExtArgs>>): Prisma__ClassRegistrationClient<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ClassRegistrations.
     * @param {ClassRegistrationDeleteManyArgs} args - Arguments to filter ClassRegistrations to delete.
     * @example
     * // Delete a few ClassRegistrations
     * const { count } = await prisma.classRegistration.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ClassRegistrationDeleteManyArgs>(args?: SelectSubset<T, ClassRegistrationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClassRegistrations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassRegistrationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ClassRegistrations
     * const classRegistration = await prisma.classRegistration.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ClassRegistrationUpdateManyArgs>(args: SelectSubset<T, ClassRegistrationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ClassRegistrations and returns the data updated in the database.
     * @param {ClassRegistrationUpdateManyAndReturnArgs} args - Arguments to update many ClassRegistrations.
     * @example
     * // Update many ClassRegistrations
     * const classRegistration = await prisma.classRegistration.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ClassRegistrations and only return the `id`
     * const classRegistrationWithIdOnly = await prisma.classRegistration.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ClassRegistrationUpdateManyAndReturnArgs>(args: SelectSubset<T, ClassRegistrationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ClassRegistration.
     * @param {ClassRegistrationUpsertArgs} args - Arguments to update or create a ClassRegistration.
     * @example
     * // Update or create a ClassRegistration
     * const classRegistration = await prisma.classRegistration.upsert({
     *   create: {
     *     // ... data to create a ClassRegistration
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ClassRegistration we want to update
     *   }
     * })
     */
    upsert<T extends ClassRegistrationUpsertArgs>(args: SelectSubset<T, ClassRegistrationUpsertArgs<ExtArgs>>): Prisma__ClassRegistrationClient<$Result.GetResult<Prisma.$ClassRegistrationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ClassRegistrations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassRegistrationCountArgs} args - Arguments to filter ClassRegistrations to count.
     * @example
     * // Count the number of ClassRegistrations
     * const count = await prisma.classRegistration.count({
     *   where: {
     *     // ... the filter for the ClassRegistrations we want to count
     *   }
     * })
    **/
    count<T extends ClassRegistrationCountArgs>(
      args?: Subset<T, ClassRegistrationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ClassRegistrationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ClassRegistration.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassRegistrationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ClassRegistrationAggregateArgs>(args: Subset<T, ClassRegistrationAggregateArgs>): Prisma.PrismaPromise<GetClassRegistrationAggregateType<T>>

    /**
     * Group by ClassRegistration.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ClassRegistrationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ClassRegistrationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ClassRegistrationGroupByArgs['orderBy'] }
        : { orderBy?: ClassRegistrationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ClassRegistrationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetClassRegistrationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ClassRegistration model
   */
  readonly fields: ClassRegistrationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ClassRegistration.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ClassRegistrationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    class<T extends ClassSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ClassSessionDefaultArgs<ExtArgs>>): Prisma__ClassSessionClient<$Result.GetResult<Prisma.$ClassSessionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ClassRegistration model
   */
  interface ClassRegistrationFieldRefs {
    readonly id: FieldRef<"ClassRegistration", 'String'>
    readonly userId: FieldRef<"ClassRegistration", 'String'>
    readonly classId: FieldRef<"ClassRegistration", 'String'>
    readonly status: FieldRef<"ClassRegistration", 'String'>
    readonly registeredAt: FieldRef<"ClassRegistration", 'DateTime'>
    readonly cancelledAt: FieldRef<"ClassRegistration", 'DateTime'>
    readonly notes: FieldRef<"ClassRegistration", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ClassRegistration findUnique
   */
  export type ClassRegistrationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
    /**
     * Filter, which ClassRegistration to fetch.
     */
    where: ClassRegistrationWhereUniqueInput
  }

  /**
   * ClassRegistration findUniqueOrThrow
   */
  export type ClassRegistrationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
    /**
     * Filter, which ClassRegistration to fetch.
     */
    where: ClassRegistrationWhereUniqueInput
  }

  /**
   * ClassRegistration findFirst
   */
  export type ClassRegistrationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
    /**
     * Filter, which ClassRegistration to fetch.
     */
    where?: ClassRegistrationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClassRegistrations to fetch.
     */
    orderBy?: ClassRegistrationOrderByWithRelationInput | ClassRegistrationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClassRegistrations.
     */
    cursor?: ClassRegistrationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClassRegistrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClassRegistrations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClassRegistrations.
     */
    distinct?: ClassRegistrationScalarFieldEnum | ClassRegistrationScalarFieldEnum[]
  }

  /**
   * ClassRegistration findFirstOrThrow
   */
  export type ClassRegistrationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
    /**
     * Filter, which ClassRegistration to fetch.
     */
    where?: ClassRegistrationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClassRegistrations to fetch.
     */
    orderBy?: ClassRegistrationOrderByWithRelationInput | ClassRegistrationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ClassRegistrations.
     */
    cursor?: ClassRegistrationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClassRegistrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClassRegistrations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ClassRegistrations.
     */
    distinct?: ClassRegistrationScalarFieldEnum | ClassRegistrationScalarFieldEnum[]
  }

  /**
   * ClassRegistration findMany
   */
  export type ClassRegistrationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
    /**
     * Filter, which ClassRegistrations to fetch.
     */
    where?: ClassRegistrationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ClassRegistrations to fetch.
     */
    orderBy?: ClassRegistrationOrderByWithRelationInput | ClassRegistrationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ClassRegistrations.
     */
    cursor?: ClassRegistrationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ClassRegistrations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ClassRegistrations.
     */
    skip?: number
    distinct?: ClassRegistrationScalarFieldEnum | ClassRegistrationScalarFieldEnum[]
  }

  /**
   * ClassRegistration create
   */
  export type ClassRegistrationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
    /**
     * The data needed to create a ClassRegistration.
     */
    data: XOR<ClassRegistrationCreateInput, ClassRegistrationUncheckedCreateInput>
  }

  /**
   * ClassRegistration createMany
   */
  export type ClassRegistrationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ClassRegistrations.
     */
    data: ClassRegistrationCreateManyInput | ClassRegistrationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ClassRegistration createManyAndReturn
   */
  export type ClassRegistrationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * The data used to create many ClassRegistrations.
     */
    data: ClassRegistrationCreateManyInput | ClassRegistrationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClassRegistration update
   */
  export type ClassRegistrationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
    /**
     * The data needed to update a ClassRegistration.
     */
    data: XOR<ClassRegistrationUpdateInput, ClassRegistrationUncheckedUpdateInput>
    /**
     * Choose, which ClassRegistration to update.
     */
    where: ClassRegistrationWhereUniqueInput
  }

  /**
   * ClassRegistration updateMany
   */
  export type ClassRegistrationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ClassRegistrations.
     */
    data: XOR<ClassRegistrationUpdateManyMutationInput, ClassRegistrationUncheckedUpdateManyInput>
    /**
     * Filter which ClassRegistrations to update
     */
    where?: ClassRegistrationWhereInput
    /**
     * Limit how many ClassRegistrations to update.
     */
    limit?: number
  }

  /**
   * ClassRegistration updateManyAndReturn
   */
  export type ClassRegistrationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * The data used to update ClassRegistrations.
     */
    data: XOR<ClassRegistrationUpdateManyMutationInput, ClassRegistrationUncheckedUpdateManyInput>
    /**
     * Filter which ClassRegistrations to update
     */
    where?: ClassRegistrationWhereInput
    /**
     * Limit how many ClassRegistrations to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ClassRegistration upsert
   */
  export type ClassRegistrationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
    /**
     * The filter to search for the ClassRegistration to update in case it exists.
     */
    where: ClassRegistrationWhereUniqueInput
    /**
     * In case the ClassRegistration found by the `where` argument doesn't exist, create a new ClassRegistration with this data.
     */
    create: XOR<ClassRegistrationCreateInput, ClassRegistrationUncheckedCreateInput>
    /**
     * In case the ClassRegistration was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ClassRegistrationUpdateInput, ClassRegistrationUncheckedUpdateInput>
  }

  /**
   * ClassRegistration delete
   */
  export type ClassRegistrationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
    /**
     * Filter which ClassRegistration to delete.
     */
    where: ClassRegistrationWhereUniqueInput
  }

  /**
   * ClassRegistration deleteMany
   */
  export type ClassRegistrationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ClassRegistrations to delete
     */
    where?: ClassRegistrationWhereInput
    /**
     * Limit how many ClassRegistrations to delete.
     */
    limit?: number
  }

  /**
   * ClassRegistration without action
   */
  export type ClassRegistrationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ClassRegistration
     */
    select?: ClassRegistrationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ClassRegistration
     */
    omit?: ClassRegistrationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ClassRegistrationInclude<ExtArgs> | null
  }


  /**
   * Model MembershipRenewal
   */

  export type AggregateMembershipRenewal = {
    _count: MembershipRenewalCountAggregateOutputType | null
    _min: MembershipRenewalMinAggregateOutputType | null
    _max: MembershipRenewalMaxAggregateOutputType | null
  }

  export type MembershipRenewalMinAggregateOutputType = {
    id: string | null
    userId: string | null
    currentPlanId: string | null
    requestedPlanId: string | null
    status: string | null
    requestedAt: Date | null
    processedAt: Date | null
    notes: string | null
  }

  export type MembershipRenewalMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    currentPlanId: string | null
    requestedPlanId: string | null
    status: string | null
    requestedAt: Date | null
    processedAt: Date | null
    notes: string | null
  }

  export type MembershipRenewalCountAggregateOutputType = {
    id: number
    userId: number
    currentPlanId: number
    requestedPlanId: number
    status: number
    requestedAt: number
    processedAt: number
    notes: number
    renewalDetails: number
    _all: number
  }


  export type MembershipRenewalMinAggregateInputType = {
    id?: true
    userId?: true
    currentPlanId?: true
    requestedPlanId?: true
    status?: true
    requestedAt?: true
    processedAt?: true
    notes?: true
  }

  export type MembershipRenewalMaxAggregateInputType = {
    id?: true
    userId?: true
    currentPlanId?: true
    requestedPlanId?: true
    status?: true
    requestedAt?: true
    processedAt?: true
    notes?: true
  }

  export type MembershipRenewalCountAggregateInputType = {
    id?: true
    userId?: true
    currentPlanId?: true
    requestedPlanId?: true
    status?: true
    requestedAt?: true
    processedAt?: true
    notes?: true
    renewalDetails?: true
    _all?: true
  }

  export type MembershipRenewalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MembershipRenewal to aggregate.
     */
    where?: MembershipRenewalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipRenewals to fetch.
     */
    orderBy?: MembershipRenewalOrderByWithRelationInput | MembershipRenewalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MembershipRenewalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipRenewals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipRenewals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MembershipRenewals
    **/
    _count?: true | MembershipRenewalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MembershipRenewalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MembershipRenewalMaxAggregateInputType
  }

  export type GetMembershipRenewalAggregateType<T extends MembershipRenewalAggregateArgs> = {
        [P in keyof T & keyof AggregateMembershipRenewal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMembershipRenewal[P]>
      : GetScalarType<T[P], AggregateMembershipRenewal[P]>
  }




  export type MembershipRenewalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MembershipRenewalWhereInput
    orderBy?: MembershipRenewalOrderByWithAggregationInput | MembershipRenewalOrderByWithAggregationInput[]
    by: MembershipRenewalScalarFieldEnum[] | MembershipRenewalScalarFieldEnum
    having?: MembershipRenewalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MembershipRenewalCountAggregateInputType | true
    _min?: MembershipRenewalMinAggregateInputType
    _max?: MembershipRenewalMaxAggregateInputType
  }

  export type MembershipRenewalGroupByOutputType = {
    id: string
    userId: string
    currentPlanId: string | null
    requestedPlanId: string | null
    status: string
    requestedAt: Date
    processedAt: Date | null
    notes: string | null
    renewalDetails: JsonValue | null
    _count: MembershipRenewalCountAggregateOutputType | null
    _min: MembershipRenewalMinAggregateOutputType | null
    _max: MembershipRenewalMaxAggregateOutputType | null
  }

  type GetMembershipRenewalGroupByPayload<T extends MembershipRenewalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MembershipRenewalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MembershipRenewalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MembershipRenewalGroupByOutputType[P]>
            : GetScalarType<T[P], MembershipRenewalGroupByOutputType[P]>
        }
      >
    >


  export type MembershipRenewalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    currentPlanId?: boolean
    requestedPlanId?: boolean
    status?: boolean
    requestedAt?: boolean
    processedAt?: boolean
    notes?: boolean
    renewalDetails?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["membershipRenewal"]>

  export type MembershipRenewalSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    currentPlanId?: boolean
    requestedPlanId?: boolean
    status?: boolean
    requestedAt?: boolean
    processedAt?: boolean
    notes?: boolean
    renewalDetails?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["membershipRenewal"]>

  export type MembershipRenewalSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    currentPlanId?: boolean
    requestedPlanId?: boolean
    status?: boolean
    requestedAt?: boolean
    processedAt?: boolean
    notes?: boolean
    renewalDetails?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["membershipRenewal"]>

  export type MembershipRenewalSelectScalar = {
    id?: boolean
    userId?: boolean
    currentPlanId?: boolean
    requestedPlanId?: boolean
    status?: boolean
    requestedAt?: boolean
    processedAt?: boolean
    notes?: boolean
    renewalDetails?: boolean
  }

  export type MembershipRenewalOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "currentPlanId" | "requestedPlanId" | "status" | "requestedAt" | "processedAt" | "notes" | "renewalDetails", ExtArgs["result"]["membershipRenewal"]>
  export type MembershipRenewalInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MembershipRenewalIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type MembershipRenewalIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $MembershipRenewalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MembershipRenewal"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      currentPlanId: string | null
      requestedPlanId: string | null
      status: string
      requestedAt: Date
      processedAt: Date | null
      notes: string | null
      renewalDetails: Prisma.JsonValue | null
    }, ExtArgs["result"]["membershipRenewal"]>
    composites: {}
  }

  type MembershipRenewalGetPayload<S extends boolean | null | undefined | MembershipRenewalDefaultArgs> = $Result.GetResult<Prisma.$MembershipRenewalPayload, S>

  type MembershipRenewalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MembershipRenewalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MembershipRenewalCountAggregateInputType | true
    }

  export interface MembershipRenewalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MembershipRenewal'], meta: { name: 'MembershipRenewal' } }
    /**
     * Find zero or one MembershipRenewal that matches the filter.
     * @param {MembershipRenewalFindUniqueArgs} args - Arguments to find a MembershipRenewal
     * @example
     * // Get one MembershipRenewal
     * const membershipRenewal = await prisma.membershipRenewal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MembershipRenewalFindUniqueArgs>(args: SelectSubset<T, MembershipRenewalFindUniqueArgs<ExtArgs>>): Prisma__MembershipRenewalClient<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MembershipRenewal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MembershipRenewalFindUniqueOrThrowArgs} args - Arguments to find a MembershipRenewal
     * @example
     * // Get one MembershipRenewal
     * const membershipRenewal = await prisma.membershipRenewal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MembershipRenewalFindUniqueOrThrowArgs>(args: SelectSubset<T, MembershipRenewalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MembershipRenewalClient<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MembershipRenewal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipRenewalFindFirstArgs} args - Arguments to find a MembershipRenewal
     * @example
     * // Get one MembershipRenewal
     * const membershipRenewal = await prisma.membershipRenewal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MembershipRenewalFindFirstArgs>(args?: SelectSubset<T, MembershipRenewalFindFirstArgs<ExtArgs>>): Prisma__MembershipRenewalClient<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MembershipRenewal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipRenewalFindFirstOrThrowArgs} args - Arguments to find a MembershipRenewal
     * @example
     * // Get one MembershipRenewal
     * const membershipRenewal = await prisma.membershipRenewal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MembershipRenewalFindFirstOrThrowArgs>(args?: SelectSubset<T, MembershipRenewalFindFirstOrThrowArgs<ExtArgs>>): Prisma__MembershipRenewalClient<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MembershipRenewals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipRenewalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MembershipRenewals
     * const membershipRenewals = await prisma.membershipRenewal.findMany()
     * 
     * // Get first 10 MembershipRenewals
     * const membershipRenewals = await prisma.membershipRenewal.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const membershipRenewalWithIdOnly = await prisma.membershipRenewal.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MembershipRenewalFindManyArgs>(args?: SelectSubset<T, MembershipRenewalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MembershipRenewal.
     * @param {MembershipRenewalCreateArgs} args - Arguments to create a MembershipRenewal.
     * @example
     * // Create one MembershipRenewal
     * const MembershipRenewal = await prisma.membershipRenewal.create({
     *   data: {
     *     // ... data to create a MembershipRenewal
     *   }
     * })
     * 
     */
    create<T extends MembershipRenewalCreateArgs>(args: SelectSubset<T, MembershipRenewalCreateArgs<ExtArgs>>): Prisma__MembershipRenewalClient<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MembershipRenewals.
     * @param {MembershipRenewalCreateManyArgs} args - Arguments to create many MembershipRenewals.
     * @example
     * // Create many MembershipRenewals
     * const membershipRenewal = await prisma.membershipRenewal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MembershipRenewalCreateManyArgs>(args?: SelectSubset<T, MembershipRenewalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MembershipRenewals and returns the data saved in the database.
     * @param {MembershipRenewalCreateManyAndReturnArgs} args - Arguments to create many MembershipRenewals.
     * @example
     * // Create many MembershipRenewals
     * const membershipRenewal = await prisma.membershipRenewal.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MembershipRenewals and only return the `id`
     * const membershipRenewalWithIdOnly = await prisma.membershipRenewal.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MembershipRenewalCreateManyAndReturnArgs>(args?: SelectSubset<T, MembershipRenewalCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MembershipRenewal.
     * @param {MembershipRenewalDeleteArgs} args - Arguments to delete one MembershipRenewal.
     * @example
     * // Delete one MembershipRenewal
     * const MembershipRenewal = await prisma.membershipRenewal.delete({
     *   where: {
     *     // ... filter to delete one MembershipRenewal
     *   }
     * })
     * 
     */
    delete<T extends MembershipRenewalDeleteArgs>(args: SelectSubset<T, MembershipRenewalDeleteArgs<ExtArgs>>): Prisma__MembershipRenewalClient<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MembershipRenewal.
     * @param {MembershipRenewalUpdateArgs} args - Arguments to update one MembershipRenewal.
     * @example
     * // Update one MembershipRenewal
     * const membershipRenewal = await prisma.membershipRenewal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MembershipRenewalUpdateArgs>(args: SelectSubset<T, MembershipRenewalUpdateArgs<ExtArgs>>): Prisma__MembershipRenewalClient<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MembershipRenewals.
     * @param {MembershipRenewalDeleteManyArgs} args - Arguments to filter MembershipRenewals to delete.
     * @example
     * // Delete a few MembershipRenewals
     * const { count } = await prisma.membershipRenewal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MembershipRenewalDeleteManyArgs>(args?: SelectSubset<T, MembershipRenewalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MembershipRenewals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipRenewalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MembershipRenewals
     * const membershipRenewal = await prisma.membershipRenewal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MembershipRenewalUpdateManyArgs>(args: SelectSubset<T, MembershipRenewalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MembershipRenewals and returns the data updated in the database.
     * @param {MembershipRenewalUpdateManyAndReturnArgs} args - Arguments to update many MembershipRenewals.
     * @example
     * // Update many MembershipRenewals
     * const membershipRenewal = await prisma.membershipRenewal.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MembershipRenewals and only return the `id`
     * const membershipRenewalWithIdOnly = await prisma.membershipRenewal.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MembershipRenewalUpdateManyAndReturnArgs>(args: SelectSubset<T, MembershipRenewalUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MembershipRenewal.
     * @param {MembershipRenewalUpsertArgs} args - Arguments to update or create a MembershipRenewal.
     * @example
     * // Update or create a MembershipRenewal
     * const membershipRenewal = await prisma.membershipRenewal.upsert({
     *   create: {
     *     // ... data to create a MembershipRenewal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MembershipRenewal we want to update
     *   }
     * })
     */
    upsert<T extends MembershipRenewalUpsertArgs>(args: SelectSubset<T, MembershipRenewalUpsertArgs<ExtArgs>>): Prisma__MembershipRenewalClient<$Result.GetResult<Prisma.$MembershipRenewalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MembershipRenewals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipRenewalCountArgs} args - Arguments to filter MembershipRenewals to count.
     * @example
     * // Count the number of MembershipRenewals
     * const count = await prisma.membershipRenewal.count({
     *   where: {
     *     // ... the filter for the MembershipRenewals we want to count
     *   }
     * })
    **/
    count<T extends MembershipRenewalCountArgs>(
      args?: Subset<T, MembershipRenewalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MembershipRenewalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MembershipRenewal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipRenewalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MembershipRenewalAggregateArgs>(args: Subset<T, MembershipRenewalAggregateArgs>): Prisma.PrismaPromise<GetMembershipRenewalAggregateType<T>>

    /**
     * Group by MembershipRenewal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MembershipRenewalGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MembershipRenewalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MembershipRenewalGroupByArgs['orderBy'] }
        : { orderBy?: MembershipRenewalGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MembershipRenewalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMembershipRenewalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MembershipRenewal model
   */
  readonly fields: MembershipRenewalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MembershipRenewal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MembershipRenewalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MembershipRenewal model
   */
  interface MembershipRenewalFieldRefs {
    readonly id: FieldRef<"MembershipRenewal", 'String'>
    readonly userId: FieldRef<"MembershipRenewal", 'String'>
    readonly currentPlanId: FieldRef<"MembershipRenewal", 'String'>
    readonly requestedPlanId: FieldRef<"MembershipRenewal", 'String'>
    readonly status: FieldRef<"MembershipRenewal", 'String'>
    readonly requestedAt: FieldRef<"MembershipRenewal", 'DateTime'>
    readonly processedAt: FieldRef<"MembershipRenewal", 'DateTime'>
    readonly notes: FieldRef<"MembershipRenewal", 'String'>
    readonly renewalDetails: FieldRef<"MembershipRenewal", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * MembershipRenewal findUnique
   */
  export type MembershipRenewalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalInclude<ExtArgs> | null
    /**
     * Filter, which MembershipRenewal to fetch.
     */
    where: MembershipRenewalWhereUniqueInput
  }

  /**
   * MembershipRenewal findUniqueOrThrow
   */
  export type MembershipRenewalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalInclude<ExtArgs> | null
    /**
     * Filter, which MembershipRenewal to fetch.
     */
    where: MembershipRenewalWhereUniqueInput
  }

  /**
   * MembershipRenewal findFirst
   */
  export type MembershipRenewalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalInclude<ExtArgs> | null
    /**
     * Filter, which MembershipRenewal to fetch.
     */
    where?: MembershipRenewalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipRenewals to fetch.
     */
    orderBy?: MembershipRenewalOrderByWithRelationInput | MembershipRenewalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MembershipRenewals.
     */
    cursor?: MembershipRenewalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipRenewals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipRenewals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MembershipRenewals.
     */
    distinct?: MembershipRenewalScalarFieldEnum | MembershipRenewalScalarFieldEnum[]
  }

  /**
   * MembershipRenewal findFirstOrThrow
   */
  export type MembershipRenewalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalInclude<ExtArgs> | null
    /**
     * Filter, which MembershipRenewal to fetch.
     */
    where?: MembershipRenewalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipRenewals to fetch.
     */
    orderBy?: MembershipRenewalOrderByWithRelationInput | MembershipRenewalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MembershipRenewals.
     */
    cursor?: MembershipRenewalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipRenewals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipRenewals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MembershipRenewals.
     */
    distinct?: MembershipRenewalScalarFieldEnum | MembershipRenewalScalarFieldEnum[]
  }

  /**
   * MembershipRenewal findMany
   */
  export type MembershipRenewalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalInclude<ExtArgs> | null
    /**
     * Filter, which MembershipRenewals to fetch.
     */
    where?: MembershipRenewalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MembershipRenewals to fetch.
     */
    orderBy?: MembershipRenewalOrderByWithRelationInput | MembershipRenewalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MembershipRenewals.
     */
    cursor?: MembershipRenewalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MembershipRenewals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MembershipRenewals.
     */
    skip?: number
    distinct?: MembershipRenewalScalarFieldEnum | MembershipRenewalScalarFieldEnum[]
  }

  /**
   * MembershipRenewal create
   */
  export type MembershipRenewalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalInclude<ExtArgs> | null
    /**
     * The data needed to create a MembershipRenewal.
     */
    data: XOR<MembershipRenewalCreateInput, MembershipRenewalUncheckedCreateInput>
  }

  /**
   * MembershipRenewal createMany
   */
  export type MembershipRenewalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MembershipRenewals.
     */
    data: MembershipRenewalCreateManyInput | MembershipRenewalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MembershipRenewal createManyAndReturn
   */
  export type MembershipRenewalCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * The data used to create many MembershipRenewals.
     */
    data: MembershipRenewalCreateManyInput | MembershipRenewalCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * MembershipRenewal update
   */
  export type MembershipRenewalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalInclude<ExtArgs> | null
    /**
     * The data needed to update a MembershipRenewal.
     */
    data: XOR<MembershipRenewalUpdateInput, MembershipRenewalUncheckedUpdateInput>
    /**
     * Choose, which MembershipRenewal to update.
     */
    where: MembershipRenewalWhereUniqueInput
  }

  /**
   * MembershipRenewal updateMany
   */
  export type MembershipRenewalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MembershipRenewals.
     */
    data: XOR<MembershipRenewalUpdateManyMutationInput, MembershipRenewalUncheckedUpdateManyInput>
    /**
     * Filter which MembershipRenewals to update
     */
    where?: MembershipRenewalWhereInput
    /**
     * Limit how many MembershipRenewals to update.
     */
    limit?: number
  }

  /**
   * MembershipRenewal updateManyAndReturn
   */
  export type MembershipRenewalUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * The data used to update MembershipRenewals.
     */
    data: XOR<MembershipRenewalUpdateManyMutationInput, MembershipRenewalUncheckedUpdateManyInput>
    /**
     * Filter which MembershipRenewals to update
     */
    where?: MembershipRenewalWhereInput
    /**
     * Limit how many MembershipRenewals to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * MembershipRenewal upsert
   */
  export type MembershipRenewalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalInclude<ExtArgs> | null
    /**
     * The filter to search for the MembershipRenewal to update in case it exists.
     */
    where: MembershipRenewalWhereUniqueInput
    /**
     * In case the MembershipRenewal found by the `where` argument doesn't exist, create a new MembershipRenewal with this data.
     */
    create: XOR<MembershipRenewalCreateInput, MembershipRenewalUncheckedCreateInput>
    /**
     * In case the MembershipRenewal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MembershipRenewalUpdateInput, MembershipRenewalUncheckedUpdateInput>
  }

  /**
   * MembershipRenewal delete
   */
  export type MembershipRenewalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalInclude<ExtArgs> | null
    /**
     * Filter which MembershipRenewal to delete.
     */
    where: MembershipRenewalWhereUniqueInput
  }

  /**
   * MembershipRenewal deleteMany
   */
  export type MembershipRenewalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MembershipRenewals to delete
     */
    where?: MembershipRenewalWhereInput
    /**
     * Limit how many MembershipRenewals to delete.
     */
    limit?: number
  }

  /**
   * MembershipRenewal without action
   */
  export type MembershipRenewalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MembershipRenewal
     */
    select?: MembershipRenewalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MembershipRenewal
     */
    omit?: MembershipRenewalOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: MembershipRenewalInclude<ExtArgs> | null
  }


  /**
   * Model SystemLog
   */

  export type AggregateSystemLog = {
    _count: SystemLogCountAggregateOutputType | null
    _min: SystemLogMinAggregateOutputType | null
    _max: SystemLogMaxAggregateOutputType | null
  }

  export type SystemLogMinAggregateOutputType = {
    id: string | null
    level: string | null
    message: string | null
    timestamp: Date | null
    operation: string | null
    resource: string | null
    userId: string | null
    sessionId: string | null
  }

  export type SystemLogMaxAggregateOutputType = {
    id: string | null
    level: string | null
    message: string | null
    timestamp: Date | null
    operation: string | null
    resource: string | null
    userId: string | null
    sessionId: string | null
  }

  export type SystemLogCountAggregateOutputType = {
    id: number
    level: number
    message: number
    context: number
    timestamp: number
    operation: number
    resource: number
    userId: number
    sessionId: number
    _all: number
  }


  export type SystemLogMinAggregateInputType = {
    id?: true
    level?: true
    message?: true
    timestamp?: true
    operation?: true
    resource?: true
    userId?: true
    sessionId?: true
  }

  export type SystemLogMaxAggregateInputType = {
    id?: true
    level?: true
    message?: true
    timestamp?: true
    operation?: true
    resource?: true
    userId?: true
    sessionId?: true
  }

  export type SystemLogCountAggregateInputType = {
    id?: true
    level?: true
    message?: true
    context?: true
    timestamp?: true
    operation?: true
    resource?: true
    userId?: true
    sessionId?: true
    _all?: true
  }

  export type SystemLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemLog to aggregate.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SystemLogs
    **/
    _count?: true | SystemLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SystemLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SystemLogMaxAggregateInputType
  }

  export type GetSystemLogAggregateType<T extends SystemLogAggregateArgs> = {
        [P in keyof T & keyof AggregateSystemLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSystemLog[P]>
      : GetScalarType<T[P], AggregateSystemLog[P]>
  }




  export type SystemLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SystemLogWhereInput
    orderBy?: SystemLogOrderByWithAggregationInput | SystemLogOrderByWithAggregationInput[]
    by: SystemLogScalarFieldEnum[] | SystemLogScalarFieldEnum
    having?: SystemLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SystemLogCountAggregateInputType | true
    _min?: SystemLogMinAggregateInputType
    _max?: SystemLogMaxAggregateInputType
  }

  export type SystemLogGroupByOutputType = {
    id: string
    level: string
    message: string
    context: JsonValue | null
    timestamp: Date
    operation: string | null
    resource: string | null
    userId: string | null
    sessionId: string | null
    _count: SystemLogCountAggregateOutputType | null
    _min: SystemLogMinAggregateOutputType | null
    _max: SystemLogMaxAggregateOutputType | null
  }

  type GetSystemLogGroupByPayload<T extends SystemLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SystemLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SystemLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SystemLogGroupByOutputType[P]>
            : GetScalarType<T[P], SystemLogGroupByOutputType[P]>
        }
      >
    >


  export type SystemLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    level?: boolean
    message?: boolean
    context?: boolean
    timestamp?: boolean
    operation?: boolean
    resource?: boolean
    userId?: boolean
    sessionId?: boolean
  }, ExtArgs["result"]["systemLog"]>

  export type SystemLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    level?: boolean
    message?: boolean
    context?: boolean
    timestamp?: boolean
    operation?: boolean
    resource?: boolean
    userId?: boolean
    sessionId?: boolean
  }, ExtArgs["result"]["systemLog"]>

  export type SystemLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    level?: boolean
    message?: boolean
    context?: boolean
    timestamp?: boolean
    operation?: boolean
    resource?: boolean
    userId?: boolean
    sessionId?: boolean
  }, ExtArgs["result"]["systemLog"]>

  export type SystemLogSelectScalar = {
    id?: boolean
    level?: boolean
    message?: boolean
    context?: boolean
    timestamp?: boolean
    operation?: boolean
    resource?: boolean
    userId?: boolean
    sessionId?: boolean
  }

  export type SystemLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "level" | "message" | "context" | "timestamp" | "operation" | "resource" | "userId" | "sessionId", ExtArgs["result"]["systemLog"]>

  export type $SystemLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SystemLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      level: string
      message: string
      context: Prisma.JsonValue | null
      timestamp: Date
      operation: string | null
      resource: string | null
      userId: string | null
      sessionId: string | null
    }, ExtArgs["result"]["systemLog"]>
    composites: {}
  }

  type SystemLogGetPayload<S extends boolean | null | undefined | SystemLogDefaultArgs> = $Result.GetResult<Prisma.$SystemLogPayload, S>

  type SystemLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SystemLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SystemLogCountAggregateInputType | true
    }

  export interface SystemLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SystemLog'], meta: { name: 'SystemLog' } }
    /**
     * Find zero or one SystemLog that matches the filter.
     * @param {SystemLogFindUniqueArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SystemLogFindUniqueArgs>(args: SelectSubset<T, SystemLogFindUniqueArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SystemLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SystemLogFindUniqueOrThrowArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SystemLogFindUniqueOrThrowArgs>(args: SelectSubset<T, SystemLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SystemLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogFindFirstArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SystemLogFindFirstArgs>(args?: SelectSubset<T, SystemLogFindFirstArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SystemLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogFindFirstOrThrowArgs} args - Arguments to find a SystemLog
     * @example
     * // Get one SystemLog
     * const systemLog = await prisma.systemLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SystemLogFindFirstOrThrowArgs>(args?: SelectSubset<T, SystemLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SystemLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SystemLogs
     * const systemLogs = await prisma.systemLog.findMany()
     * 
     * // Get first 10 SystemLogs
     * const systemLogs = await prisma.systemLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const systemLogWithIdOnly = await prisma.systemLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SystemLogFindManyArgs>(args?: SelectSubset<T, SystemLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SystemLog.
     * @param {SystemLogCreateArgs} args - Arguments to create a SystemLog.
     * @example
     * // Create one SystemLog
     * const SystemLog = await prisma.systemLog.create({
     *   data: {
     *     // ... data to create a SystemLog
     *   }
     * })
     * 
     */
    create<T extends SystemLogCreateArgs>(args: SelectSubset<T, SystemLogCreateArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SystemLogs.
     * @param {SystemLogCreateManyArgs} args - Arguments to create many SystemLogs.
     * @example
     * // Create many SystemLogs
     * const systemLog = await prisma.systemLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SystemLogCreateManyArgs>(args?: SelectSubset<T, SystemLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SystemLogs and returns the data saved in the database.
     * @param {SystemLogCreateManyAndReturnArgs} args - Arguments to create many SystemLogs.
     * @example
     * // Create many SystemLogs
     * const systemLog = await prisma.systemLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SystemLogs and only return the `id`
     * const systemLogWithIdOnly = await prisma.systemLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SystemLogCreateManyAndReturnArgs>(args?: SelectSubset<T, SystemLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SystemLog.
     * @param {SystemLogDeleteArgs} args - Arguments to delete one SystemLog.
     * @example
     * // Delete one SystemLog
     * const SystemLog = await prisma.systemLog.delete({
     *   where: {
     *     // ... filter to delete one SystemLog
     *   }
     * })
     * 
     */
    delete<T extends SystemLogDeleteArgs>(args: SelectSubset<T, SystemLogDeleteArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SystemLog.
     * @param {SystemLogUpdateArgs} args - Arguments to update one SystemLog.
     * @example
     * // Update one SystemLog
     * const systemLog = await prisma.systemLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SystemLogUpdateArgs>(args: SelectSubset<T, SystemLogUpdateArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SystemLogs.
     * @param {SystemLogDeleteManyArgs} args - Arguments to filter SystemLogs to delete.
     * @example
     * // Delete a few SystemLogs
     * const { count } = await prisma.systemLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SystemLogDeleteManyArgs>(args?: SelectSubset<T, SystemLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SystemLogs
     * const systemLog = await prisma.systemLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SystemLogUpdateManyArgs>(args: SelectSubset<T, SystemLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SystemLogs and returns the data updated in the database.
     * @param {SystemLogUpdateManyAndReturnArgs} args - Arguments to update many SystemLogs.
     * @example
     * // Update many SystemLogs
     * const systemLog = await prisma.systemLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SystemLogs and only return the `id`
     * const systemLogWithIdOnly = await prisma.systemLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SystemLogUpdateManyAndReturnArgs>(args: SelectSubset<T, SystemLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SystemLog.
     * @param {SystemLogUpsertArgs} args - Arguments to update or create a SystemLog.
     * @example
     * // Update or create a SystemLog
     * const systemLog = await prisma.systemLog.upsert({
     *   create: {
     *     // ... data to create a SystemLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SystemLog we want to update
     *   }
     * })
     */
    upsert<T extends SystemLogUpsertArgs>(args: SelectSubset<T, SystemLogUpsertArgs<ExtArgs>>): Prisma__SystemLogClient<$Result.GetResult<Prisma.$SystemLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SystemLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogCountArgs} args - Arguments to filter SystemLogs to count.
     * @example
     * // Count the number of SystemLogs
     * const count = await prisma.systemLog.count({
     *   where: {
     *     // ... the filter for the SystemLogs we want to count
     *   }
     * })
    **/
    count<T extends SystemLogCountArgs>(
      args?: Subset<T, SystemLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SystemLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SystemLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SystemLogAggregateArgs>(args: Subset<T, SystemLogAggregateArgs>): Prisma.PrismaPromise<GetSystemLogAggregateType<T>>

    /**
     * Group by SystemLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SystemLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SystemLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SystemLogGroupByArgs['orderBy'] }
        : { orderBy?: SystemLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SystemLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSystemLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SystemLog model
   */
  readonly fields: SystemLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SystemLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SystemLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SystemLog model
   */
  interface SystemLogFieldRefs {
    readonly id: FieldRef<"SystemLog", 'String'>
    readonly level: FieldRef<"SystemLog", 'String'>
    readonly message: FieldRef<"SystemLog", 'String'>
    readonly context: FieldRef<"SystemLog", 'Json'>
    readonly timestamp: FieldRef<"SystemLog", 'DateTime'>
    readonly operation: FieldRef<"SystemLog", 'String'>
    readonly resource: FieldRef<"SystemLog", 'String'>
    readonly userId: FieldRef<"SystemLog", 'String'>
    readonly sessionId: FieldRef<"SystemLog", 'String'>
  }
    

  // Custom InputTypes
  /**
   * SystemLog findUnique
   */
  export type SystemLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog findUniqueOrThrow
   */
  export type SystemLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog findFirst
   */
  export type SystemLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemLogs.
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemLogs.
     */
    distinct?: SystemLogScalarFieldEnum | SystemLogScalarFieldEnum[]
  }

  /**
   * SystemLog findFirstOrThrow
   */
  export type SystemLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter, which SystemLog to fetch.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SystemLogs.
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SystemLogs.
     */
    distinct?: SystemLogScalarFieldEnum | SystemLogScalarFieldEnum[]
  }

  /**
   * SystemLog findMany
   */
  export type SystemLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter, which SystemLogs to fetch.
     */
    where?: SystemLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SystemLogs to fetch.
     */
    orderBy?: SystemLogOrderByWithRelationInput | SystemLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SystemLogs.
     */
    cursor?: SystemLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SystemLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SystemLogs.
     */
    skip?: number
    distinct?: SystemLogScalarFieldEnum | SystemLogScalarFieldEnum[]
  }

  /**
   * SystemLog create
   */
  export type SystemLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * The data needed to create a SystemLog.
     */
    data: XOR<SystemLogCreateInput, SystemLogUncheckedCreateInput>
  }

  /**
   * SystemLog createMany
   */
  export type SystemLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SystemLogs.
     */
    data: SystemLogCreateManyInput | SystemLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemLog createManyAndReturn
   */
  export type SystemLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * The data used to create many SystemLogs.
     */
    data: SystemLogCreateManyInput | SystemLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SystemLog update
   */
  export type SystemLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * The data needed to update a SystemLog.
     */
    data: XOR<SystemLogUpdateInput, SystemLogUncheckedUpdateInput>
    /**
     * Choose, which SystemLog to update.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog updateMany
   */
  export type SystemLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SystemLogs.
     */
    data: XOR<SystemLogUpdateManyMutationInput, SystemLogUncheckedUpdateManyInput>
    /**
     * Filter which SystemLogs to update
     */
    where?: SystemLogWhereInput
    /**
     * Limit how many SystemLogs to update.
     */
    limit?: number
  }

  /**
   * SystemLog updateManyAndReturn
   */
  export type SystemLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * The data used to update SystemLogs.
     */
    data: XOR<SystemLogUpdateManyMutationInput, SystemLogUncheckedUpdateManyInput>
    /**
     * Filter which SystemLogs to update
     */
    where?: SystemLogWhereInput
    /**
     * Limit how many SystemLogs to update.
     */
    limit?: number
  }

  /**
   * SystemLog upsert
   */
  export type SystemLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * The filter to search for the SystemLog to update in case it exists.
     */
    where: SystemLogWhereUniqueInput
    /**
     * In case the SystemLog found by the `where` argument doesn't exist, create a new SystemLog with this data.
     */
    create: XOR<SystemLogCreateInput, SystemLogUncheckedCreateInput>
    /**
     * In case the SystemLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SystemLogUpdateInput, SystemLogUncheckedUpdateInput>
  }

  /**
   * SystemLog delete
   */
  export type SystemLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
    /**
     * Filter which SystemLog to delete.
     */
    where: SystemLogWhereUniqueInput
  }

  /**
   * SystemLog deleteMany
   */
  export type SystemLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SystemLogs to delete
     */
    where?: SystemLogWhereInput
    /**
     * Limit how many SystemLogs to delete.
     */
    limit?: number
  }

  /**
   * SystemLog without action
   */
  export type SystemLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SystemLog
     */
    select?: SystemLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SystemLog
     */
    omit?: SystemLogOmit<ExtArgs> | null
  }


  /**
   * Model PerformanceMetric
   */

  export type AggregatePerformanceMetric = {
    _count: PerformanceMetricCountAggregateOutputType | null
    _avg: PerformanceMetricAvgAggregateOutputType | null
    _sum: PerformanceMetricSumAggregateOutputType | null
    _min: PerformanceMetricMinAggregateOutputType | null
    _max: PerformanceMetricMaxAggregateOutputType | null
  }

  export type PerformanceMetricAvgAggregateOutputType = {
    duration: number | null
    recordCount: number | null
  }

  export type PerformanceMetricSumAggregateOutputType = {
    duration: number | null
    recordCount: number | null
  }

  export type PerformanceMetricMinAggregateOutputType = {
    id: string | null
    operation: string | null
    resource: string | null
    provider: string | null
    duration: number | null
    success: boolean | null
    recordCount: number | null
    cacheHit: boolean | null
    timestamp: Date | null
  }

  export type PerformanceMetricMaxAggregateOutputType = {
    id: string | null
    operation: string | null
    resource: string | null
    provider: string | null
    duration: number | null
    success: boolean | null
    recordCount: number | null
    cacheHit: boolean | null
    timestamp: Date | null
  }

  export type PerformanceMetricCountAggregateOutputType = {
    id: number
    operation: number
    resource: number
    provider: number
    duration: number
    success: number
    recordCount: number
    cacheHit: number
    timestamp: number
    metadata: number
    _all: number
  }


  export type PerformanceMetricAvgAggregateInputType = {
    duration?: true
    recordCount?: true
  }

  export type PerformanceMetricSumAggregateInputType = {
    duration?: true
    recordCount?: true
  }

  export type PerformanceMetricMinAggregateInputType = {
    id?: true
    operation?: true
    resource?: true
    provider?: true
    duration?: true
    success?: true
    recordCount?: true
    cacheHit?: true
    timestamp?: true
  }

  export type PerformanceMetricMaxAggregateInputType = {
    id?: true
    operation?: true
    resource?: true
    provider?: true
    duration?: true
    success?: true
    recordCount?: true
    cacheHit?: true
    timestamp?: true
  }

  export type PerformanceMetricCountAggregateInputType = {
    id?: true
    operation?: true
    resource?: true
    provider?: true
    duration?: true
    success?: true
    recordCount?: true
    cacheHit?: true
    timestamp?: true
    metadata?: true
    _all?: true
  }

  export type PerformanceMetricAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PerformanceMetric to aggregate.
     */
    where?: PerformanceMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceMetrics to fetch.
     */
    orderBy?: PerformanceMetricOrderByWithRelationInput | PerformanceMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PerformanceMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PerformanceMetrics
    **/
    _count?: true | PerformanceMetricCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PerformanceMetricAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PerformanceMetricSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PerformanceMetricMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PerformanceMetricMaxAggregateInputType
  }

  export type GetPerformanceMetricAggregateType<T extends PerformanceMetricAggregateArgs> = {
        [P in keyof T & keyof AggregatePerformanceMetric]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePerformanceMetric[P]>
      : GetScalarType<T[P], AggregatePerformanceMetric[P]>
  }




  export type PerformanceMetricGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PerformanceMetricWhereInput
    orderBy?: PerformanceMetricOrderByWithAggregationInput | PerformanceMetricOrderByWithAggregationInput[]
    by: PerformanceMetricScalarFieldEnum[] | PerformanceMetricScalarFieldEnum
    having?: PerformanceMetricScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PerformanceMetricCountAggregateInputType | true
    _avg?: PerformanceMetricAvgAggregateInputType
    _sum?: PerformanceMetricSumAggregateInputType
    _min?: PerformanceMetricMinAggregateInputType
    _max?: PerformanceMetricMaxAggregateInputType
  }

  export type PerformanceMetricGroupByOutputType = {
    id: string
    operation: string
    resource: string
    provider: string
    duration: number
    success: boolean
    recordCount: number | null
    cacheHit: boolean | null
    timestamp: Date
    metadata: JsonValue | null
    _count: PerformanceMetricCountAggregateOutputType | null
    _avg: PerformanceMetricAvgAggregateOutputType | null
    _sum: PerformanceMetricSumAggregateOutputType | null
    _min: PerformanceMetricMinAggregateOutputType | null
    _max: PerformanceMetricMaxAggregateOutputType | null
  }

  type GetPerformanceMetricGroupByPayload<T extends PerformanceMetricGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PerformanceMetricGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PerformanceMetricGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PerformanceMetricGroupByOutputType[P]>
            : GetScalarType<T[P], PerformanceMetricGroupByOutputType[P]>
        }
      >
    >


  export type PerformanceMetricSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operation?: boolean
    resource?: boolean
    provider?: boolean
    duration?: boolean
    success?: boolean
    recordCount?: boolean
    cacheHit?: boolean
    timestamp?: boolean
    metadata?: boolean
  }, ExtArgs["result"]["performanceMetric"]>

  export type PerformanceMetricSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operation?: boolean
    resource?: boolean
    provider?: boolean
    duration?: boolean
    success?: boolean
    recordCount?: boolean
    cacheHit?: boolean
    timestamp?: boolean
    metadata?: boolean
  }, ExtArgs["result"]["performanceMetric"]>

  export type PerformanceMetricSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    operation?: boolean
    resource?: boolean
    provider?: boolean
    duration?: boolean
    success?: boolean
    recordCount?: boolean
    cacheHit?: boolean
    timestamp?: boolean
    metadata?: boolean
  }, ExtArgs["result"]["performanceMetric"]>

  export type PerformanceMetricSelectScalar = {
    id?: boolean
    operation?: boolean
    resource?: boolean
    provider?: boolean
    duration?: boolean
    success?: boolean
    recordCount?: boolean
    cacheHit?: boolean
    timestamp?: boolean
    metadata?: boolean
  }

  export type PerformanceMetricOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "operation" | "resource" | "provider" | "duration" | "success" | "recordCount" | "cacheHit" | "timestamp" | "metadata", ExtArgs["result"]["performanceMetric"]>

  export type $PerformanceMetricPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PerformanceMetric"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      operation: string
      resource: string
      provider: string
      duration: number
      success: boolean
      recordCount: number | null
      cacheHit: boolean | null
      timestamp: Date
      metadata: Prisma.JsonValue | null
    }, ExtArgs["result"]["performanceMetric"]>
    composites: {}
  }

  type PerformanceMetricGetPayload<S extends boolean | null | undefined | PerformanceMetricDefaultArgs> = $Result.GetResult<Prisma.$PerformanceMetricPayload, S>

  type PerformanceMetricCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PerformanceMetricFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PerformanceMetricCountAggregateInputType | true
    }

  export interface PerformanceMetricDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PerformanceMetric'], meta: { name: 'PerformanceMetric' } }
    /**
     * Find zero or one PerformanceMetric that matches the filter.
     * @param {PerformanceMetricFindUniqueArgs} args - Arguments to find a PerformanceMetric
     * @example
     * // Get one PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PerformanceMetricFindUniqueArgs>(args: SelectSubset<T, PerformanceMetricFindUniqueArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one PerformanceMetric that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PerformanceMetricFindUniqueOrThrowArgs} args - Arguments to find a PerformanceMetric
     * @example
     * // Get one PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PerformanceMetricFindUniqueOrThrowArgs>(args: SelectSubset<T, PerformanceMetricFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PerformanceMetric that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricFindFirstArgs} args - Arguments to find a PerformanceMetric
     * @example
     * // Get one PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PerformanceMetricFindFirstArgs>(args?: SelectSubset<T, PerformanceMetricFindFirstArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first PerformanceMetric that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricFindFirstOrThrowArgs} args - Arguments to find a PerformanceMetric
     * @example
     * // Get one PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PerformanceMetricFindFirstOrThrowArgs>(args?: SelectSubset<T, PerformanceMetricFindFirstOrThrowArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more PerformanceMetrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PerformanceMetrics
     * const performanceMetrics = await prisma.performanceMetric.findMany()
     * 
     * // Get first 10 PerformanceMetrics
     * const performanceMetrics = await prisma.performanceMetric.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const performanceMetricWithIdOnly = await prisma.performanceMetric.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PerformanceMetricFindManyArgs>(args?: SelectSubset<T, PerformanceMetricFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a PerformanceMetric.
     * @param {PerformanceMetricCreateArgs} args - Arguments to create a PerformanceMetric.
     * @example
     * // Create one PerformanceMetric
     * const PerformanceMetric = await prisma.performanceMetric.create({
     *   data: {
     *     // ... data to create a PerformanceMetric
     *   }
     * })
     * 
     */
    create<T extends PerformanceMetricCreateArgs>(args: SelectSubset<T, PerformanceMetricCreateArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many PerformanceMetrics.
     * @param {PerformanceMetricCreateManyArgs} args - Arguments to create many PerformanceMetrics.
     * @example
     * // Create many PerformanceMetrics
     * const performanceMetric = await prisma.performanceMetric.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PerformanceMetricCreateManyArgs>(args?: SelectSubset<T, PerformanceMetricCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PerformanceMetrics and returns the data saved in the database.
     * @param {PerformanceMetricCreateManyAndReturnArgs} args - Arguments to create many PerformanceMetrics.
     * @example
     * // Create many PerformanceMetrics
     * const performanceMetric = await prisma.performanceMetric.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PerformanceMetrics and only return the `id`
     * const performanceMetricWithIdOnly = await prisma.performanceMetric.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PerformanceMetricCreateManyAndReturnArgs>(args?: SelectSubset<T, PerformanceMetricCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a PerformanceMetric.
     * @param {PerformanceMetricDeleteArgs} args - Arguments to delete one PerformanceMetric.
     * @example
     * // Delete one PerformanceMetric
     * const PerformanceMetric = await prisma.performanceMetric.delete({
     *   where: {
     *     // ... filter to delete one PerformanceMetric
     *   }
     * })
     * 
     */
    delete<T extends PerformanceMetricDeleteArgs>(args: SelectSubset<T, PerformanceMetricDeleteArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one PerformanceMetric.
     * @param {PerformanceMetricUpdateArgs} args - Arguments to update one PerformanceMetric.
     * @example
     * // Update one PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PerformanceMetricUpdateArgs>(args: SelectSubset<T, PerformanceMetricUpdateArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more PerformanceMetrics.
     * @param {PerformanceMetricDeleteManyArgs} args - Arguments to filter PerformanceMetrics to delete.
     * @example
     * // Delete a few PerformanceMetrics
     * const { count } = await prisma.performanceMetric.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PerformanceMetricDeleteManyArgs>(args?: SelectSubset<T, PerformanceMetricDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PerformanceMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PerformanceMetrics
     * const performanceMetric = await prisma.performanceMetric.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PerformanceMetricUpdateManyArgs>(args: SelectSubset<T, PerformanceMetricUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PerformanceMetrics and returns the data updated in the database.
     * @param {PerformanceMetricUpdateManyAndReturnArgs} args - Arguments to update many PerformanceMetrics.
     * @example
     * // Update many PerformanceMetrics
     * const performanceMetric = await prisma.performanceMetric.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more PerformanceMetrics and only return the `id`
     * const performanceMetricWithIdOnly = await prisma.performanceMetric.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PerformanceMetricUpdateManyAndReturnArgs>(args: SelectSubset<T, PerformanceMetricUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one PerformanceMetric.
     * @param {PerformanceMetricUpsertArgs} args - Arguments to update or create a PerformanceMetric.
     * @example
     * // Update or create a PerformanceMetric
     * const performanceMetric = await prisma.performanceMetric.upsert({
     *   create: {
     *     // ... data to create a PerformanceMetric
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PerformanceMetric we want to update
     *   }
     * })
     */
    upsert<T extends PerformanceMetricUpsertArgs>(args: SelectSubset<T, PerformanceMetricUpsertArgs<ExtArgs>>): Prisma__PerformanceMetricClient<$Result.GetResult<Prisma.$PerformanceMetricPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of PerformanceMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricCountArgs} args - Arguments to filter PerformanceMetrics to count.
     * @example
     * // Count the number of PerformanceMetrics
     * const count = await prisma.performanceMetric.count({
     *   where: {
     *     // ... the filter for the PerformanceMetrics we want to count
     *   }
     * })
    **/
    count<T extends PerformanceMetricCountArgs>(
      args?: Subset<T, PerformanceMetricCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PerformanceMetricCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PerformanceMetric.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PerformanceMetricAggregateArgs>(args: Subset<T, PerformanceMetricAggregateArgs>): Prisma.PrismaPromise<GetPerformanceMetricAggregateType<T>>

    /**
     * Group by PerformanceMetric.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PerformanceMetricGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PerformanceMetricGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PerformanceMetricGroupByArgs['orderBy'] }
        : { orderBy?: PerformanceMetricGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PerformanceMetricGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPerformanceMetricGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PerformanceMetric model
   */
  readonly fields: PerformanceMetricFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PerformanceMetric.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PerformanceMetricClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PerformanceMetric model
   */
  interface PerformanceMetricFieldRefs {
    readonly id: FieldRef<"PerformanceMetric", 'String'>
    readonly operation: FieldRef<"PerformanceMetric", 'String'>
    readonly resource: FieldRef<"PerformanceMetric", 'String'>
    readonly provider: FieldRef<"PerformanceMetric", 'String'>
    readonly duration: FieldRef<"PerformanceMetric", 'Int'>
    readonly success: FieldRef<"PerformanceMetric", 'Boolean'>
    readonly recordCount: FieldRef<"PerformanceMetric", 'Int'>
    readonly cacheHit: FieldRef<"PerformanceMetric", 'Boolean'>
    readonly timestamp: FieldRef<"PerformanceMetric", 'DateTime'>
    readonly metadata: FieldRef<"PerformanceMetric", 'Json'>
  }
    

  // Custom InputTypes
  /**
   * PerformanceMetric findUnique
   */
  export type PerformanceMetricFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceMetric to fetch.
     */
    where: PerformanceMetricWhereUniqueInput
  }

  /**
   * PerformanceMetric findUniqueOrThrow
   */
  export type PerformanceMetricFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceMetric to fetch.
     */
    where: PerformanceMetricWhereUniqueInput
  }

  /**
   * PerformanceMetric findFirst
   */
  export type PerformanceMetricFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceMetric to fetch.
     */
    where?: PerformanceMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceMetrics to fetch.
     */
    orderBy?: PerformanceMetricOrderByWithRelationInput | PerformanceMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PerformanceMetrics.
     */
    cursor?: PerformanceMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PerformanceMetrics.
     */
    distinct?: PerformanceMetricScalarFieldEnum | PerformanceMetricScalarFieldEnum[]
  }

  /**
   * PerformanceMetric findFirstOrThrow
   */
  export type PerformanceMetricFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceMetric to fetch.
     */
    where?: PerformanceMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceMetrics to fetch.
     */
    orderBy?: PerformanceMetricOrderByWithRelationInput | PerformanceMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PerformanceMetrics.
     */
    cursor?: PerformanceMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PerformanceMetrics.
     */
    distinct?: PerformanceMetricScalarFieldEnum | PerformanceMetricScalarFieldEnum[]
  }

  /**
   * PerformanceMetric findMany
   */
  export type PerformanceMetricFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter, which PerformanceMetrics to fetch.
     */
    where?: PerformanceMetricWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PerformanceMetrics to fetch.
     */
    orderBy?: PerformanceMetricOrderByWithRelationInput | PerformanceMetricOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PerformanceMetrics.
     */
    cursor?: PerformanceMetricWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PerformanceMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PerformanceMetrics.
     */
    skip?: number
    distinct?: PerformanceMetricScalarFieldEnum | PerformanceMetricScalarFieldEnum[]
  }

  /**
   * PerformanceMetric create
   */
  export type PerformanceMetricCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * The data needed to create a PerformanceMetric.
     */
    data: XOR<PerformanceMetricCreateInput, PerformanceMetricUncheckedCreateInput>
  }

  /**
   * PerformanceMetric createMany
   */
  export type PerformanceMetricCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PerformanceMetrics.
     */
    data: PerformanceMetricCreateManyInput | PerformanceMetricCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PerformanceMetric createManyAndReturn
   */
  export type PerformanceMetricCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * The data used to create many PerformanceMetrics.
     */
    data: PerformanceMetricCreateManyInput | PerformanceMetricCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PerformanceMetric update
   */
  export type PerformanceMetricUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * The data needed to update a PerformanceMetric.
     */
    data: XOR<PerformanceMetricUpdateInput, PerformanceMetricUncheckedUpdateInput>
    /**
     * Choose, which PerformanceMetric to update.
     */
    where: PerformanceMetricWhereUniqueInput
  }

  /**
   * PerformanceMetric updateMany
   */
  export type PerformanceMetricUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PerformanceMetrics.
     */
    data: XOR<PerformanceMetricUpdateManyMutationInput, PerformanceMetricUncheckedUpdateManyInput>
    /**
     * Filter which PerformanceMetrics to update
     */
    where?: PerformanceMetricWhereInput
    /**
     * Limit how many PerformanceMetrics to update.
     */
    limit?: number
  }

  /**
   * PerformanceMetric updateManyAndReturn
   */
  export type PerformanceMetricUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * The data used to update PerformanceMetrics.
     */
    data: XOR<PerformanceMetricUpdateManyMutationInput, PerformanceMetricUncheckedUpdateManyInput>
    /**
     * Filter which PerformanceMetrics to update
     */
    where?: PerformanceMetricWhereInput
    /**
     * Limit how many PerformanceMetrics to update.
     */
    limit?: number
  }

  /**
   * PerformanceMetric upsert
   */
  export type PerformanceMetricUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * The filter to search for the PerformanceMetric to update in case it exists.
     */
    where: PerformanceMetricWhereUniqueInput
    /**
     * In case the PerformanceMetric found by the `where` argument doesn't exist, create a new PerformanceMetric with this data.
     */
    create: XOR<PerformanceMetricCreateInput, PerformanceMetricUncheckedCreateInput>
    /**
     * In case the PerformanceMetric was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PerformanceMetricUpdateInput, PerformanceMetricUncheckedUpdateInput>
  }

  /**
   * PerformanceMetric delete
   */
  export type PerformanceMetricDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
    /**
     * Filter which PerformanceMetric to delete.
     */
    where: PerformanceMetricWhereUniqueInput
  }

  /**
   * PerformanceMetric deleteMany
   */
  export type PerformanceMetricDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PerformanceMetrics to delete
     */
    where?: PerformanceMetricWhereInput
    /**
     * Limit how many PerformanceMetrics to delete.
     */
    limit?: number
  }

  /**
   * PerformanceMetric without action
   */
  export type PerformanceMetricDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PerformanceMetric
     */
    select?: PerformanceMetricSelect<ExtArgs> | null
    /**
     * Omit specific fields from the PerformanceMetric
     */
    omit?: PerformanceMetricOmit<ExtArgs> | null
  }


  /**
   * Model Expense
   */

  export type AggregateExpense = {
    _count: ExpenseCountAggregateOutputType | null
    _avg: ExpenseAvgAggregateOutputType | null
    _sum: ExpenseSumAggregateOutputType | null
    _min: ExpenseMinAggregateOutputType | null
    _max: ExpenseMaxAggregateOutputType | null
  }

  export type ExpenseAvgAggregateOutputType = {
    monto: number | null
  }

  export type ExpenseSumAggregateOutputType = {
    monto: number | null
  }

  export type ExpenseMinAggregateOutputType = {
    id: string | null
    motivo: string | null
    fecha: Date | null
    monto: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ExpenseMaxAggregateOutputType = {
    id: string | null
    motivo: string | null
    fecha: Date | null
    monto: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ExpenseCountAggregateOutputType = {
    id: number
    motivo: number
    fecha: number
    monto: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ExpenseAvgAggregateInputType = {
    monto?: true
  }

  export type ExpenseSumAggregateInputType = {
    monto?: true
  }

  export type ExpenseMinAggregateInputType = {
    id?: true
    motivo?: true
    fecha?: true
    monto?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ExpenseMaxAggregateInputType = {
    id?: true
    motivo?: true
    fecha?: true
    monto?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ExpenseCountAggregateInputType = {
    id?: true
    motivo?: true
    fecha?: true
    monto?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ExpenseAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Expense to aggregate.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Expenses
    **/
    _count?: true | ExpenseCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ExpenseAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ExpenseSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ExpenseMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ExpenseMaxAggregateInputType
  }

  export type GetExpenseAggregateType<T extends ExpenseAggregateArgs> = {
        [P in keyof T & keyof AggregateExpense]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateExpense[P]>
      : GetScalarType<T[P], AggregateExpense[P]>
  }




  export type ExpenseGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ExpenseWhereInput
    orderBy?: ExpenseOrderByWithAggregationInput | ExpenseOrderByWithAggregationInput[]
    by: ExpenseScalarFieldEnum[] | ExpenseScalarFieldEnum
    having?: ExpenseScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ExpenseCountAggregateInputType | true
    _avg?: ExpenseAvgAggregateInputType
    _sum?: ExpenseSumAggregateInputType
    _min?: ExpenseMinAggregateInputType
    _max?: ExpenseMaxAggregateInputType
  }

  export type ExpenseGroupByOutputType = {
    id: string
    motivo: string
    fecha: Date
    monto: number
    createdAt: Date
    updatedAt: Date
    _count: ExpenseCountAggregateOutputType | null
    _avg: ExpenseAvgAggregateOutputType | null
    _sum: ExpenseSumAggregateOutputType | null
    _min: ExpenseMinAggregateOutputType | null
    _max: ExpenseMaxAggregateOutputType | null
  }

  type GetExpenseGroupByPayload<T extends ExpenseGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ExpenseGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ExpenseGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ExpenseGroupByOutputType[P]>
            : GetScalarType<T[P], ExpenseGroupByOutputType[P]>
        }
      >
    >


  export type ExpenseSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    motivo?: boolean
    fecha?: boolean
    monto?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["expense"]>

  export type ExpenseSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    motivo?: boolean
    fecha?: boolean
    monto?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["expense"]>

  export type ExpenseSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    motivo?: boolean
    fecha?: boolean
    monto?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["expense"]>

  export type ExpenseSelectScalar = {
    id?: boolean
    motivo?: boolean
    fecha?: boolean
    monto?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ExpenseOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "motivo" | "fecha" | "monto" | "createdAt" | "updatedAt", ExtArgs["result"]["expense"]>

  export type $ExpensePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Expense"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      motivo: string
      fecha: Date
      monto: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["expense"]>
    composites: {}
  }

  type ExpenseGetPayload<S extends boolean | null | undefined | ExpenseDefaultArgs> = $Result.GetResult<Prisma.$ExpensePayload, S>

  type ExpenseCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ExpenseFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ExpenseCountAggregateInputType | true
    }

  export interface ExpenseDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Expense'], meta: { name: 'Expense' } }
    /**
     * Find zero or one Expense that matches the filter.
     * @param {ExpenseFindUniqueArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ExpenseFindUniqueArgs>(args: SelectSubset<T, ExpenseFindUniqueArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Expense that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ExpenseFindUniqueOrThrowArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ExpenseFindUniqueOrThrowArgs>(args: SelectSubset<T, ExpenseFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Expense that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseFindFirstArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ExpenseFindFirstArgs>(args?: SelectSubset<T, ExpenseFindFirstArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Expense that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseFindFirstOrThrowArgs} args - Arguments to find a Expense
     * @example
     * // Get one Expense
     * const expense = await prisma.expense.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ExpenseFindFirstOrThrowArgs>(args?: SelectSubset<T, ExpenseFindFirstOrThrowArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Expenses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Expenses
     * const expenses = await prisma.expense.findMany()
     * 
     * // Get first 10 Expenses
     * const expenses = await prisma.expense.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const expenseWithIdOnly = await prisma.expense.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ExpenseFindManyArgs>(args?: SelectSubset<T, ExpenseFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Expense.
     * @param {ExpenseCreateArgs} args - Arguments to create a Expense.
     * @example
     * // Create one Expense
     * const Expense = await prisma.expense.create({
     *   data: {
     *     // ... data to create a Expense
     *   }
     * })
     * 
     */
    create<T extends ExpenseCreateArgs>(args: SelectSubset<T, ExpenseCreateArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Expenses.
     * @param {ExpenseCreateManyArgs} args - Arguments to create many Expenses.
     * @example
     * // Create many Expenses
     * const expense = await prisma.expense.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ExpenseCreateManyArgs>(args?: SelectSubset<T, ExpenseCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Expenses and returns the data saved in the database.
     * @param {ExpenseCreateManyAndReturnArgs} args - Arguments to create many Expenses.
     * @example
     * // Create many Expenses
     * const expense = await prisma.expense.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Expenses and only return the `id`
     * const expenseWithIdOnly = await prisma.expense.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ExpenseCreateManyAndReturnArgs>(args?: SelectSubset<T, ExpenseCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Expense.
     * @param {ExpenseDeleteArgs} args - Arguments to delete one Expense.
     * @example
     * // Delete one Expense
     * const Expense = await prisma.expense.delete({
     *   where: {
     *     // ... filter to delete one Expense
     *   }
     * })
     * 
     */
    delete<T extends ExpenseDeleteArgs>(args: SelectSubset<T, ExpenseDeleteArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Expense.
     * @param {ExpenseUpdateArgs} args - Arguments to update one Expense.
     * @example
     * // Update one Expense
     * const expense = await prisma.expense.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ExpenseUpdateArgs>(args: SelectSubset<T, ExpenseUpdateArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Expenses.
     * @param {ExpenseDeleteManyArgs} args - Arguments to filter Expenses to delete.
     * @example
     * // Delete a few Expenses
     * const { count } = await prisma.expense.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ExpenseDeleteManyArgs>(args?: SelectSubset<T, ExpenseDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Expenses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Expenses
     * const expense = await prisma.expense.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ExpenseUpdateManyArgs>(args: SelectSubset<T, ExpenseUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Expenses and returns the data updated in the database.
     * @param {ExpenseUpdateManyAndReturnArgs} args - Arguments to update many Expenses.
     * @example
     * // Update many Expenses
     * const expense = await prisma.expense.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Expenses and only return the `id`
     * const expenseWithIdOnly = await prisma.expense.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ExpenseUpdateManyAndReturnArgs>(args: SelectSubset<T, ExpenseUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Expense.
     * @param {ExpenseUpsertArgs} args - Arguments to update or create a Expense.
     * @example
     * // Update or create a Expense
     * const expense = await prisma.expense.upsert({
     *   create: {
     *     // ... data to create a Expense
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Expense we want to update
     *   }
     * })
     */
    upsert<T extends ExpenseUpsertArgs>(args: SelectSubset<T, ExpenseUpsertArgs<ExtArgs>>): Prisma__ExpenseClient<$Result.GetResult<Prisma.$ExpensePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Expenses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseCountArgs} args - Arguments to filter Expenses to count.
     * @example
     * // Count the number of Expenses
     * const count = await prisma.expense.count({
     *   where: {
     *     // ... the filter for the Expenses we want to count
     *   }
     * })
    **/
    count<T extends ExpenseCountArgs>(
      args?: Subset<T, ExpenseCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ExpenseCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Expense.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ExpenseAggregateArgs>(args: Subset<T, ExpenseAggregateArgs>): Prisma.PrismaPromise<GetExpenseAggregateType<T>>

    /**
     * Group by Expense.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ExpenseGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ExpenseGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ExpenseGroupByArgs['orderBy'] }
        : { orderBy?: ExpenseGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ExpenseGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetExpenseGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Expense model
   */
  readonly fields: ExpenseFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Expense.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ExpenseClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Expense model
   */
  interface ExpenseFieldRefs {
    readonly id: FieldRef<"Expense", 'String'>
    readonly motivo: FieldRef<"Expense", 'String'>
    readonly fecha: FieldRef<"Expense", 'DateTime'>
    readonly monto: FieldRef<"Expense", 'Float'>
    readonly createdAt: FieldRef<"Expense", 'DateTime'>
    readonly updatedAt: FieldRef<"Expense", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Expense findUnique
   */
  export type ExpenseFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense findUniqueOrThrow
   */
  export type ExpenseFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense findFirst
   */
  export type ExpenseFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Expenses.
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Expenses.
     */
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * Expense findFirstOrThrow
   */
  export type ExpenseFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Filter, which Expense to fetch.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Expenses.
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Expenses.
     */
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * Expense findMany
   */
  export type ExpenseFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Filter, which Expenses to fetch.
     */
    where?: ExpenseWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Expenses to fetch.
     */
    orderBy?: ExpenseOrderByWithRelationInput | ExpenseOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Expenses.
     */
    cursor?: ExpenseWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Expenses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Expenses.
     */
    skip?: number
    distinct?: ExpenseScalarFieldEnum | ExpenseScalarFieldEnum[]
  }

  /**
   * Expense create
   */
  export type ExpenseCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * The data needed to create a Expense.
     */
    data: XOR<ExpenseCreateInput, ExpenseUncheckedCreateInput>
  }

  /**
   * Expense createMany
   */
  export type ExpenseCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Expenses.
     */
    data: ExpenseCreateManyInput | ExpenseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Expense createManyAndReturn
   */
  export type ExpenseCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * The data used to create many Expenses.
     */
    data: ExpenseCreateManyInput | ExpenseCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Expense update
   */
  export type ExpenseUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * The data needed to update a Expense.
     */
    data: XOR<ExpenseUpdateInput, ExpenseUncheckedUpdateInput>
    /**
     * Choose, which Expense to update.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense updateMany
   */
  export type ExpenseUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Expenses.
     */
    data: XOR<ExpenseUpdateManyMutationInput, ExpenseUncheckedUpdateManyInput>
    /**
     * Filter which Expenses to update
     */
    where?: ExpenseWhereInput
    /**
     * Limit how many Expenses to update.
     */
    limit?: number
  }

  /**
   * Expense updateManyAndReturn
   */
  export type ExpenseUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * The data used to update Expenses.
     */
    data: XOR<ExpenseUpdateManyMutationInput, ExpenseUncheckedUpdateManyInput>
    /**
     * Filter which Expenses to update
     */
    where?: ExpenseWhereInput
    /**
     * Limit how many Expenses to update.
     */
    limit?: number
  }

  /**
   * Expense upsert
   */
  export type ExpenseUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * The filter to search for the Expense to update in case it exists.
     */
    where: ExpenseWhereUniqueInput
    /**
     * In case the Expense found by the `where` argument doesn't exist, create a new Expense with this data.
     */
    create: XOR<ExpenseCreateInput, ExpenseUncheckedCreateInput>
    /**
     * In case the Expense was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ExpenseUpdateInput, ExpenseUncheckedUpdateInput>
  }

  /**
   * Expense delete
   */
  export type ExpenseDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
    /**
     * Filter which Expense to delete.
     */
    where: ExpenseWhereUniqueInput
  }

  /**
   * Expense deleteMany
   */
  export type ExpenseDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Expenses to delete
     */
    where?: ExpenseWhereInput
    /**
     * Limit how many Expenses to delete.
     */
    limit?: number
  }

  /**
   * Expense without action
   */
  export type ExpenseDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Expense
     */
    select?: ExpenseSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Expense
     */
    omit?: ExpenseOmit<ExtArgs> | null
  }


  /**
   * Model InAppAlert
   */

  export type AggregateInAppAlert = {
    _count: InAppAlertCountAggregateOutputType | null
    _min: InAppAlertMinAggregateOutputType | null
    _max: InAppAlertMaxAggregateOutputType | null
  }

  export type InAppAlertMinAggregateOutputType = {
    id: string | null
    title: string | null
    content: string | null
    type: string | null
    startDate: Date | null
    endDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InAppAlertMaxAggregateOutputType = {
    id: string | null
    title: string | null
    content: string | null
    type: string | null
    startDate: Date | null
    endDate: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type InAppAlertCountAggregateOutputType = {
    id: number
    title: number
    content: number
    type: number
    startDate: number
    endDate: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type InAppAlertMinAggregateInputType = {
    id?: true
    title?: true
    content?: true
    type?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InAppAlertMaxAggregateInputType = {
    id?: true
    title?: true
    content?: true
    type?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updatedAt?: true
  }

  export type InAppAlertCountAggregateInputType = {
    id?: true
    title?: true
    content?: true
    type?: true
    startDate?: true
    endDate?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type InAppAlertAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InAppAlert to aggregate.
     */
    where?: InAppAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InAppAlerts to fetch.
     */
    orderBy?: InAppAlertOrderByWithRelationInput | InAppAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: InAppAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InAppAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InAppAlerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned InAppAlerts
    **/
    _count?: true | InAppAlertCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: InAppAlertMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: InAppAlertMaxAggregateInputType
  }

  export type GetInAppAlertAggregateType<T extends InAppAlertAggregateArgs> = {
        [P in keyof T & keyof AggregateInAppAlert]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateInAppAlert[P]>
      : GetScalarType<T[P], AggregateInAppAlert[P]>
  }




  export type InAppAlertGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: InAppAlertWhereInput
    orderBy?: InAppAlertOrderByWithAggregationInput | InAppAlertOrderByWithAggregationInput[]
    by: InAppAlertScalarFieldEnum[] | InAppAlertScalarFieldEnum
    having?: InAppAlertScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: InAppAlertCountAggregateInputType | true
    _min?: InAppAlertMinAggregateInputType
    _max?: InAppAlertMaxAggregateInputType
  }

  export type InAppAlertGroupByOutputType = {
    id: string
    title: string
    content: string
    type: string
    startDate: Date
    endDate: Date
    createdAt: Date
    updatedAt: Date
    _count: InAppAlertCountAggregateOutputType | null
    _min: InAppAlertMinAggregateOutputType | null
    _max: InAppAlertMaxAggregateOutputType | null
  }

  type GetInAppAlertGroupByPayload<T extends InAppAlertGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<InAppAlertGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof InAppAlertGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], InAppAlertGroupByOutputType[P]>
            : GetScalarType<T[P], InAppAlertGroupByOutputType[P]>
        }
      >
    >


  export type InAppAlertSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    type?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["inAppAlert"]>

  export type InAppAlertSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    type?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["inAppAlert"]>

  export type InAppAlertSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    content?: boolean
    type?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["inAppAlert"]>

  export type InAppAlertSelectScalar = {
    id?: boolean
    title?: boolean
    content?: boolean
    type?: boolean
    startDate?: boolean
    endDate?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type InAppAlertOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "content" | "type" | "startDate" | "endDate" | "createdAt" | "updatedAt", ExtArgs["result"]["inAppAlert"]>

  export type $InAppAlertPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "InAppAlert"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      content: string
      type: string
      startDate: Date
      endDate: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["inAppAlert"]>
    composites: {}
  }

  type InAppAlertGetPayload<S extends boolean | null | undefined | InAppAlertDefaultArgs> = $Result.GetResult<Prisma.$InAppAlertPayload, S>

  type InAppAlertCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<InAppAlertFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: InAppAlertCountAggregateInputType | true
    }

  export interface InAppAlertDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['InAppAlert'], meta: { name: 'InAppAlert' } }
    /**
     * Find zero or one InAppAlert that matches the filter.
     * @param {InAppAlertFindUniqueArgs} args - Arguments to find a InAppAlert
     * @example
     * // Get one InAppAlert
     * const inAppAlert = await prisma.inAppAlert.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends InAppAlertFindUniqueArgs>(args: SelectSubset<T, InAppAlertFindUniqueArgs<ExtArgs>>): Prisma__InAppAlertClient<$Result.GetResult<Prisma.$InAppAlertPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one InAppAlert that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {InAppAlertFindUniqueOrThrowArgs} args - Arguments to find a InAppAlert
     * @example
     * // Get one InAppAlert
     * const inAppAlert = await prisma.inAppAlert.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends InAppAlertFindUniqueOrThrowArgs>(args: SelectSubset<T, InAppAlertFindUniqueOrThrowArgs<ExtArgs>>): Prisma__InAppAlertClient<$Result.GetResult<Prisma.$InAppAlertPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InAppAlert that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InAppAlertFindFirstArgs} args - Arguments to find a InAppAlert
     * @example
     * // Get one InAppAlert
     * const inAppAlert = await prisma.inAppAlert.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends InAppAlertFindFirstArgs>(args?: SelectSubset<T, InAppAlertFindFirstArgs<ExtArgs>>): Prisma__InAppAlertClient<$Result.GetResult<Prisma.$InAppAlertPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first InAppAlert that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InAppAlertFindFirstOrThrowArgs} args - Arguments to find a InAppAlert
     * @example
     * // Get one InAppAlert
     * const inAppAlert = await prisma.inAppAlert.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends InAppAlertFindFirstOrThrowArgs>(args?: SelectSubset<T, InAppAlertFindFirstOrThrowArgs<ExtArgs>>): Prisma__InAppAlertClient<$Result.GetResult<Prisma.$InAppAlertPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more InAppAlerts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InAppAlertFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all InAppAlerts
     * const inAppAlerts = await prisma.inAppAlert.findMany()
     * 
     * // Get first 10 InAppAlerts
     * const inAppAlerts = await prisma.inAppAlert.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const inAppAlertWithIdOnly = await prisma.inAppAlert.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends InAppAlertFindManyArgs>(args?: SelectSubset<T, InAppAlertFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InAppAlertPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a InAppAlert.
     * @param {InAppAlertCreateArgs} args - Arguments to create a InAppAlert.
     * @example
     * // Create one InAppAlert
     * const InAppAlert = await prisma.inAppAlert.create({
     *   data: {
     *     // ... data to create a InAppAlert
     *   }
     * })
     * 
     */
    create<T extends InAppAlertCreateArgs>(args: SelectSubset<T, InAppAlertCreateArgs<ExtArgs>>): Prisma__InAppAlertClient<$Result.GetResult<Prisma.$InAppAlertPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many InAppAlerts.
     * @param {InAppAlertCreateManyArgs} args - Arguments to create many InAppAlerts.
     * @example
     * // Create many InAppAlerts
     * const inAppAlert = await prisma.inAppAlert.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends InAppAlertCreateManyArgs>(args?: SelectSubset<T, InAppAlertCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many InAppAlerts and returns the data saved in the database.
     * @param {InAppAlertCreateManyAndReturnArgs} args - Arguments to create many InAppAlerts.
     * @example
     * // Create many InAppAlerts
     * const inAppAlert = await prisma.inAppAlert.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many InAppAlerts and only return the `id`
     * const inAppAlertWithIdOnly = await prisma.inAppAlert.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends InAppAlertCreateManyAndReturnArgs>(args?: SelectSubset<T, InAppAlertCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InAppAlertPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a InAppAlert.
     * @param {InAppAlertDeleteArgs} args - Arguments to delete one InAppAlert.
     * @example
     * // Delete one InAppAlert
     * const InAppAlert = await prisma.inAppAlert.delete({
     *   where: {
     *     // ... filter to delete one InAppAlert
     *   }
     * })
     * 
     */
    delete<T extends InAppAlertDeleteArgs>(args: SelectSubset<T, InAppAlertDeleteArgs<ExtArgs>>): Prisma__InAppAlertClient<$Result.GetResult<Prisma.$InAppAlertPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one InAppAlert.
     * @param {InAppAlertUpdateArgs} args - Arguments to update one InAppAlert.
     * @example
     * // Update one InAppAlert
     * const inAppAlert = await prisma.inAppAlert.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends InAppAlertUpdateArgs>(args: SelectSubset<T, InAppAlertUpdateArgs<ExtArgs>>): Prisma__InAppAlertClient<$Result.GetResult<Prisma.$InAppAlertPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more InAppAlerts.
     * @param {InAppAlertDeleteManyArgs} args - Arguments to filter InAppAlerts to delete.
     * @example
     * // Delete a few InAppAlerts
     * const { count } = await prisma.inAppAlert.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends InAppAlertDeleteManyArgs>(args?: SelectSubset<T, InAppAlertDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InAppAlerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InAppAlertUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many InAppAlerts
     * const inAppAlert = await prisma.inAppAlert.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends InAppAlertUpdateManyArgs>(args: SelectSubset<T, InAppAlertUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more InAppAlerts and returns the data updated in the database.
     * @param {InAppAlertUpdateManyAndReturnArgs} args - Arguments to update many InAppAlerts.
     * @example
     * // Update many InAppAlerts
     * const inAppAlert = await prisma.inAppAlert.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more InAppAlerts and only return the `id`
     * const inAppAlertWithIdOnly = await prisma.inAppAlert.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends InAppAlertUpdateManyAndReturnArgs>(args: SelectSubset<T, InAppAlertUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$InAppAlertPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one InAppAlert.
     * @param {InAppAlertUpsertArgs} args - Arguments to update or create a InAppAlert.
     * @example
     * // Update or create a InAppAlert
     * const inAppAlert = await prisma.inAppAlert.upsert({
     *   create: {
     *     // ... data to create a InAppAlert
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the InAppAlert we want to update
     *   }
     * })
     */
    upsert<T extends InAppAlertUpsertArgs>(args: SelectSubset<T, InAppAlertUpsertArgs<ExtArgs>>): Prisma__InAppAlertClient<$Result.GetResult<Prisma.$InAppAlertPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of InAppAlerts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InAppAlertCountArgs} args - Arguments to filter InAppAlerts to count.
     * @example
     * // Count the number of InAppAlerts
     * const count = await prisma.inAppAlert.count({
     *   where: {
     *     // ... the filter for the InAppAlerts we want to count
     *   }
     * })
    **/
    count<T extends InAppAlertCountArgs>(
      args?: Subset<T, InAppAlertCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], InAppAlertCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a InAppAlert.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InAppAlertAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends InAppAlertAggregateArgs>(args: Subset<T, InAppAlertAggregateArgs>): Prisma.PrismaPromise<GetInAppAlertAggregateType<T>>

    /**
     * Group by InAppAlert.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {InAppAlertGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends InAppAlertGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: InAppAlertGroupByArgs['orderBy'] }
        : { orderBy?: InAppAlertGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, InAppAlertGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetInAppAlertGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the InAppAlert model
   */
  readonly fields: InAppAlertFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for InAppAlert.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__InAppAlertClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the InAppAlert model
   */
  interface InAppAlertFieldRefs {
    readonly id: FieldRef<"InAppAlert", 'String'>
    readonly title: FieldRef<"InAppAlert", 'String'>
    readonly content: FieldRef<"InAppAlert", 'String'>
    readonly type: FieldRef<"InAppAlert", 'String'>
    readonly startDate: FieldRef<"InAppAlert", 'DateTime'>
    readonly endDate: FieldRef<"InAppAlert", 'DateTime'>
    readonly createdAt: FieldRef<"InAppAlert", 'DateTime'>
    readonly updatedAt: FieldRef<"InAppAlert", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * InAppAlert findUnique
   */
  export type InAppAlertFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
    /**
     * Filter, which InAppAlert to fetch.
     */
    where: InAppAlertWhereUniqueInput
  }

  /**
   * InAppAlert findUniqueOrThrow
   */
  export type InAppAlertFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
    /**
     * Filter, which InAppAlert to fetch.
     */
    where: InAppAlertWhereUniqueInput
  }

  /**
   * InAppAlert findFirst
   */
  export type InAppAlertFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
    /**
     * Filter, which InAppAlert to fetch.
     */
    where?: InAppAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InAppAlerts to fetch.
     */
    orderBy?: InAppAlertOrderByWithRelationInput | InAppAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InAppAlerts.
     */
    cursor?: InAppAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InAppAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InAppAlerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InAppAlerts.
     */
    distinct?: InAppAlertScalarFieldEnum | InAppAlertScalarFieldEnum[]
  }

  /**
   * InAppAlert findFirstOrThrow
   */
  export type InAppAlertFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
    /**
     * Filter, which InAppAlert to fetch.
     */
    where?: InAppAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InAppAlerts to fetch.
     */
    orderBy?: InAppAlertOrderByWithRelationInput | InAppAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for InAppAlerts.
     */
    cursor?: InAppAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InAppAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InAppAlerts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of InAppAlerts.
     */
    distinct?: InAppAlertScalarFieldEnum | InAppAlertScalarFieldEnum[]
  }

  /**
   * InAppAlert findMany
   */
  export type InAppAlertFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
    /**
     * Filter, which InAppAlerts to fetch.
     */
    where?: InAppAlertWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of InAppAlerts to fetch.
     */
    orderBy?: InAppAlertOrderByWithRelationInput | InAppAlertOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing InAppAlerts.
     */
    cursor?: InAppAlertWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` InAppAlerts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` InAppAlerts.
     */
    skip?: number
    distinct?: InAppAlertScalarFieldEnum | InAppAlertScalarFieldEnum[]
  }

  /**
   * InAppAlert create
   */
  export type InAppAlertCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
    /**
     * The data needed to create a InAppAlert.
     */
    data: XOR<InAppAlertCreateInput, InAppAlertUncheckedCreateInput>
  }

  /**
   * InAppAlert createMany
   */
  export type InAppAlertCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many InAppAlerts.
     */
    data: InAppAlertCreateManyInput | InAppAlertCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InAppAlert createManyAndReturn
   */
  export type InAppAlertCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
    /**
     * The data used to create many InAppAlerts.
     */
    data: InAppAlertCreateManyInput | InAppAlertCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * InAppAlert update
   */
  export type InAppAlertUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
    /**
     * The data needed to update a InAppAlert.
     */
    data: XOR<InAppAlertUpdateInput, InAppAlertUncheckedUpdateInput>
    /**
     * Choose, which InAppAlert to update.
     */
    where: InAppAlertWhereUniqueInput
  }

  /**
   * InAppAlert updateMany
   */
  export type InAppAlertUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update InAppAlerts.
     */
    data: XOR<InAppAlertUpdateManyMutationInput, InAppAlertUncheckedUpdateManyInput>
    /**
     * Filter which InAppAlerts to update
     */
    where?: InAppAlertWhereInput
    /**
     * Limit how many InAppAlerts to update.
     */
    limit?: number
  }

  /**
   * InAppAlert updateManyAndReturn
   */
  export type InAppAlertUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
    /**
     * The data used to update InAppAlerts.
     */
    data: XOR<InAppAlertUpdateManyMutationInput, InAppAlertUncheckedUpdateManyInput>
    /**
     * Filter which InAppAlerts to update
     */
    where?: InAppAlertWhereInput
    /**
     * Limit how many InAppAlerts to update.
     */
    limit?: number
  }

  /**
   * InAppAlert upsert
   */
  export type InAppAlertUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
    /**
     * The filter to search for the InAppAlert to update in case it exists.
     */
    where: InAppAlertWhereUniqueInput
    /**
     * In case the InAppAlert found by the `where` argument doesn't exist, create a new InAppAlert with this data.
     */
    create: XOR<InAppAlertCreateInput, InAppAlertUncheckedCreateInput>
    /**
     * In case the InAppAlert was found with the provided `where` argument, update it with this data.
     */
    update: XOR<InAppAlertUpdateInput, InAppAlertUncheckedUpdateInput>
  }

  /**
   * InAppAlert delete
   */
  export type InAppAlertDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
    /**
     * Filter which InAppAlert to delete.
     */
    where: InAppAlertWhereUniqueInput
  }

  /**
   * InAppAlert deleteMany
   */
  export type InAppAlertDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which InAppAlerts to delete
     */
    where?: InAppAlertWhereInput
    /**
     * Limit how many InAppAlerts to delete.
     */
    limit?: number
  }

  /**
   * InAppAlert without action
   */
  export type InAppAlertDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the InAppAlert
     */
    select?: InAppAlertSelect<ExtArgs> | null
    /**
     * Omit specific fields from the InAppAlert
     */
    omit?: InAppAlertOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    phone: 'phone',
    role: 'role',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    membership: 'membership'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ClassSessionScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    disciplineId: 'disciplineId',
    name: 'name',
    dateTime: 'dateTime',
    durationMinutes: 'durationMinutes',
    instructorId: 'instructorId',
    capacity: 'capacity',
    registeredParticipantsIds: 'registeredParticipantsIds',
    waitlistParticipantsIds: 'waitlistParticipantsIds',
    status: 'status',
    notes: 'notes',
    isGenerated: 'isGenerated',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ClassSessionScalarFieldEnum = (typeof ClassSessionScalarFieldEnum)[keyof typeof ClassSessionScalarFieldEnum]


  export const DisciplineScalarFieldEnum: {
    id: 'id',
    organizationId: 'organizationId',
    name: 'name',
    description: 'description',
    color: 'color',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    schedule: 'schedule',
    cancellationRules: 'cancellationRules'
  };

  export type DisciplineScalarFieldEnum = (typeof DisciplineScalarFieldEnum)[keyof typeof DisciplineScalarFieldEnum]


  export const InstructorScalarFieldEnum: {
    id: 'id',
    firstName: 'firstName',
    lastName: 'lastName',
    email: 'email',
    phone: 'phone',
    role: 'role',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    profile: 'profile'
  };

  export type InstructorScalarFieldEnum = (typeof InstructorScalarFieldEnum)[keyof typeof InstructorScalarFieldEnum]


  export const MembershipPlanScalarFieldEnum: {
    id: 'id',
    name: 'name',
    description: 'description',
    price: 'price',
    duration: 'duration',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    features: 'features',
    config: 'config'
  };

  export type MembershipPlanScalarFieldEnum = (typeof MembershipPlanScalarFieldEnum)[keyof typeof MembershipPlanScalarFieldEnum]


  export const OrganizationScalarFieldEnum: {
    id: 'id',
    name: 'name',
    settings: 'settings',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrganizationScalarFieldEnum = (typeof OrganizationScalarFieldEnum)[keyof typeof OrganizationScalarFieldEnum]


  export const ClassRegistrationScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    classId: 'classId',
    status: 'status',
    registeredAt: 'registeredAt',
    cancelledAt: 'cancelledAt',
    notes: 'notes'
  };

  export type ClassRegistrationScalarFieldEnum = (typeof ClassRegistrationScalarFieldEnum)[keyof typeof ClassRegistrationScalarFieldEnum]


  export const MembershipRenewalScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    currentPlanId: 'currentPlanId',
    requestedPlanId: 'requestedPlanId',
    status: 'status',
    requestedAt: 'requestedAt',
    processedAt: 'processedAt',
    notes: 'notes',
    renewalDetails: 'renewalDetails'
  };

  export type MembershipRenewalScalarFieldEnum = (typeof MembershipRenewalScalarFieldEnum)[keyof typeof MembershipRenewalScalarFieldEnum]


  export const SystemLogScalarFieldEnum: {
    id: 'id',
    level: 'level',
    message: 'message',
    context: 'context',
    timestamp: 'timestamp',
    operation: 'operation',
    resource: 'resource',
    userId: 'userId',
    sessionId: 'sessionId'
  };

  export type SystemLogScalarFieldEnum = (typeof SystemLogScalarFieldEnum)[keyof typeof SystemLogScalarFieldEnum]


  export const PerformanceMetricScalarFieldEnum: {
    id: 'id',
    operation: 'operation',
    resource: 'resource',
    provider: 'provider',
    duration: 'duration',
    success: 'success',
    recordCount: 'recordCount',
    cacheHit: 'cacheHit',
    timestamp: 'timestamp',
    metadata: 'metadata'
  };

  export type PerformanceMetricScalarFieldEnum = (typeof PerformanceMetricScalarFieldEnum)[keyof typeof PerformanceMetricScalarFieldEnum]


  export const ExpenseScalarFieldEnum: {
    id: 'id',
    motivo: 'motivo',
    fecha: 'fecha',
    monto: 'monto',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ExpenseScalarFieldEnum = (typeof ExpenseScalarFieldEnum)[keyof typeof ExpenseScalarFieldEnum]


  export const InAppAlertScalarFieldEnum: {
    id: 'id',
    title: 'title',
    content: 'content',
    type: 'type',
    startDate: 'startDate',
    endDate: 'endDate',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type InAppAlertScalarFieldEnum = (typeof InAppAlertScalarFieldEnum)[keyof typeof InAppAlertScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    email?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    membership?: JsonNullableFilter<"User">
    classRegistrations?: ClassRegistrationListRelationFilter
    membershipRenewals?: MembershipRenewalListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    membership?: SortOrderInput | SortOrder
    classRegistrations?: ClassRegistrationOrderByRelationAggregateInput
    membershipRenewals?: MembershipRenewalOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    firstName?: StringFilter<"User"> | string
    lastName?: StringFilter<"User"> | string
    phone?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    membership?: JsonNullableFilter<"User">
    classRegistrations?: ClassRegistrationListRelationFilter
    membershipRenewals?: MembershipRenewalListRelationFilter
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    membership?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    firstName?: StringWithAggregatesFilter<"User"> | string
    lastName?: StringWithAggregatesFilter<"User"> | string
    email?: StringWithAggregatesFilter<"User"> | string
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: StringWithAggregatesFilter<"User"> | string
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    membership?: JsonNullableWithAggregatesFilter<"User">
  }

  export type ClassSessionWhereInput = {
    AND?: ClassSessionWhereInput | ClassSessionWhereInput[]
    OR?: ClassSessionWhereInput[]
    NOT?: ClassSessionWhereInput | ClassSessionWhereInput[]
    id?: StringFilter<"ClassSession"> | string
    organizationId?: StringFilter<"ClassSession"> | string
    disciplineId?: StringFilter<"ClassSession"> | string
    name?: StringFilter<"ClassSession"> | string
    dateTime?: DateTimeFilter<"ClassSession"> | Date | string
    durationMinutes?: IntFilter<"ClassSession"> | number
    instructorId?: StringFilter<"ClassSession"> | string
    capacity?: IntFilter<"ClassSession"> | number
    registeredParticipantsIds?: StringNullableListFilter<"ClassSession">
    waitlistParticipantsIds?: StringNullableListFilter<"ClassSession">
    status?: StringFilter<"ClassSession"> | string
    notes?: StringNullableFilter<"ClassSession"> | string | null
    isGenerated?: BoolFilter<"ClassSession"> | boolean
    createdAt?: DateTimeFilter<"ClassSession"> | Date | string
    updatedAt?: DateTimeFilter<"ClassSession"> | Date | string
    discipline?: XOR<DisciplineScalarRelationFilter, DisciplineWhereInput>
    instructor?: XOR<InstructorScalarRelationFilter, InstructorWhereInput>
    registrations?: ClassRegistrationListRelationFilter
  }

  export type ClassSessionOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    disciplineId?: SortOrder
    name?: SortOrder
    dateTime?: SortOrder
    durationMinutes?: SortOrder
    instructorId?: SortOrder
    capacity?: SortOrder
    registeredParticipantsIds?: SortOrder
    waitlistParticipantsIds?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    isGenerated?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    discipline?: DisciplineOrderByWithRelationInput
    instructor?: InstructorOrderByWithRelationInput
    registrations?: ClassRegistrationOrderByRelationAggregateInput
  }

  export type ClassSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ClassSessionWhereInput | ClassSessionWhereInput[]
    OR?: ClassSessionWhereInput[]
    NOT?: ClassSessionWhereInput | ClassSessionWhereInput[]
    organizationId?: StringFilter<"ClassSession"> | string
    disciplineId?: StringFilter<"ClassSession"> | string
    name?: StringFilter<"ClassSession"> | string
    dateTime?: DateTimeFilter<"ClassSession"> | Date | string
    durationMinutes?: IntFilter<"ClassSession"> | number
    instructorId?: StringFilter<"ClassSession"> | string
    capacity?: IntFilter<"ClassSession"> | number
    registeredParticipantsIds?: StringNullableListFilter<"ClassSession">
    waitlistParticipantsIds?: StringNullableListFilter<"ClassSession">
    status?: StringFilter<"ClassSession"> | string
    notes?: StringNullableFilter<"ClassSession"> | string | null
    isGenerated?: BoolFilter<"ClassSession"> | boolean
    createdAt?: DateTimeFilter<"ClassSession"> | Date | string
    updatedAt?: DateTimeFilter<"ClassSession"> | Date | string
    discipline?: XOR<DisciplineScalarRelationFilter, DisciplineWhereInput>
    instructor?: XOR<InstructorScalarRelationFilter, InstructorWhereInput>
    registrations?: ClassRegistrationListRelationFilter
  }, "id">

  export type ClassSessionOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    disciplineId?: SortOrder
    name?: SortOrder
    dateTime?: SortOrder
    durationMinutes?: SortOrder
    instructorId?: SortOrder
    capacity?: SortOrder
    registeredParticipantsIds?: SortOrder
    waitlistParticipantsIds?: SortOrder
    status?: SortOrder
    notes?: SortOrderInput | SortOrder
    isGenerated?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ClassSessionCountOrderByAggregateInput
    _avg?: ClassSessionAvgOrderByAggregateInput
    _max?: ClassSessionMaxOrderByAggregateInput
    _min?: ClassSessionMinOrderByAggregateInput
    _sum?: ClassSessionSumOrderByAggregateInput
  }

  export type ClassSessionScalarWhereWithAggregatesInput = {
    AND?: ClassSessionScalarWhereWithAggregatesInput | ClassSessionScalarWhereWithAggregatesInput[]
    OR?: ClassSessionScalarWhereWithAggregatesInput[]
    NOT?: ClassSessionScalarWhereWithAggregatesInput | ClassSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ClassSession"> | string
    organizationId?: StringWithAggregatesFilter<"ClassSession"> | string
    disciplineId?: StringWithAggregatesFilter<"ClassSession"> | string
    name?: StringWithAggregatesFilter<"ClassSession"> | string
    dateTime?: DateTimeWithAggregatesFilter<"ClassSession"> | Date | string
    durationMinutes?: IntWithAggregatesFilter<"ClassSession"> | number
    instructorId?: StringWithAggregatesFilter<"ClassSession"> | string
    capacity?: IntWithAggregatesFilter<"ClassSession"> | number
    registeredParticipantsIds?: StringNullableListFilter<"ClassSession">
    waitlistParticipantsIds?: StringNullableListFilter<"ClassSession">
    status?: StringWithAggregatesFilter<"ClassSession"> | string
    notes?: StringNullableWithAggregatesFilter<"ClassSession"> | string | null
    isGenerated?: BoolWithAggregatesFilter<"ClassSession"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"ClassSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ClassSession"> | Date | string
  }

  export type DisciplineWhereInput = {
    AND?: DisciplineWhereInput | DisciplineWhereInput[]
    OR?: DisciplineWhereInput[]
    NOT?: DisciplineWhereInput | DisciplineWhereInput[]
    id?: StringFilter<"Discipline"> | string
    organizationId?: StringFilter<"Discipline"> | string
    name?: StringFilter<"Discipline"> | string
    description?: StringNullableFilter<"Discipline"> | string | null
    color?: StringFilter<"Discipline"> | string
    isActive?: BoolFilter<"Discipline"> | boolean
    createdAt?: DateTimeFilter<"Discipline"> | Date | string
    updatedAt?: DateTimeFilter<"Discipline"> | Date | string
    schedule?: JsonNullableFilter<"Discipline">
    cancellationRules?: JsonNullableFilter<"Discipline">
    classes?: ClassSessionListRelationFilter
  }

  export type DisciplineOrderByWithRelationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    color?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    schedule?: SortOrderInput | SortOrder
    cancellationRules?: SortOrderInput | SortOrder
    classes?: ClassSessionOrderByRelationAggregateInput
  }

  export type DisciplineWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    organizationId_name?: DisciplineOrganizationIdNameCompoundUniqueInput
    AND?: DisciplineWhereInput | DisciplineWhereInput[]
    OR?: DisciplineWhereInput[]
    NOT?: DisciplineWhereInput | DisciplineWhereInput[]
    organizationId?: StringFilter<"Discipline"> | string
    name?: StringFilter<"Discipline"> | string
    description?: StringNullableFilter<"Discipline"> | string | null
    color?: StringFilter<"Discipline"> | string
    isActive?: BoolFilter<"Discipline"> | boolean
    createdAt?: DateTimeFilter<"Discipline"> | Date | string
    updatedAt?: DateTimeFilter<"Discipline"> | Date | string
    schedule?: JsonNullableFilter<"Discipline">
    cancellationRules?: JsonNullableFilter<"Discipline">
    classes?: ClassSessionListRelationFilter
  }, "id" | "organizationId_name">

  export type DisciplineOrderByWithAggregationInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    color?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    schedule?: SortOrderInput | SortOrder
    cancellationRules?: SortOrderInput | SortOrder
    _count?: DisciplineCountOrderByAggregateInput
    _max?: DisciplineMaxOrderByAggregateInput
    _min?: DisciplineMinOrderByAggregateInput
  }

  export type DisciplineScalarWhereWithAggregatesInput = {
    AND?: DisciplineScalarWhereWithAggregatesInput | DisciplineScalarWhereWithAggregatesInput[]
    OR?: DisciplineScalarWhereWithAggregatesInput[]
    NOT?: DisciplineScalarWhereWithAggregatesInput | DisciplineScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Discipline"> | string
    organizationId?: StringWithAggregatesFilter<"Discipline"> | string
    name?: StringWithAggregatesFilter<"Discipline"> | string
    description?: StringNullableWithAggregatesFilter<"Discipline"> | string | null
    color?: StringWithAggregatesFilter<"Discipline"> | string
    isActive?: BoolWithAggregatesFilter<"Discipline"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Discipline"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Discipline"> | Date | string
    schedule?: JsonNullableWithAggregatesFilter<"Discipline">
    cancellationRules?: JsonNullableWithAggregatesFilter<"Discipline">
  }

  export type InstructorWhereInput = {
    AND?: InstructorWhereInput | InstructorWhereInput[]
    OR?: InstructorWhereInput[]
    NOT?: InstructorWhereInput | InstructorWhereInput[]
    id?: StringFilter<"Instructor"> | string
    firstName?: StringFilter<"Instructor"> | string
    lastName?: StringFilter<"Instructor"> | string
    email?: StringFilter<"Instructor"> | string
    phone?: StringNullableFilter<"Instructor"> | string | null
    role?: StringFilter<"Instructor"> | string
    isActive?: BoolFilter<"Instructor"> | boolean
    createdAt?: DateTimeFilter<"Instructor"> | Date | string
    updatedAt?: DateTimeFilter<"Instructor"> | Date | string
    profile?: JsonNullableFilter<"Instructor">
    classes?: ClassSessionListRelationFilter
  }

  export type InstructorOrderByWithRelationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    profile?: SortOrderInput | SortOrder
    classes?: ClassSessionOrderByRelationAggregateInput
  }

  export type InstructorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: InstructorWhereInput | InstructorWhereInput[]
    OR?: InstructorWhereInput[]
    NOT?: InstructorWhereInput | InstructorWhereInput[]
    firstName?: StringFilter<"Instructor"> | string
    lastName?: StringFilter<"Instructor"> | string
    phone?: StringNullableFilter<"Instructor"> | string | null
    role?: StringFilter<"Instructor"> | string
    isActive?: BoolFilter<"Instructor"> | boolean
    createdAt?: DateTimeFilter<"Instructor"> | Date | string
    updatedAt?: DateTimeFilter<"Instructor"> | Date | string
    profile?: JsonNullableFilter<"Instructor">
    classes?: ClassSessionListRelationFilter
  }, "id" | "email">

  export type InstructorOrderByWithAggregationInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    phone?: SortOrderInput | SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    profile?: SortOrderInput | SortOrder
    _count?: InstructorCountOrderByAggregateInput
    _max?: InstructorMaxOrderByAggregateInput
    _min?: InstructorMinOrderByAggregateInput
  }

  export type InstructorScalarWhereWithAggregatesInput = {
    AND?: InstructorScalarWhereWithAggregatesInput | InstructorScalarWhereWithAggregatesInput[]
    OR?: InstructorScalarWhereWithAggregatesInput[]
    NOT?: InstructorScalarWhereWithAggregatesInput | InstructorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Instructor"> | string
    firstName?: StringWithAggregatesFilter<"Instructor"> | string
    lastName?: StringWithAggregatesFilter<"Instructor"> | string
    email?: StringWithAggregatesFilter<"Instructor"> | string
    phone?: StringNullableWithAggregatesFilter<"Instructor"> | string | null
    role?: StringWithAggregatesFilter<"Instructor"> | string
    isActive?: BoolWithAggregatesFilter<"Instructor"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Instructor"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Instructor"> | Date | string
    profile?: JsonNullableWithAggregatesFilter<"Instructor">
  }

  export type MembershipPlanWhereInput = {
    AND?: MembershipPlanWhereInput | MembershipPlanWhereInput[]
    OR?: MembershipPlanWhereInput[]
    NOT?: MembershipPlanWhereInput | MembershipPlanWhereInput[]
    id?: StringFilter<"MembershipPlan"> | string
    name?: StringFilter<"MembershipPlan"> | string
    description?: StringNullableFilter<"MembershipPlan"> | string | null
    price?: FloatFilter<"MembershipPlan"> | number
    duration?: IntFilter<"MembershipPlan"> | number
    isActive?: BoolFilter<"MembershipPlan"> | boolean
    createdAt?: DateTimeFilter<"MembershipPlan"> | Date | string
    updatedAt?: DateTimeFilter<"MembershipPlan"> | Date | string
    features?: JsonNullableFilter<"MembershipPlan">
    config?: JsonNullableFilter<"MembershipPlan">
  }

  export type MembershipPlanOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    price?: SortOrder
    duration?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    features?: SortOrderInput | SortOrder
    config?: SortOrderInput | SortOrder
  }

  export type MembershipPlanWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: MembershipPlanWhereInput | MembershipPlanWhereInput[]
    OR?: MembershipPlanWhereInput[]
    NOT?: MembershipPlanWhereInput | MembershipPlanWhereInput[]
    description?: StringNullableFilter<"MembershipPlan"> | string | null
    price?: FloatFilter<"MembershipPlan"> | number
    duration?: IntFilter<"MembershipPlan"> | number
    isActive?: BoolFilter<"MembershipPlan"> | boolean
    createdAt?: DateTimeFilter<"MembershipPlan"> | Date | string
    updatedAt?: DateTimeFilter<"MembershipPlan"> | Date | string
    features?: JsonNullableFilter<"MembershipPlan">
    config?: JsonNullableFilter<"MembershipPlan">
  }, "id" | "name">

  export type MembershipPlanOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrderInput | SortOrder
    price?: SortOrder
    duration?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    features?: SortOrderInput | SortOrder
    config?: SortOrderInput | SortOrder
    _count?: MembershipPlanCountOrderByAggregateInput
    _avg?: MembershipPlanAvgOrderByAggregateInput
    _max?: MembershipPlanMaxOrderByAggregateInput
    _min?: MembershipPlanMinOrderByAggregateInput
    _sum?: MembershipPlanSumOrderByAggregateInput
  }

  export type MembershipPlanScalarWhereWithAggregatesInput = {
    AND?: MembershipPlanScalarWhereWithAggregatesInput | MembershipPlanScalarWhereWithAggregatesInput[]
    OR?: MembershipPlanScalarWhereWithAggregatesInput[]
    NOT?: MembershipPlanScalarWhereWithAggregatesInput | MembershipPlanScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MembershipPlan"> | string
    name?: StringWithAggregatesFilter<"MembershipPlan"> | string
    description?: StringNullableWithAggregatesFilter<"MembershipPlan"> | string | null
    price?: FloatWithAggregatesFilter<"MembershipPlan"> | number
    duration?: IntWithAggregatesFilter<"MembershipPlan"> | number
    isActive?: BoolWithAggregatesFilter<"MembershipPlan"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"MembershipPlan"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MembershipPlan"> | Date | string
    features?: JsonNullableWithAggregatesFilter<"MembershipPlan">
    config?: JsonNullableWithAggregatesFilter<"MembershipPlan">
  }

  export type OrganizationWhereInput = {
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    id?: StringFilter<"Organization"> | string
    name?: StringFilter<"Organization"> | string
    settings?: JsonNullableFilter<"Organization">
    isActive?: BoolFilter<"Organization"> | boolean
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
  }

  export type OrganizationOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    settings?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: OrganizationWhereInput | OrganizationWhereInput[]
    OR?: OrganizationWhereInput[]
    NOT?: OrganizationWhereInput | OrganizationWhereInput[]
    name?: StringFilter<"Organization"> | string
    settings?: JsonNullableFilter<"Organization">
    isActive?: BoolFilter<"Organization"> | boolean
    createdAt?: DateTimeFilter<"Organization"> | Date | string
    updatedAt?: DateTimeFilter<"Organization"> | Date | string
  }, "id">

  export type OrganizationOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    settings?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrganizationCountOrderByAggregateInput
    _max?: OrganizationMaxOrderByAggregateInput
    _min?: OrganizationMinOrderByAggregateInput
  }

  export type OrganizationScalarWhereWithAggregatesInput = {
    AND?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    OR?: OrganizationScalarWhereWithAggregatesInput[]
    NOT?: OrganizationScalarWhereWithAggregatesInput | OrganizationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Organization"> | string
    name?: StringWithAggregatesFilter<"Organization"> | string
    settings?: JsonNullableWithAggregatesFilter<"Organization">
    isActive?: BoolWithAggregatesFilter<"Organization"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Organization"> | Date | string
  }

  export type ClassRegistrationWhereInput = {
    AND?: ClassRegistrationWhereInput | ClassRegistrationWhereInput[]
    OR?: ClassRegistrationWhereInput[]
    NOT?: ClassRegistrationWhereInput | ClassRegistrationWhereInput[]
    id?: StringFilter<"ClassRegistration"> | string
    userId?: StringFilter<"ClassRegistration"> | string
    classId?: StringFilter<"ClassRegistration"> | string
    status?: StringFilter<"ClassRegistration"> | string
    registeredAt?: DateTimeFilter<"ClassRegistration"> | Date | string
    cancelledAt?: DateTimeNullableFilter<"ClassRegistration"> | Date | string | null
    notes?: StringNullableFilter<"ClassRegistration"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    class?: XOR<ClassSessionScalarRelationFilter, ClassSessionWhereInput>
  }

  export type ClassRegistrationOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    classId?: SortOrder
    status?: SortOrder
    registeredAt?: SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
    class?: ClassSessionOrderByWithRelationInput
  }

  export type ClassRegistrationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_classId?: ClassRegistrationUserIdClassIdCompoundUniqueInput
    AND?: ClassRegistrationWhereInput | ClassRegistrationWhereInput[]
    OR?: ClassRegistrationWhereInput[]
    NOT?: ClassRegistrationWhereInput | ClassRegistrationWhereInput[]
    userId?: StringFilter<"ClassRegistration"> | string
    classId?: StringFilter<"ClassRegistration"> | string
    status?: StringFilter<"ClassRegistration"> | string
    registeredAt?: DateTimeFilter<"ClassRegistration"> | Date | string
    cancelledAt?: DateTimeNullableFilter<"ClassRegistration"> | Date | string | null
    notes?: StringNullableFilter<"ClassRegistration"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    class?: XOR<ClassSessionScalarRelationFilter, ClassSessionWhereInput>
  }, "id" | "userId_classId">

  export type ClassRegistrationOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    classId?: SortOrder
    status?: SortOrder
    registeredAt?: SortOrder
    cancelledAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    _count?: ClassRegistrationCountOrderByAggregateInput
    _max?: ClassRegistrationMaxOrderByAggregateInput
    _min?: ClassRegistrationMinOrderByAggregateInput
  }

  export type ClassRegistrationScalarWhereWithAggregatesInput = {
    AND?: ClassRegistrationScalarWhereWithAggregatesInput | ClassRegistrationScalarWhereWithAggregatesInput[]
    OR?: ClassRegistrationScalarWhereWithAggregatesInput[]
    NOT?: ClassRegistrationScalarWhereWithAggregatesInput | ClassRegistrationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ClassRegistration"> | string
    userId?: StringWithAggregatesFilter<"ClassRegistration"> | string
    classId?: StringWithAggregatesFilter<"ClassRegistration"> | string
    status?: StringWithAggregatesFilter<"ClassRegistration"> | string
    registeredAt?: DateTimeWithAggregatesFilter<"ClassRegistration"> | Date | string
    cancelledAt?: DateTimeNullableWithAggregatesFilter<"ClassRegistration"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"ClassRegistration"> | string | null
  }

  export type MembershipRenewalWhereInput = {
    AND?: MembershipRenewalWhereInput | MembershipRenewalWhereInput[]
    OR?: MembershipRenewalWhereInput[]
    NOT?: MembershipRenewalWhereInput | MembershipRenewalWhereInput[]
    id?: StringFilter<"MembershipRenewal"> | string
    userId?: StringFilter<"MembershipRenewal"> | string
    currentPlanId?: StringNullableFilter<"MembershipRenewal"> | string | null
    requestedPlanId?: StringNullableFilter<"MembershipRenewal"> | string | null
    status?: StringFilter<"MembershipRenewal"> | string
    requestedAt?: DateTimeFilter<"MembershipRenewal"> | Date | string
    processedAt?: DateTimeNullableFilter<"MembershipRenewal"> | Date | string | null
    notes?: StringNullableFilter<"MembershipRenewal"> | string | null
    renewalDetails?: JsonNullableFilter<"MembershipRenewal">
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type MembershipRenewalOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    currentPlanId?: SortOrderInput | SortOrder
    requestedPlanId?: SortOrderInput | SortOrder
    status?: SortOrder
    requestedAt?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    renewalDetails?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type MembershipRenewalWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: MembershipRenewalWhereInput | MembershipRenewalWhereInput[]
    OR?: MembershipRenewalWhereInput[]
    NOT?: MembershipRenewalWhereInput | MembershipRenewalWhereInput[]
    userId?: StringFilter<"MembershipRenewal"> | string
    currentPlanId?: StringNullableFilter<"MembershipRenewal"> | string | null
    requestedPlanId?: StringNullableFilter<"MembershipRenewal"> | string | null
    status?: StringFilter<"MembershipRenewal"> | string
    requestedAt?: DateTimeFilter<"MembershipRenewal"> | Date | string
    processedAt?: DateTimeNullableFilter<"MembershipRenewal"> | Date | string | null
    notes?: StringNullableFilter<"MembershipRenewal"> | string | null
    renewalDetails?: JsonNullableFilter<"MembershipRenewal">
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id">

  export type MembershipRenewalOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    currentPlanId?: SortOrderInput | SortOrder
    requestedPlanId?: SortOrderInput | SortOrder
    status?: SortOrder
    requestedAt?: SortOrder
    processedAt?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    renewalDetails?: SortOrderInput | SortOrder
    _count?: MembershipRenewalCountOrderByAggregateInput
    _max?: MembershipRenewalMaxOrderByAggregateInput
    _min?: MembershipRenewalMinOrderByAggregateInput
  }

  export type MembershipRenewalScalarWhereWithAggregatesInput = {
    AND?: MembershipRenewalScalarWhereWithAggregatesInput | MembershipRenewalScalarWhereWithAggregatesInput[]
    OR?: MembershipRenewalScalarWhereWithAggregatesInput[]
    NOT?: MembershipRenewalScalarWhereWithAggregatesInput | MembershipRenewalScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MembershipRenewal"> | string
    userId?: StringWithAggregatesFilter<"MembershipRenewal"> | string
    currentPlanId?: StringNullableWithAggregatesFilter<"MembershipRenewal"> | string | null
    requestedPlanId?: StringNullableWithAggregatesFilter<"MembershipRenewal"> | string | null
    status?: StringWithAggregatesFilter<"MembershipRenewal"> | string
    requestedAt?: DateTimeWithAggregatesFilter<"MembershipRenewal"> | Date | string
    processedAt?: DateTimeNullableWithAggregatesFilter<"MembershipRenewal"> | Date | string | null
    notes?: StringNullableWithAggregatesFilter<"MembershipRenewal"> | string | null
    renewalDetails?: JsonNullableWithAggregatesFilter<"MembershipRenewal">
  }

  export type SystemLogWhereInput = {
    AND?: SystemLogWhereInput | SystemLogWhereInput[]
    OR?: SystemLogWhereInput[]
    NOT?: SystemLogWhereInput | SystemLogWhereInput[]
    id?: StringFilter<"SystemLog"> | string
    level?: StringFilter<"SystemLog"> | string
    message?: StringFilter<"SystemLog"> | string
    context?: JsonNullableFilter<"SystemLog">
    timestamp?: DateTimeFilter<"SystemLog"> | Date | string
    operation?: StringNullableFilter<"SystemLog"> | string | null
    resource?: StringNullableFilter<"SystemLog"> | string | null
    userId?: StringNullableFilter<"SystemLog"> | string | null
    sessionId?: StringNullableFilter<"SystemLog"> | string | null
  }

  export type SystemLogOrderByWithRelationInput = {
    id?: SortOrder
    level?: SortOrder
    message?: SortOrder
    context?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    operation?: SortOrderInput | SortOrder
    resource?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    sessionId?: SortOrderInput | SortOrder
  }

  export type SystemLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SystemLogWhereInput | SystemLogWhereInput[]
    OR?: SystemLogWhereInput[]
    NOT?: SystemLogWhereInput | SystemLogWhereInput[]
    level?: StringFilter<"SystemLog"> | string
    message?: StringFilter<"SystemLog"> | string
    context?: JsonNullableFilter<"SystemLog">
    timestamp?: DateTimeFilter<"SystemLog"> | Date | string
    operation?: StringNullableFilter<"SystemLog"> | string | null
    resource?: StringNullableFilter<"SystemLog"> | string | null
    userId?: StringNullableFilter<"SystemLog"> | string | null
    sessionId?: StringNullableFilter<"SystemLog"> | string | null
  }, "id">

  export type SystemLogOrderByWithAggregationInput = {
    id?: SortOrder
    level?: SortOrder
    message?: SortOrder
    context?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    operation?: SortOrderInput | SortOrder
    resource?: SortOrderInput | SortOrder
    userId?: SortOrderInput | SortOrder
    sessionId?: SortOrderInput | SortOrder
    _count?: SystemLogCountOrderByAggregateInput
    _max?: SystemLogMaxOrderByAggregateInput
    _min?: SystemLogMinOrderByAggregateInput
  }

  export type SystemLogScalarWhereWithAggregatesInput = {
    AND?: SystemLogScalarWhereWithAggregatesInput | SystemLogScalarWhereWithAggregatesInput[]
    OR?: SystemLogScalarWhereWithAggregatesInput[]
    NOT?: SystemLogScalarWhereWithAggregatesInput | SystemLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SystemLog"> | string
    level?: StringWithAggregatesFilter<"SystemLog"> | string
    message?: StringWithAggregatesFilter<"SystemLog"> | string
    context?: JsonNullableWithAggregatesFilter<"SystemLog">
    timestamp?: DateTimeWithAggregatesFilter<"SystemLog"> | Date | string
    operation?: StringNullableWithAggregatesFilter<"SystemLog"> | string | null
    resource?: StringNullableWithAggregatesFilter<"SystemLog"> | string | null
    userId?: StringNullableWithAggregatesFilter<"SystemLog"> | string | null
    sessionId?: StringNullableWithAggregatesFilter<"SystemLog"> | string | null
  }

  export type PerformanceMetricWhereInput = {
    AND?: PerformanceMetricWhereInput | PerformanceMetricWhereInput[]
    OR?: PerformanceMetricWhereInput[]
    NOT?: PerformanceMetricWhereInput | PerformanceMetricWhereInput[]
    id?: StringFilter<"PerformanceMetric"> | string
    operation?: StringFilter<"PerformanceMetric"> | string
    resource?: StringFilter<"PerformanceMetric"> | string
    provider?: StringFilter<"PerformanceMetric"> | string
    duration?: IntFilter<"PerformanceMetric"> | number
    success?: BoolFilter<"PerformanceMetric"> | boolean
    recordCount?: IntNullableFilter<"PerformanceMetric"> | number | null
    cacheHit?: BoolNullableFilter<"PerformanceMetric"> | boolean | null
    timestamp?: DateTimeFilter<"PerformanceMetric"> | Date | string
    metadata?: JsonNullableFilter<"PerformanceMetric">
  }

  export type PerformanceMetricOrderByWithRelationInput = {
    id?: SortOrder
    operation?: SortOrder
    resource?: SortOrder
    provider?: SortOrder
    duration?: SortOrder
    success?: SortOrder
    recordCount?: SortOrderInput | SortOrder
    cacheHit?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    metadata?: SortOrderInput | SortOrder
  }

  export type PerformanceMetricWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PerformanceMetricWhereInput | PerformanceMetricWhereInput[]
    OR?: PerformanceMetricWhereInput[]
    NOT?: PerformanceMetricWhereInput | PerformanceMetricWhereInput[]
    operation?: StringFilter<"PerformanceMetric"> | string
    resource?: StringFilter<"PerformanceMetric"> | string
    provider?: StringFilter<"PerformanceMetric"> | string
    duration?: IntFilter<"PerformanceMetric"> | number
    success?: BoolFilter<"PerformanceMetric"> | boolean
    recordCount?: IntNullableFilter<"PerformanceMetric"> | number | null
    cacheHit?: BoolNullableFilter<"PerformanceMetric"> | boolean | null
    timestamp?: DateTimeFilter<"PerformanceMetric"> | Date | string
    metadata?: JsonNullableFilter<"PerformanceMetric">
  }, "id">

  export type PerformanceMetricOrderByWithAggregationInput = {
    id?: SortOrder
    operation?: SortOrder
    resource?: SortOrder
    provider?: SortOrder
    duration?: SortOrder
    success?: SortOrder
    recordCount?: SortOrderInput | SortOrder
    cacheHit?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    metadata?: SortOrderInput | SortOrder
    _count?: PerformanceMetricCountOrderByAggregateInput
    _avg?: PerformanceMetricAvgOrderByAggregateInput
    _max?: PerformanceMetricMaxOrderByAggregateInput
    _min?: PerformanceMetricMinOrderByAggregateInput
    _sum?: PerformanceMetricSumOrderByAggregateInput
  }

  export type PerformanceMetricScalarWhereWithAggregatesInput = {
    AND?: PerformanceMetricScalarWhereWithAggregatesInput | PerformanceMetricScalarWhereWithAggregatesInput[]
    OR?: PerformanceMetricScalarWhereWithAggregatesInput[]
    NOT?: PerformanceMetricScalarWhereWithAggregatesInput | PerformanceMetricScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PerformanceMetric"> | string
    operation?: StringWithAggregatesFilter<"PerformanceMetric"> | string
    resource?: StringWithAggregatesFilter<"PerformanceMetric"> | string
    provider?: StringWithAggregatesFilter<"PerformanceMetric"> | string
    duration?: IntWithAggregatesFilter<"PerformanceMetric"> | number
    success?: BoolWithAggregatesFilter<"PerformanceMetric"> | boolean
    recordCount?: IntNullableWithAggregatesFilter<"PerformanceMetric"> | number | null
    cacheHit?: BoolNullableWithAggregatesFilter<"PerformanceMetric"> | boolean | null
    timestamp?: DateTimeWithAggregatesFilter<"PerformanceMetric"> | Date | string
    metadata?: JsonNullableWithAggregatesFilter<"PerformanceMetric">
  }

  export type ExpenseWhereInput = {
    AND?: ExpenseWhereInput | ExpenseWhereInput[]
    OR?: ExpenseWhereInput[]
    NOT?: ExpenseWhereInput | ExpenseWhereInput[]
    id?: StringFilter<"Expense"> | string
    motivo?: StringFilter<"Expense"> | string
    fecha?: DateTimeFilter<"Expense"> | Date | string
    monto?: FloatFilter<"Expense"> | number
    createdAt?: DateTimeFilter<"Expense"> | Date | string
    updatedAt?: DateTimeFilter<"Expense"> | Date | string
  }

  export type ExpenseOrderByWithRelationInput = {
    id?: SortOrder
    motivo?: SortOrder
    fecha?: SortOrder
    monto?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ExpenseWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ExpenseWhereInput | ExpenseWhereInput[]
    OR?: ExpenseWhereInput[]
    NOT?: ExpenseWhereInput | ExpenseWhereInput[]
    motivo?: StringFilter<"Expense"> | string
    fecha?: DateTimeFilter<"Expense"> | Date | string
    monto?: FloatFilter<"Expense"> | number
    createdAt?: DateTimeFilter<"Expense"> | Date | string
    updatedAt?: DateTimeFilter<"Expense"> | Date | string
  }, "id">

  export type ExpenseOrderByWithAggregationInput = {
    id?: SortOrder
    motivo?: SortOrder
    fecha?: SortOrder
    monto?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ExpenseCountOrderByAggregateInput
    _avg?: ExpenseAvgOrderByAggregateInput
    _max?: ExpenseMaxOrderByAggregateInput
    _min?: ExpenseMinOrderByAggregateInput
    _sum?: ExpenseSumOrderByAggregateInput
  }

  export type ExpenseScalarWhereWithAggregatesInput = {
    AND?: ExpenseScalarWhereWithAggregatesInput | ExpenseScalarWhereWithAggregatesInput[]
    OR?: ExpenseScalarWhereWithAggregatesInput[]
    NOT?: ExpenseScalarWhereWithAggregatesInput | ExpenseScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Expense"> | string
    motivo?: StringWithAggregatesFilter<"Expense"> | string
    fecha?: DateTimeWithAggregatesFilter<"Expense"> | Date | string
    monto?: FloatWithAggregatesFilter<"Expense"> | number
    createdAt?: DateTimeWithAggregatesFilter<"Expense"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Expense"> | Date | string
  }

  export type InAppAlertWhereInput = {
    AND?: InAppAlertWhereInput | InAppAlertWhereInput[]
    OR?: InAppAlertWhereInput[]
    NOT?: InAppAlertWhereInput | InAppAlertWhereInput[]
    id?: StringFilter<"InAppAlert"> | string
    title?: StringFilter<"InAppAlert"> | string
    content?: StringFilter<"InAppAlert"> | string
    type?: StringFilter<"InAppAlert"> | string
    startDate?: DateTimeFilter<"InAppAlert"> | Date | string
    endDate?: DateTimeFilter<"InAppAlert"> | Date | string
    createdAt?: DateTimeFilter<"InAppAlert"> | Date | string
    updatedAt?: DateTimeFilter<"InAppAlert"> | Date | string
  }

  export type InAppAlertOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    type?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InAppAlertWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: InAppAlertWhereInput | InAppAlertWhereInput[]
    OR?: InAppAlertWhereInput[]
    NOT?: InAppAlertWhereInput | InAppAlertWhereInput[]
    title?: StringFilter<"InAppAlert"> | string
    content?: StringFilter<"InAppAlert"> | string
    type?: StringFilter<"InAppAlert"> | string
    startDate?: DateTimeFilter<"InAppAlert"> | Date | string
    endDate?: DateTimeFilter<"InAppAlert"> | Date | string
    createdAt?: DateTimeFilter<"InAppAlert"> | Date | string
    updatedAt?: DateTimeFilter<"InAppAlert"> | Date | string
  }, "id">

  export type InAppAlertOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    type?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: InAppAlertCountOrderByAggregateInput
    _max?: InAppAlertMaxOrderByAggregateInput
    _min?: InAppAlertMinOrderByAggregateInput
  }

  export type InAppAlertScalarWhereWithAggregatesInput = {
    AND?: InAppAlertScalarWhereWithAggregatesInput | InAppAlertScalarWhereWithAggregatesInput[]
    OR?: InAppAlertScalarWhereWithAggregatesInput[]
    NOT?: InAppAlertScalarWhereWithAggregatesInput | InAppAlertScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"InAppAlert"> | string
    title?: StringWithAggregatesFilter<"InAppAlert"> | string
    content?: StringWithAggregatesFilter<"InAppAlert"> | string
    type?: StringWithAggregatesFilter<"InAppAlert"> | string
    startDate?: DateTimeWithAggregatesFilter<"InAppAlert"> | Date | string
    endDate?: DateTimeWithAggregatesFilter<"InAppAlert"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"InAppAlert"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"InAppAlert"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    classRegistrations?: ClassRegistrationCreateNestedManyWithoutUserInput
    membershipRenewals?: MembershipRenewalCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    classRegistrations?: ClassRegistrationUncheckedCreateNestedManyWithoutUserInput
    membershipRenewals?: MembershipRenewalUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    classRegistrations?: ClassRegistrationUpdateManyWithoutUserNestedInput
    membershipRenewals?: MembershipRenewalUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    classRegistrations?: ClassRegistrationUncheckedUpdateManyWithoutUserNestedInput
    membershipRenewals?: MembershipRenewalUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ClassSessionCreateInput = {
    id?: string
    organizationId: string
    name: string
    dateTime: Date | string
    durationMinutes: number
    capacity: number
    registeredParticipantsIds?: ClassSessionCreateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionCreatewaitlistParticipantsIdsInput | string[]
    status?: string
    notes?: string | null
    isGenerated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    discipline: DisciplineCreateNestedOneWithoutClassesInput
    instructor: InstructorCreateNestedOneWithoutClassesInput
    registrations?: ClassRegistrationCreateNestedManyWithoutClassInput
  }

  export type ClassSessionUncheckedCreateInput = {
    id?: string
    organizationId: string
    disciplineId: string
    name: string
    dateTime: Date | string
    durationMinutes: number
    instructorId: string
    capacity: number
    registeredParticipantsIds?: ClassSessionCreateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionCreatewaitlistParticipantsIdsInput | string[]
    status?: string
    notes?: string | null
    isGenerated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    registrations?: ClassRegistrationUncheckedCreateNestedManyWithoutClassInput
  }

  export type ClassSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    discipline?: DisciplineUpdateOneRequiredWithoutClassesNestedInput
    instructor?: InstructorUpdateOneRequiredWithoutClassesNestedInput
    registrations?: ClassRegistrationUpdateManyWithoutClassNestedInput
  }

  export type ClassSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    disciplineId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    instructorId?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    registrations?: ClassRegistrationUncheckedUpdateManyWithoutClassNestedInput
  }

  export type ClassSessionCreateManyInput = {
    id?: string
    organizationId: string
    disciplineId: string
    name: string
    dateTime: Date | string
    durationMinutes: number
    instructorId: string
    capacity: number
    registeredParticipantsIds?: ClassSessionCreateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionCreatewaitlistParticipantsIdsInput | string[]
    status?: string
    notes?: string | null
    isGenerated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClassSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClassSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    disciplineId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    instructorId?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DisciplineCreateInput = {
    id?: string
    organizationId: string
    name: string
    description?: string | null
    color?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    schedule?: NullableJsonNullValueInput | InputJsonValue
    cancellationRules?: NullableJsonNullValueInput | InputJsonValue
    classes?: ClassSessionCreateNestedManyWithoutDisciplineInput
  }

  export type DisciplineUncheckedCreateInput = {
    id?: string
    organizationId: string
    name: string
    description?: string | null
    color?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    schedule?: NullableJsonNullValueInput | InputJsonValue
    cancellationRules?: NullableJsonNullValueInput | InputJsonValue
    classes?: ClassSessionUncheckedCreateNestedManyWithoutDisciplineInput
  }

  export type DisciplineUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: NullableJsonNullValueInput | InputJsonValue
    cancellationRules?: NullableJsonNullValueInput | InputJsonValue
    classes?: ClassSessionUpdateManyWithoutDisciplineNestedInput
  }

  export type DisciplineUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: NullableJsonNullValueInput | InputJsonValue
    cancellationRules?: NullableJsonNullValueInput | InputJsonValue
    classes?: ClassSessionUncheckedUpdateManyWithoutDisciplineNestedInput
  }

  export type DisciplineCreateManyInput = {
    id?: string
    organizationId: string
    name: string
    description?: string | null
    color?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    schedule?: NullableJsonNullValueInput | InputJsonValue
    cancellationRules?: NullableJsonNullValueInput | InputJsonValue
  }

  export type DisciplineUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: NullableJsonNullValueInput | InputJsonValue
    cancellationRules?: NullableJsonNullValueInput | InputJsonValue
  }

  export type DisciplineUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: NullableJsonNullValueInput | InputJsonValue
    cancellationRules?: NullableJsonNullValueInput | InputJsonValue
  }

  export type InstructorCreateInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    profile?: NullableJsonNullValueInput | InputJsonValue
    classes?: ClassSessionCreateNestedManyWithoutInstructorInput
  }

  export type InstructorUncheckedCreateInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    profile?: NullableJsonNullValueInput | InputJsonValue
    classes?: ClassSessionUncheckedCreateNestedManyWithoutInstructorInput
  }

  export type InstructorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: NullableJsonNullValueInput | InputJsonValue
    classes?: ClassSessionUpdateManyWithoutInstructorNestedInput
  }

  export type InstructorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: NullableJsonNullValueInput | InputJsonValue
    classes?: ClassSessionUncheckedUpdateManyWithoutInstructorNestedInput
  }

  export type InstructorCreateManyInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    profile?: NullableJsonNullValueInput | InputJsonValue
  }

  export type InstructorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: NullableJsonNullValueInput | InputJsonValue
  }

  export type InstructorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipPlanCreateInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    duration: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    features?: NullableJsonNullValueInput | InputJsonValue
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipPlanUncheckedCreateInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    duration: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    features?: NullableJsonNullValueInput | InputJsonValue
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipPlanUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: FloatFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    features?: NullableJsonNullValueInput | InputJsonValue
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipPlanUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: FloatFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    features?: NullableJsonNullValueInput | InputJsonValue
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipPlanCreateManyInput = {
    id?: string
    name: string
    description?: string | null
    price: number
    duration: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    features?: NullableJsonNullValueInput | InputJsonValue
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipPlanUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: FloatFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    features?: NullableJsonNullValueInput | InputJsonValue
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipPlanUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    price?: FloatFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    features?: NullableJsonNullValueInput | InputJsonValue
    config?: NullableJsonNullValueInput | InputJsonValue
  }

  export type OrganizationCreateInput = {
    id?: string
    name: string
    settings?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationUncheckedCreateInput = {
    id?: string
    name: string
    settings?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    settings?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    settings?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationCreateManyInput = {
    id?: string
    name: string
    settings?: NullableJsonNullValueInput | InputJsonValue
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrganizationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    settings?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrganizationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    settings?: NullableJsonNullValueInput | InputJsonValue
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClassRegistrationCreateInput = {
    id?: string
    status?: string
    registeredAt?: Date | string
    cancelledAt?: Date | string | null
    notes?: string | null
    user: UserCreateNestedOneWithoutClassRegistrationsInput
    class: ClassSessionCreateNestedOneWithoutRegistrationsInput
  }

  export type ClassRegistrationUncheckedCreateInput = {
    id?: string
    userId: string
    classId: string
    status?: string
    registeredAt?: Date | string
    cancelledAt?: Date | string | null
    notes?: string | null
  }

  export type ClassRegistrationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutClassRegistrationsNestedInput
    class?: ClassSessionUpdateOneRequiredWithoutRegistrationsNestedInput
  }

  export type ClassRegistrationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    classId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClassRegistrationCreateManyInput = {
    id?: string
    userId: string
    classId: string
    status?: string
    registeredAt?: Date | string
    cancelledAt?: Date | string | null
    notes?: string | null
  }

  export type ClassRegistrationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClassRegistrationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    classId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MembershipRenewalCreateInput = {
    id?: string
    currentPlanId?: string | null
    requestedPlanId?: string | null
    status?: string
    requestedAt?: Date | string
    processedAt?: Date | string | null
    notes?: string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
    user: UserCreateNestedOneWithoutMembershipRenewalsInput
  }

  export type MembershipRenewalUncheckedCreateInput = {
    id?: string
    userId: string
    currentPlanId?: string | null
    requestedPlanId?: string | null
    status?: string
    requestedAt?: Date | string
    processedAt?: Date | string | null
    notes?: string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipRenewalUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    requestedPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
    user?: UserUpdateOneRequiredWithoutMembershipRenewalsNestedInput
  }

  export type MembershipRenewalUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    currentPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    requestedPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipRenewalCreateManyInput = {
    id?: string
    userId: string
    currentPlanId?: string | null
    requestedPlanId?: string | null
    status?: string
    requestedAt?: Date | string
    processedAt?: Date | string | null
    notes?: string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipRenewalUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    requestedPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipRenewalUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    currentPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    requestedPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
  }

  export type SystemLogCreateInput = {
    id?: string
    level: string
    message: string
    context?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: Date | string
    operation?: string | null
    resource?: string | null
    userId?: string | null
    sessionId?: string | null
  }

  export type SystemLogUncheckedCreateInput = {
    id?: string
    level: string
    message: string
    context?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: Date | string
    operation?: string | null
    resource?: string | null
    userId?: string | null
    sessionId?: string | null
  }

  export type SystemLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    context?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    operation?: NullableStringFieldUpdateOperationsInput | string | null
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SystemLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    context?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    operation?: NullableStringFieldUpdateOperationsInput | string | null
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SystemLogCreateManyInput = {
    id?: string
    level: string
    message: string
    context?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: Date | string
    operation?: string | null
    resource?: string | null
    userId?: string | null
    sessionId?: string | null
  }

  export type SystemLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    context?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    operation?: NullableStringFieldUpdateOperationsInput | string | null
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SystemLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    level?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    context?: NullableJsonNullValueInput | InputJsonValue
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    operation?: NullableStringFieldUpdateOperationsInput | string | null
    resource?: NullableStringFieldUpdateOperationsInput | string | null
    userId?: NullableStringFieldUpdateOperationsInput | string | null
    sessionId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PerformanceMetricCreateInput = {
    id?: string
    operation: string
    resource: string
    provider: string
    duration: number
    success: boolean
    recordCount?: number | null
    cacheHit?: boolean | null
    timestamp?: Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PerformanceMetricUncheckedCreateInput = {
    id?: string
    operation: string
    resource: string
    provider: string
    duration: number
    success: boolean
    recordCount?: number | null
    cacheHit?: boolean | null
    timestamp?: Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PerformanceMetricUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    operation?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    success?: BoolFieldUpdateOperationsInput | boolean
    recordCount?: NullableIntFieldUpdateOperationsInput | number | null
    cacheHit?: NullableBoolFieldUpdateOperationsInput | boolean | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PerformanceMetricUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    operation?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    success?: BoolFieldUpdateOperationsInput | boolean
    recordCount?: NullableIntFieldUpdateOperationsInput | number | null
    cacheHit?: NullableBoolFieldUpdateOperationsInput | boolean | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PerformanceMetricCreateManyInput = {
    id?: string
    operation: string
    resource: string
    provider: string
    duration: number
    success: boolean
    recordCount?: number | null
    cacheHit?: boolean | null
    timestamp?: Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PerformanceMetricUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    operation?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    success?: BoolFieldUpdateOperationsInput | boolean
    recordCount?: NullableIntFieldUpdateOperationsInput | number | null
    cacheHit?: NullableBoolFieldUpdateOperationsInput | boolean | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type PerformanceMetricUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    operation?: StringFieldUpdateOperationsInput | string
    resource?: StringFieldUpdateOperationsInput | string
    provider?: StringFieldUpdateOperationsInput | string
    duration?: IntFieldUpdateOperationsInput | number
    success?: BoolFieldUpdateOperationsInput | boolean
    recordCount?: NullableIntFieldUpdateOperationsInput | number | null
    cacheHit?: NullableBoolFieldUpdateOperationsInput | boolean | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    metadata?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ExpenseCreateInput = {
    id?: string
    motivo: string
    fecha: Date | string
    monto: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ExpenseUncheckedCreateInput = {
    id?: string
    motivo: string
    fecha: Date | string
    monto: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ExpenseUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    motivo?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    monto?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    motivo?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    monto?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseCreateManyInput = {
    id?: string
    motivo: string
    fecha: Date | string
    monto: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ExpenseUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    motivo?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    monto?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ExpenseUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    motivo?: StringFieldUpdateOperationsInput | string
    fecha?: DateTimeFieldUpdateOperationsInput | Date | string
    monto?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InAppAlertCreateInput = {
    id?: string
    title: string
    content: string
    type: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InAppAlertUncheckedCreateInput = {
    id?: string
    title: string
    content: string
    type: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InAppAlertUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InAppAlertUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InAppAlertCreateManyInput = {
    id?: string
    title: string
    content: string
    type: string
    startDate: Date | string
    endDate: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type InAppAlertUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type InAppAlertUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    startDate?: DateTimeFieldUpdateOperationsInput | Date | string
    endDate?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ClassRegistrationListRelationFilter = {
    every?: ClassRegistrationWhereInput
    some?: ClassRegistrationWhereInput
    none?: ClassRegistrationWhereInput
  }

  export type MembershipRenewalListRelationFilter = {
    every?: MembershipRenewalWhereInput
    some?: MembershipRenewalWhereInput
    none?: MembershipRenewalWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ClassRegistrationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type MembershipRenewalOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    membership?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type DisciplineScalarRelationFilter = {
    is?: DisciplineWhereInput
    isNot?: DisciplineWhereInput
  }

  export type InstructorScalarRelationFilter = {
    is?: InstructorWhereInput
    isNot?: InstructorWhereInput
  }

  export type ClassSessionCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    disciplineId?: SortOrder
    name?: SortOrder
    dateTime?: SortOrder
    durationMinutes?: SortOrder
    instructorId?: SortOrder
    capacity?: SortOrder
    registeredParticipantsIds?: SortOrder
    waitlistParticipantsIds?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    isGenerated?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClassSessionAvgOrderByAggregateInput = {
    durationMinutes?: SortOrder
    capacity?: SortOrder
  }

  export type ClassSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    disciplineId?: SortOrder
    name?: SortOrder
    dateTime?: SortOrder
    durationMinutes?: SortOrder
    instructorId?: SortOrder
    capacity?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    isGenerated?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClassSessionMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    disciplineId?: SortOrder
    name?: SortOrder
    dateTime?: SortOrder
    durationMinutes?: SortOrder
    instructorId?: SortOrder
    capacity?: SortOrder
    status?: SortOrder
    notes?: SortOrder
    isGenerated?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClassSessionSumOrderByAggregateInput = {
    durationMinutes?: SortOrder
    capacity?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ClassSessionListRelationFilter = {
    every?: ClassSessionWhereInput
    some?: ClassSessionWhereInput
    none?: ClassSessionWhereInput
  }

  export type ClassSessionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type DisciplineOrganizationIdNameCompoundUniqueInput = {
    organizationId: string
    name: string
  }

  export type DisciplineCountOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    color?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    schedule?: SortOrder
    cancellationRules?: SortOrder
  }

  export type DisciplineMaxOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    color?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DisciplineMinOrderByAggregateInput = {
    id?: SortOrder
    organizationId?: SortOrder
    name?: SortOrder
    description?: SortOrder
    color?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InstructorCountOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    profile?: SortOrder
  }

  export type InstructorMaxOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InstructorMinOrderByAggregateInput = {
    id?: SortOrder
    firstName?: SortOrder
    lastName?: SortOrder
    email?: SortOrder
    phone?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type MembershipPlanCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    duration?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    features?: SortOrder
    config?: SortOrder
  }

  export type MembershipPlanAvgOrderByAggregateInput = {
    price?: SortOrder
    duration?: SortOrder
  }

  export type MembershipPlanMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    duration?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MembershipPlanMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    description?: SortOrder
    price?: SortOrder
    duration?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MembershipPlanSumOrderByAggregateInput = {
    price?: SortOrder
    duration?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type OrganizationCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    settings?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrganizationMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type ClassSessionScalarRelationFilter = {
    is?: ClassSessionWhereInput
    isNot?: ClassSessionWhereInput
  }

  export type ClassRegistrationUserIdClassIdCompoundUniqueInput = {
    userId: string
    classId: string
  }

  export type ClassRegistrationCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    classId?: SortOrder
    status?: SortOrder
    registeredAt?: SortOrder
    cancelledAt?: SortOrder
    notes?: SortOrder
  }

  export type ClassRegistrationMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    classId?: SortOrder
    status?: SortOrder
    registeredAt?: SortOrder
    cancelledAt?: SortOrder
    notes?: SortOrder
  }

  export type ClassRegistrationMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    classId?: SortOrder
    status?: SortOrder
    registeredAt?: SortOrder
    cancelledAt?: SortOrder
    notes?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type MembershipRenewalCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    currentPlanId?: SortOrder
    requestedPlanId?: SortOrder
    status?: SortOrder
    requestedAt?: SortOrder
    processedAt?: SortOrder
    notes?: SortOrder
    renewalDetails?: SortOrder
  }

  export type MembershipRenewalMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    currentPlanId?: SortOrder
    requestedPlanId?: SortOrder
    status?: SortOrder
    requestedAt?: SortOrder
    processedAt?: SortOrder
    notes?: SortOrder
  }

  export type MembershipRenewalMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    currentPlanId?: SortOrder
    requestedPlanId?: SortOrder
    status?: SortOrder
    requestedAt?: SortOrder
    processedAt?: SortOrder
    notes?: SortOrder
  }

  export type SystemLogCountOrderByAggregateInput = {
    id?: SortOrder
    level?: SortOrder
    message?: SortOrder
    context?: SortOrder
    timestamp?: SortOrder
    operation?: SortOrder
    resource?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
  }

  export type SystemLogMaxOrderByAggregateInput = {
    id?: SortOrder
    level?: SortOrder
    message?: SortOrder
    timestamp?: SortOrder
    operation?: SortOrder
    resource?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
  }

  export type SystemLogMinOrderByAggregateInput = {
    id?: SortOrder
    level?: SortOrder
    message?: SortOrder
    timestamp?: SortOrder
    operation?: SortOrder
    resource?: SortOrder
    userId?: SortOrder
    sessionId?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type PerformanceMetricCountOrderByAggregateInput = {
    id?: SortOrder
    operation?: SortOrder
    resource?: SortOrder
    provider?: SortOrder
    duration?: SortOrder
    success?: SortOrder
    recordCount?: SortOrder
    cacheHit?: SortOrder
    timestamp?: SortOrder
    metadata?: SortOrder
  }

  export type PerformanceMetricAvgOrderByAggregateInput = {
    duration?: SortOrder
    recordCount?: SortOrder
  }

  export type PerformanceMetricMaxOrderByAggregateInput = {
    id?: SortOrder
    operation?: SortOrder
    resource?: SortOrder
    provider?: SortOrder
    duration?: SortOrder
    success?: SortOrder
    recordCount?: SortOrder
    cacheHit?: SortOrder
    timestamp?: SortOrder
  }

  export type PerformanceMetricMinOrderByAggregateInput = {
    id?: SortOrder
    operation?: SortOrder
    resource?: SortOrder
    provider?: SortOrder
    duration?: SortOrder
    success?: SortOrder
    recordCount?: SortOrder
    cacheHit?: SortOrder
    timestamp?: SortOrder
  }

  export type PerformanceMetricSumOrderByAggregateInput = {
    duration?: SortOrder
    recordCount?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type ExpenseCountOrderByAggregateInput = {
    id?: SortOrder
    motivo?: SortOrder
    fecha?: SortOrder
    monto?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ExpenseAvgOrderByAggregateInput = {
    monto?: SortOrder
  }

  export type ExpenseMaxOrderByAggregateInput = {
    id?: SortOrder
    motivo?: SortOrder
    fecha?: SortOrder
    monto?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ExpenseMinOrderByAggregateInput = {
    id?: SortOrder
    motivo?: SortOrder
    fecha?: SortOrder
    monto?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ExpenseSumOrderByAggregateInput = {
    monto?: SortOrder
  }

  export type InAppAlertCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    type?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InAppAlertMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    type?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type InAppAlertMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    content?: SortOrder
    type?: SortOrder
    startDate?: SortOrder
    endDate?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ClassRegistrationCreateNestedManyWithoutUserInput = {
    create?: XOR<ClassRegistrationCreateWithoutUserInput, ClassRegistrationUncheckedCreateWithoutUserInput> | ClassRegistrationCreateWithoutUserInput[] | ClassRegistrationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClassRegistrationCreateOrConnectWithoutUserInput | ClassRegistrationCreateOrConnectWithoutUserInput[]
    createMany?: ClassRegistrationCreateManyUserInputEnvelope
    connect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
  }

  export type MembershipRenewalCreateNestedManyWithoutUserInput = {
    create?: XOR<MembershipRenewalCreateWithoutUserInput, MembershipRenewalUncheckedCreateWithoutUserInput> | MembershipRenewalCreateWithoutUserInput[] | MembershipRenewalUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MembershipRenewalCreateOrConnectWithoutUserInput | MembershipRenewalCreateOrConnectWithoutUserInput[]
    createMany?: MembershipRenewalCreateManyUserInputEnvelope
    connect?: MembershipRenewalWhereUniqueInput | MembershipRenewalWhereUniqueInput[]
  }

  export type ClassRegistrationUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<ClassRegistrationCreateWithoutUserInput, ClassRegistrationUncheckedCreateWithoutUserInput> | ClassRegistrationCreateWithoutUserInput[] | ClassRegistrationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClassRegistrationCreateOrConnectWithoutUserInput | ClassRegistrationCreateOrConnectWithoutUserInput[]
    createMany?: ClassRegistrationCreateManyUserInputEnvelope
    connect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
  }

  export type MembershipRenewalUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<MembershipRenewalCreateWithoutUserInput, MembershipRenewalUncheckedCreateWithoutUserInput> | MembershipRenewalCreateWithoutUserInput[] | MembershipRenewalUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MembershipRenewalCreateOrConnectWithoutUserInput | MembershipRenewalCreateOrConnectWithoutUserInput[]
    createMany?: MembershipRenewalCreateManyUserInputEnvelope
    connect?: MembershipRenewalWhereUniqueInput | MembershipRenewalWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ClassRegistrationUpdateManyWithoutUserNestedInput = {
    create?: XOR<ClassRegistrationCreateWithoutUserInput, ClassRegistrationUncheckedCreateWithoutUserInput> | ClassRegistrationCreateWithoutUserInput[] | ClassRegistrationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClassRegistrationCreateOrConnectWithoutUserInput | ClassRegistrationCreateOrConnectWithoutUserInput[]
    upsert?: ClassRegistrationUpsertWithWhereUniqueWithoutUserInput | ClassRegistrationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ClassRegistrationCreateManyUserInputEnvelope
    set?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    disconnect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    delete?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    connect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    update?: ClassRegistrationUpdateWithWhereUniqueWithoutUserInput | ClassRegistrationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ClassRegistrationUpdateManyWithWhereWithoutUserInput | ClassRegistrationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ClassRegistrationScalarWhereInput | ClassRegistrationScalarWhereInput[]
  }

  export type MembershipRenewalUpdateManyWithoutUserNestedInput = {
    create?: XOR<MembershipRenewalCreateWithoutUserInput, MembershipRenewalUncheckedCreateWithoutUserInput> | MembershipRenewalCreateWithoutUserInput[] | MembershipRenewalUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MembershipRenewalCreateOrConnectWithoutUserInput | MembershipRenewalCreateOrConnectWithoutUserInput[]
    upsert?: MembershipRenewalUpsertWithWhereUniqueWithoutUserInput | MembershipRenewalUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MembershipRenewalCreateManyUserInputEnvelope
    set?: MembershipRenewalWhereUniqueInput | MembershipRenewalWhereUniqueInput[]
    disconnect?: MembershipRenewalWhereUniqueInput | MembershipRenewalWhereUniqueInput[]
    delete?: MembershipRenewalWhereUniqueInput | MembershipRenewalWhereUniqueInput[]
    connect?: MembershipRenewalWhereUniqueInput | MembershipRenewalWhereUniqueInput[]
    update?: MembershipRenewalUpdateWithWhereUniqueWithoutUserInput | MembershipRenewalUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MembershipRenewalUpdateManyWithWhereWithoutUserInput | MembershipRenewalUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MembershipRenewalScalarWhereInput | MembershipRenewalScalarWhereInput[]
  }

  export type ClassRegistrationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<ClassRegistrationCreateWithoutUserInput, ClassRegistrationUncheckedCreateWithoutUserInput> | ClassRegistrationCreateWithoutUserInput[] | ClassRegistrationUncheckedCreateWithoutUserInput[]
    connectOrCreate?: ClassRegistrationCreateOrConnectWithoutUserInput | ClassRegistrationCreateOrConnectWithoutUserInput[]
    upsert?: ClassRegistrationUpsertWithWhereUniqueWithoutUserInput | ClassRegistrationUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: ClassRegistrationCreateManyUserInputEnvelope
    set?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    disconnect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    delete?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    connect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    update?: ClassRegistrationUpdateWithWhereUniqueWithoutUserInput | ClassRegistrationUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: ClassRegistrationUpdateManyWithWhereWithoutUserInput | ClassRegistrationUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: ClassRegistrationScalarWhereInput | ClassRegistrationScalarWhereInput[]
  }

  export type MembershipRenewalUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<MembershipRenewalCreateWithoutUserInput, MembershipRenewalUncheckedCreateWithoutUserInput> | MembershipRenewalCreateWithoutUserInput[] | MembershipRenewalUncheckedCreateWithoutUserInput[]
    connectOrCreate?: MembershipRenewalCreateOrConnectWithoutUserInput | MembershipRenewalCreateOrConnectWithoutUserInput[]
    upsert?: MembershipRenewalUpsertWithWhereUniqueWithoutUserInput | MembershipRenewalUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: MembershipRenewalCreateManyUserInputEnvelope
    set?: MembershipRenewalWhereUniqueInput | MembershipRenewalWhereUniqueInput[]
    disconnect?: MembershipRenewalWhereUniqueInput | MembershipRenewalWhereUniqueInput[]
    delete?: MembershipRenewalWhereUniqueInput | MembershipRenewalWhereUniqueInput[]
    connect?: MembershipRenewalWhereUniqueInput | MembershipRenewalWhereUniqueInput[]
    update?: MembershipRenewalUpdateWithWhereUniqueWithoutUserInput | MembershipRenewalUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: MembershipRenewalUpdateManyWithWhereWithoutUserInput | MembershipRenewalUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: MembershipRenewalScalarWhereInput | MembershipRenewalScalarWhereInput[]
  }

  export type ClassSessionCreateregisteredParticipantsIdsInput = {
    set: string[]
  }

  export type ClassSessionCreatewaitlistParticipantsIdsInput = {
    set: string[]
  }

  export type DisciplineCreateNestedOneWithoutClassesInput = {
    create?: XOR<DisciplineCreateWithoutClassesInput, DisciplineUncheckedCreateWithoutClassesInput>
    connectOrCreate?: DisciplineCreateOrConnectWithoutClassesInput
    connect?: DisciplineWhereUniqueInput
  }

  export type InstructorCreateNestedOneWithoutClassesInput = {
    create?: XOR<InstructorCreateWithoutClassesInput, InstructorUncheckedCreateWithoutClassesInput>
    connectOrCreate?: InstructorCreateOrConnectWithoutClassesInput
    connect?: InstructorWhereUniqueInput
  }

  export type ClassRegistrationCreateNestedManyWithoutClassInput = {
    create?: XOR<ClassRegistrationCreateWithoutClassInput, ClassRegistrationUncheckedCreateWithoutClassInput> | ClassRegistrationCreateWithoutClassInput[] | ClassRegistrationUncheckedCreateWithoutClassInput[]
    connectOrCreate?: ClassRegistrationCreateOrConnectWithoutClassInput | ClassRegistrationCreateOrConnectWithoutClassInput[]
    createMany?: ClassRegistrationCreateManyClassInputEnvelope
    connect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
  }

  export type ClassRegistrationUncheckedCreateNestedManyWithoutClassInput = {
    create?: XOR<ClassRegistrationCreateWithoutClassInput, ClassRegistrationUncheckedCreateWithoutClassInput> | ClassRegistrationCreateWithoutClassInput[] | ClassRegistrationUncheckedCreateWithoutClassInput[]
    connectOrCreate?: ClassRegistrationCreateOrConnectWithoutClassInput | ClassRegistrationCreateOrConnectWithoutClassInput[]
    createMany?: ClassRegistrationCreateManyClassInputEnvelope
    connect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type ClassSessionUpdateregisteredParticipantsIdsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ClassSessionUpdatewaitlistParticipantsIdsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type DisciplineUpdateOneRequiredWithoutClassesNestedInput = {
    create?: XOR<DisciplineCreateWithoutClassesInput, DisciplineUncheckedCreateWithoutClassesInput>
    connectOrCreate?: DisciplineCreateOrConnectWithoutClassesInput
    upsert?: DisciplineUpsertWithoutClassesInput
    connect?: DisciplineWhereUniqueInput
    update?: XOR<XOR<DisciplineUpdateToOneWithWhereWithoutClassesInput, DisciplineUpdateWithoutClassesInput>, DisciplineUncheckedUpdateWithoutClassesInput>
  }

  export type InstructorUpdateOneRequiredWithoutClassesNestedInput = {
    create?: XOR<InstructorCreateWithoutClassesInput, InstructorUncheckedCreateWithoutClassesInput>
    connectOrCreate?: InstructorCreateOrConnectWithoutClassesInput
    upsert?: InstructorUpsertWithoutClassesInput
    connect?: InstructorWhereUniqueInput
    update?: XOR<XOR<InstructorUpdateToOneWithWhereWithoutClassesInput, InstructorUpdateWithoutClassesInput>, InstructorUncheckedUpdateWithoutClassesInput>
  }

  export type ClassRegistrationUpdateManyWithoutClassNestedInput = {
    create?: XOR<ClassRegistrationCreateWithoutClassInput, ClassRegistrationUncheckedCreateWithoutClassInput> | ClassRegistrationCreateWithoutClassInput[] | ClassRegistrationUncheckedCreateWithoutClassInput[]
    connectOrCreate?: ClassRegistrationCreateOrConnectWithoutClassInput | ClassRegistrationCreateOrConnectWithoutClassInput[]
    upsert?: ClassRegistrationUpsertWithWhereUniqueWithoutClassInput | ClassRegistrationUpsertWithWhereUniqueWithoutClassInput[]
    createMany?: ClassRegistrationCreateManyClassInputEnvelope
    set?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    disconnect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    delete?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    connect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    update?: ClassRegistrationUpdateWithWhereUniqueWithoutClassInput | ClassRegistrationUpdateWithWhereUniqueWithoutClassInput[]
    updateMany?: ClassRegistrationUpdateManyWithWhereWithoutClassInput | ClassRegistrationUpdateManyWithWhereWithoutClassInput[]
    deleteMany?: ClassRegistrationScalarWhereInput | ClassRegistrationScalarWhereInput[]
  }

  export type ClassRegistrationUncheckedUpdateManyWithoutClassNestedInput = {
    create?: XOR<ClassRegistrationCreateWithoutClassInput, ClassRegistrationUncheckedCreateWithoutClassInput> | ClassRegistrationCreateWithoutClassInput[] | ClassRegistrationUncheckedCreateWithoutClassInput[]
    connectOrCreate?: ClassRegistrationCreateOrConnectWithoutClassInput | ClassRegistrationCreateOrConnectWithoutClassInput[]
    upsert?: ClassRegistrationUpsertWithWhereUniqueWithoutClassInput | ClassRegistrationUpsertWithWhereUniqueWithoutClassInput[]
    createMany?: ClassRegistrationCreateManyClassInputEnvelope
    set?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    disconnect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    delete?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    connect?: ClassRegistrationWhereUniqueInput | ClassRegistrationWhereUniqueInput[]
    update?: ClassRegistrationUpdateWithWhereUniqueWithoutClassInput | ClassRegistrationUpdateWithWhereUniqueWithoutClassInput[]
    updateMany?: ClassRegistrationUpdateManyWithWhereWithoutClassInput | ClassRegistrationUpdateManyWithWhereWithoutClassInput[]
    deleteMany?: ClassRegistrationScalarWhereInput | ClassRegistrationScalarWhereInput[]
  }

  export type ClassSessionCreateNestedManyWithoutDisciplineInput = {
    create?: XOR<ClassSessionCreateWithoutDisciplineInput, ClassSessionUncheckedCreateWithoutDisciplineInput> | ClassSessionCreateWithoutDisciplineInput[] | ClassSessionUncheckedCreateWithoutDisciplineInput[]
    connectOrCreate?: ClassSessionCreateOrConnectWithoutDisciplineInput | ClassSessionCreateOrConnectWithoutDisciplineInput[]
    createMany?: ClassSessionCreateManyDisciplineInputEnvelope
    connect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
  }

  export type ClassSessionUncheckedCreateNestedManyWithoutDisciplineInput = {
    create?: XOR<ClassSessionCreateWithoutDisciplineInput, ClassSessionUncheckedCreateWithoutDisciplineInput> | ClassSessionCreateWithoutDisciplineInput[] | ClassSessionUncheckedCreateWithoutDisciplineInput[]
    connectOrCreate?: ClassSessionCreateOrConnectWithoutDisciplineInput | ClassSessionCreateOrConnectWithoutDisciplineInput[]
    createMany?: ClassSessionCreateManyDisciplineInputEnvelope
    connect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
  }

  export type ClassSessionUpdateManyWithoutDisciplineNestedInput = {
    create?: XOR<ClassSessionCreateWithoutDisciplineInput, ClassSessionUncheckedCreateWithoutDisciplineInput> | ClassSessionCreateWithoutDisciplineInput[] | ClassSessionUncheckedCreateWithoutDisciplineInput[]
    connectOrCreate?: ClassSessionCreateOrConnectWithoutDisciplineInput | ClassSessionCreateOrConnectWithoutDisciplineInput[]
    upsert?: ClassSessionUpsertWithWhereUniqueWithoutDisciplineInput | ClassSessionUpsertWithWhereUniqueWithoutDisciplineInput[]
    createMany?: ClassSessionCreateManyDisciplineInputEnvelope
    set?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    disconnect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    delete?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    connect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    update?: ClassSessionUpdateWithWhereUniqueWithoutDisciplineInput | ClassSessionUpdateWithWhereUniqueWithoutDisciplineInput[]
    updateMany?: ClassSessionUpdateManyWithWhereWithoutDisciplineInput | ClassSessionUpdateManyWithWhereWithoutDisciplineInput[]
    deleteMany?: ClassSessionScalarWhereInput | ClassSessionScalarWhereInput[]
  }

  export type ClassSessionUncheckedUpdateManyWithoutDisciplineNestedInput = {
    create?: XOR<ClassSessionCreateWithoutDisciplineInput, ClassSessionUncheckedCreateWithoutDisciplineInput> | ClassSessionCreateWithoutDisciplineInput[] | ClassSessionUncheckedCreateWithoutDisciplineInput[]
    connectOrCreate?: ClassSessionCreateOrConnectWithoutDisciplineInput | ClassSessionCreateOrConnectWithoutDisciplineInput[]
    upsert?: ClassSessionUpsertWithWhereUniqueWithoutDisciplineInput | ClassSessionUpsertWithWhereUniqueWithoutDisciplineInput[]
    createMany?: ClassSessionCreateManyDisciplineInputEnvelope
    set?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    disconnect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    delete?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    connect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    update?: ClassSessionUpdateWithWhereUniqueWithoutDisciplineInput | ClassSessionUpdateWithWhereUniqueWithoutDisciplineInput[]
    updateMany?: ClassSessionUpdateManyWithWhereWithoutDisciplineInput | ClassSessionUpdateManyWithWhereWithoutDisciplineInput[]
    deleteMany?: ClassSessionScalarWhereInput | ClassSessionScalarWhereInput[]
  }

  export type ClassSessionCreateNestedManyWithoutInstructorInput = {
    create?: XOR<ClassSessionCreateWithoutInstructorInput, ClassSessionUncheckedCreateWithoutInstructorInput> | ClassSessionCreateWithoutInstructorInput[] | ClassSessionUncheckedCreateWithoutInstructorInput[]
    connectOrCreate?: ClassSessionCreateOrConnectWithoutInstructorInput | ClassSessionCreateOrConnectWithoutInstructorInput[]
    createMany?: ClassSessionCreateManyInstructorInputEnvelope
    connect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
  }

  export type ClassSessionUncheckedCreateNestedManyWithoutInstructorInput = {
    create?: XOR<ClassSessionCreateWithoutInstructorInput, ClassSessionUncheckedCreateWithoutInstructorInput> | ClassSessionCreateWithoutInstructorInput[] | ClassSessionUncheckedCreateWithoutInstructorInput[]
    connectOrCreate?: ClassSessionCreateOrConnectWithoutInstructorInput | ClassSessionCreateOrConnectWithoutInstructorInput[]
    createMany?: ClassSessionCreateManyInstructorInputEnvelope
    connect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
  }

  export type ClassSessionUpdateManyWithoutInstructorNestedInput = {
    create?: XOR<ClassSessionCreateWithoutInstructorInput, ClassSessionUncheckedCreateWithoutInstructorInput> | ClassSessionCreateWithoutInstructorInput[] | ClassSessionUncheckedCreateWithoutInstructorInput[]
    connectOrCreate?: ClassSessionCreateOrConnectWithoutInstructorInput | ClassSessionCreateOrConnectWithoutInstructorInput[]
    upsert?: ClassSessionUpsertWithWhereUniqueWithoutInstructorInput | ClassSessionUpsertWithWhereUniqueWithoutInstructorInput[]
    createMany?: ClassSessionCreateManyInstructorInputEnvelope
    set?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    disconnect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    delete?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    connect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    update?: ClassSessionUpdateWithWhereUniqueWithoutInstructorInput | ClassSessionUpdateWithWhereUniqueWithoutInstructorInput[]
    updateMany?: ClassSessionUpdateManyWithWhereWithoutInstructorInput | ClassSessionUpdateManyWithWhereWithoutInstructorInput[]
    deleteMany?: ClassSessionScalarWhereInput | ClassSessionScalarWhereInput[]
  }

  export type ClassSessionUncheckedUpdateManyWithoutInstructorNestedInput = {
    create?: XOR<ClassSessionCreateWithoutInstructorInput, ClassSessionUncheckedCreateWithoutInstructorInput> | ClassSessionCreateWithoutInstructorInput[] | ClassSessionUncheckedCreateWithoutInstructorInput[]
    connectOrCreate?: ClassSessionCreateOrConnectWithoutInstructorInput | ClassSessionCreateOrConnectWithoutInstructorInput[]
    upsert?: ClassSessionUpsertWithWhereUniqueWithoutInstructorInput | ClassSessionUpsertWithWhereUniqueWithoutInstructorInput[]
    createMany?: ClassSessionCreateManyInstructorInputEnvelope
    set?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    disconnect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    delete?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    connect?: ClassSessionWhereUniqueInput | ClassSessionWhereUniqueInput[]
    update?: ClassSessionUpdateWithWhereUniqueWithoutInstructorInput | ClassSessionUpdateWithWhereUniqueWithoutInstructorInput[]
    updateMany?: ClassSessionUpdateManyWithWhereWithoutInstructorInput | ClassSessionUpdateManyWithWhereWithoutInstructorInput[]
    deleteMany?: ClassSessionScalarWhereInput | ClassSessionScalarWhereInput[]
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserCreateNestedOneWithoutClassRegistrationsInput = {
    create?: XOR<UserCreateWithoutClassRegistrationsInput, UserUncheckedCreateWithoutClassRegistrationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutClassRegistrationsInput
    connect?: UserWhereUniqueInput
  }

  export type ClassSessionCreateNestedOneWithoutRegistrationsInput = {
    create?: XOR<ClassSessionCreateWithoutRegistrationsInput, ClassSessionUncheckedCreateWithoutRegistrationsInput>
    connectOrCreate?: ClassSessionCreateOrConnectWithoutRegistrationsInput
    connect?: ClassSessionWhereUniqueInput
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserUpdateOneRequiredWithoutClassRegistrationsNestedInput = {
    create?: XOR<UserCreateWithoutClassRegistrationsInput, UserUncheckedCreateWithoutClassRegistrationsInput>
    connectOrCreate?: UserCreateOrConnectWithoutClassRegistrationsInput
    upsert?: UserUpsertWithoutClassRegistrationsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutClassRegistrationsInput, UserUpdateWithoutClassRegistrationsInput>, UserUncheckedUpdateWithoutClassRegistrationsInput>
  }

  export type ClassSessionUpdateOneRequiredWithoutRegistrationsNestedInput = {
    create?: XOR<ClassSessionCreateWithoutRegistrationsInput, ClassSessionUncheckedCreateWithoutRegistrationsInput>
    connectOrCreate?: ClassSessionCreateOrConnectWithoutRegistrationsInput
    upsert?: ClassSessionUpsertWithoutRegistrationsInput
    connect?: ClassSessionWhereUniqueInput
    update?: XOR<XOR<ClassSessionUpdateToOneWithWhereWithoutRegistrationsInput, ClassSessionUpdateWithoutRegistrationsInput>, ClassSessionUncheckedUpdateWithoutRegistrationsInput>
  }

  export type UserCreateNestedOneWithoutMembershipRenewalsInput = {
    create?: XOR<UserCreateWithoutMembershipRenewalsInput, UserUncheckedCreateWithoutMembershipRenewalsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMembershipRenewalsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutMembershipRenewalsNestedInput = {
    create?: XOR<UserCreateWithoutMembershipRenewalsInput, UserUncheckedCreateWithoutMembershipRenewalsInput>
    connectOrCreate?: UserCreateOrConnectWithoutMembershipRenewalsInput
    upsert?: UserUpsertWithoutMembershipRenewalsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutMembershipRenewalsInput, UserUpdateWithoutMembershipRenewalsInput>, UserUncheckedUpdateWithoutMembershipRenewalsInput>
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type ClassRegistrationCreateWithoutUserInput = {
    id?: string
    status?: string
    registeredAt?: Date | string
    cancelledAt?: Date | string | null
    notes?: string | null
    class: ClassSessionCreateNestedOneWithoutRegistrationsInput
  }

  export type ClassRegistrationUncheckedCreateWithoutUserInput = {
    id?: string
    classId: string
    status?: string
    registeredAt?: Date | string
    cancelledAt?: Date | string | null
    notes?: string | null
  }

  export type ClassRegistrationCreateOrConnectWithoutUserInput = {
    where: ClassRegistrationWhereUniqueInput
    create: XOR<ClassRegistrationCreateWithoutUserInput, ClassRegistrationUncheckedCreateWithoutUserInput>
  }

  export type ClassRegistrationCreateManyUserInputEnvelope = {
    data: ClassRegistrationCreateManyUserInput | ClassRegistrationCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type MembershipRenewalCreateWithoutUserInput = {
    id?: string
    currentPlanId?: string | null
    requestedPlanId?: string | null
    status?: string
    requestedAt?: Date | string
    processedAt?: Date | string | null
    notes?: string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipRenewalUncheckedCreateWithoutUserInput = {
    id?: string
    currentPlanId?: string | null
    requestedPlanId?: string | null
    status?: string
    requestedAt?: Date | string
    processedAt?: Date | string | null
    notes?: string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipRenewalCreateOrConnectWithoutUserInput = {
    where: MembershipRenewalWhereUniqueInput
    create: XOR<MembershipRenewalCreateWithoutUserInput, MembershipRenewalUncheckedCreateWithoutUserInput>
  }

  export type MembershipRenewalCreateManyUserInputEnvelope = {
    data: MembershipRenewalCreateManyUserInput | MembershipRenewalCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type ClassRegistrationUpsertWithWhereUniqueWithoutUserInput = {
    where: ClassRegistrationWhereUniqueInput
    update: XOR<ClassRegistrationUpdateWithoutUserInput, ClassRegistrationUncheckedUpdateWithoutUserInput>
    create: XOR<ClassRegistrationCreateWithoutUserInput, ClassRegistrationUncheckedCreateWithoutUserInput>
  }

  export type ClassRegistrationUpdateWithWhereUniqueWithoutUserInput = {
    where: ClassRegistrationWhereUniqueInput
    data: XOR<ClassRegistrationUpdateWithoutUserInput, ClassRegistrationUncheckedUpdateWithoutUserInput>
  }

  export type ClassRegistrationUpdateManyWithWhereWithoutUserInput = {
    where: ClassRegistrationScalarWhereInput
    data: XOR<ClassRegistrationUpdateManyMutationInput, ClassRegistrationUncheckedUpdateManyWithoutUserInput>
  }

  export type ClassRegistrationScalarWhereInput = {
    AND?: ClassRegistrationScalarWhereInput | ClassRegistrationScalarWhereInput[]
    OR?: ClassRegistrationScalarWhereInput[]
    NOT?: ClassRegistrationScalarWhereInput | ClassRegistrationScalarWhereInput[]
    id?: StringFilter<"ClassRegistration"> | string
    userId?: StringFilter<"ClassRegistration"> | string
    classId?: StringFilter<"ClassRegistration"> | string
    status?: StringFilter<"ClassRegistration"> | string
    registeredAt?: DateTimeFilter<"ClassRegistration"> | Date | string
    cancelledAt?: DateTimeNullableFilter<"ClassRegistration"> | Date | string | null
    notes?: StringNullableFilter<"ClassRegistration"> | string | null
  }

  export type MembershipRenewalUpsertWithWhereUniqueWithoutUserInput = {
    where: MembershipRenewalWhereUniqueInput
    update: XOR<MembershipRenewalUpdateWithoutUserInput, MembershipRenewalUncheckedUpdateWithoutUserInput>
    create: XOR<MembershipRenewalCreateWithoutUserInput, MembershipRenewalUncheckedCreateWithoutUserInput>
  }

  export type MembershipRenewalUpdateWithWhereUniqueWithoutUserInput = {
    where: MembershipRenewalWhereUniqueInput
    data: XOR<MembershipRenewalUpdateWithoutUserInput, MembershipRenewalUncheckedUpdateWithoutUserInput>
  }

  export type MembershipRenewalUpdateManyWithWhereWithoutUserInput = {
    where: MembershipRenewalScalarWhereInput
    data: XOR<MembershipRenewalUpdateManyMutationInput, MembershipRenewalUncheckedUpdateManyWithoutUserInput>
  }

  export type MembershipRenewalScalarWhereInput = {
    AND?: MembershipRenewalScalarWhereInput | MembershipRenewalScalarWhereInput[]
    OR?: MembershipRenewalScalarWhereInput[]
    NOT?: MembershipRenewalScalarWhereInput | MembershipRenewalScalarWhereInput[]
    id?: StringFilter<"MembershipRenewal"> | string
    userId?: StringFilter<"MembershipRenewal"> | string
    currentPlanId?: StringNullableFilter<"MembershipRenewal"> | string | null
    requestedPlanId?: StringNullableFilter<"MembershipRenewal"> | string | null
    status?: StringFilter<"MembershipRenewal"> | string
    requestedAt?: DateTimeFilter<"MembershipRenewal"> | Date | string
    processedAt?: DateTimeNullableFilter<"MembershipRenewal"> | Date | string | null
    notes?: StringNullableFilter<"MembershipRenewal"> | string | null
    renewalDetails?: JsonNullableFilter<"MembershipRenewal">
  }

  export type DisciplineCreateWithoutClassesInput = {
    id?: string
    organizationId: string
    name: string
    description?: string | null
    color?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    schedule?: NullableJsonNullValueInput | InputJsonValue
    cancellationRules?: NullableJsonNullValueInput | InputJsonValue
  }

  export type DisciplineUncheckedCreateWithoutClassesInput = {
    id?: string
    organizationId: string
    name: string
    description?: string | null
    color?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    schedule?: NullableJsonNullValueInput | InputJsonValue
    cancellationRules?: NullableJsonNullValueInput | InputJsonValue
  }

  export type DisciplineCreateOrConnectWithoutClassesInput = {
    where: DisciplineWhereUniqueInput
    create: XOR<DisciplineCreateWithoutClassesInput, DisciplineUncheckedCreateWithoutClassesInput>
  }

  export type InstructorCreateWithoutClassesInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    profile?: NullableJsonNullValueInput | InputJsonValue
  }

  export type InstructorUncheckedCreateWithoutClassesInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    profile?: NullableJsonNullValueInput | InputJsonValue
  }

  export type InstructorCreateOrConnectWithoutClassesInput = {
    where: InstructorWhereUniqueInput
    create: XOR<InstructorCreateWithoutClassesInput, InstructorUncheckedCreateWithoutClassesInput>
  }

  export type ClassRegistrationCreateWithoutClassInput = {
    id?: string
    status?: string
    registeredAt?: Date | string
    cancelledAt?: Date | string | null
    notes?: string | null
    user: UserCreateNestedOneWithoutClassRegistrationsInput
  }

  export type ClassRegistrationUncheckedCreateWithoutClassInput = {
    id?: string
    userId: string
    status?: string
    registeredAt?: Date | string
    cancelledAt?: Date | string | null
    notes?: string | null
  }

  export type ClassRegistrationCreateOrConnectWithoutClassInput = {
    where: ClassRegistrationWhereUniqueInput
    create: XOR<ClassRegistrationCreateWithoutClassInput, ClassRegistrationUncheckedCreateWithoutClassInput>
  }

  export type ClassRegistrationCreateManyClassInputEnvelope = {
    data: ClassRegistrationCreateManyClassInput | ClassRegistrationCreateManyClassInput[]
    skipDuplicates?: boolean
  }

  export type DisciplineUpsertWithoutClassesInput = {
    update: XOR<DisciplineUpdateWithoutClassesInput, DisciplineUncheckedUpdateWithoutClassesInput>
    create: XOR<DisciplineCreateWithoutClassesInput, DisciplineUncheckedCreateWithoutClassesInput>
    where?: DisciplineWhereInput
  }

  export type DisciplineUpdateToOneWithWhereWithoutClassesInput = {
    where?: DisciplineWhereInput
    data: XOR<DisciplineUpdateWithoutClassesInput, DisciplineUncheckedUpdateWithoutClassesInput>
  }

  export type DisciplineUpdateWithoutClassesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: NullableJsonNullValueInput | InputJsonValue
    cancellationRules?: NullableJsonNullValueInput | InputJsonValue
  }

  export type DisciplineUncheckedUpdateWithoutClassesInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    color?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    schedule?: NullableJsonNullValueInput | InputJsonValue
    cancellationRules?: NullableJsonNullValueInput | InputJsonValue
  }

  export type InstructorUpsertWithoutClassesInput = {
    update: XOR<InstructorUpdateWithoutClassesInput, InstructorUncheckedUpdateWithoutClassesInput>
    create: XOR<InstructorCreateWithoutClassesInput, InstructorUncheckedCreateWithoutClassesInput>
    where?: InstructorWhereInput
  }

  export type InstructorUpdateToOneWithWhereWithoutClassesInput = {
    where?: InstructorWhereInput
    data: XOR<InstructorUpdateWithoutClassesInput, InstructorUncheckedUpdateWithoutClassesInput>
  }

  export type InstructorUpdateWithoutClassesInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: NullableJsonNullValueInput | InputJsonValue
  }

  export type InstructorUncheckedUpdateWithoutClassesInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ClassRegistrationUpsertWithWhereUniqueWithoutClassInput = {
    where: ClassRegistrationWhereUniqueInput
    update: XOR<ClassRegistrationUpdateWithoutClassInput, ClassRegistrationUncheckedUpdateWithoutClassInput>
    create: XOR<ClassRegistrationCreateWithoutClassInput, ClassRegistrationUncheckedCreateWithoutClassInput>
  }

  export type ClassRegistrationUpdateWithWhereUniqueWithoutClassInput = {
    where: ClassRegistrationWhereUniqueInput
    data: XOR<ClassRegistrationUpdateWithoutClassInput, ClassRegistrationUncheckedUpdateWithoutClassInput>
  }

  export type ClassRegistrationUpdateManyWithWhereWithoutClassInput = {
    where: ClassRegistrationScalarWhereInput
    data: XOR<ClassRegistrationUpdateManyMutationInput, ClassRegistrationUncheckedUpdateManyWithoutClassInput>
  }

  export type ClassSessionCreateWithoutDisciplineInput = {
    id?: string
    organizationId: string
    name: string
    dateTime: Date | string
    durationMinutes: number
    capacity: number
    registeredParticipantsIds?: ClassSessionCreateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionCreatewaitlistParticipantsIdsInput | string[]
    status?: string
    notes?: string | null
    isGenerated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    instructor: InstructorCreateNestedOneWithoutClassesInput
    registrations?: ClassRegistrationCreateNestedManyWithoutClassInput
  }

  export type ClassSessionUncheckedCreateWithoutDisciplineInput = {
    id?: string
    organizationId: string
    name: string
    dateTime: Date | string
    durationMinutes: number
    instructorId: string
    capacity: number
    registeredParticipantsIds?: ClassSessionCreateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionCreatewaitlistParticipantsIdsInput | string[]
    status?: string
    notes?: string | null
    isGenerated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    registrations?: ClassRegistrationUncheckedCreateNestedManyWithoutClassInput
  }

  export type ClassSessionCreateOrConnectWithoutDisciplineInput = {
    where: ClassSessionWhereUniqueInput
    create: XOR<ClassSessionCreateWithoutDisciplineInput, ClassSessionUncheckedCreateWithoutDisciplineInput>
  }

  export type ClassSessionCreateManyDisciplineInputEnvelope = {
    data: ClassSessionCreateManyDisciplineInput | ClassSessionCreateManyDisciplineInput[]
    skipDuplicates?: boolean
  }

  export type ClassSessionUpsertWithWhereUniqueWithoutDisciplineInput = {
    where: ClassSessionWhereUniqueInput
    update: XOR<ClassSessionUpdateWithoutDisciplineInput, ClassSessionUncheckedUpdateWithoutDisciplineInput>
    create: XOR<ClassSessionCreateWithoutDisciplineInput, ClassSessionUncheckedCreateWithoutDisciplineInput>
  }

  export type ClassSessionUpdateWithWhereUniqueWithoutDisciplineInput = {
    where: ClassSessionWhereUniqueInput
    data: XOR<ClassSessionUpdateWithoutDisciplineInput, ClassSessionUncheckedUpdateWithoutDisciplineInput>
  }

  export type ClassSessionUpdateManyWithWhereWithoutDisciplineInput = {
    where: ClassSessionScalarWhereInput
    data: XOR<ClassSessionUpdateManyMutationInput, ClassSessionUncheckedUpdateManyWithoutDisciplineInput>
  }

  export type ClassSessionScalarWhereInput = {
    AND?: ClassSessionScalarWhereInput | ClassSessionScalarWhereInput[]
    OR?: ClassSessionScalarWhereInput[]
    NOT?: ClassSessionScalarWhereInput | ClassSessionScalarWhereInput[]
    id?: StringFilter<"ClassSession"> | string
    organizationId?: StringFilter<"ClassSession"> | string
    disciplineId?: StringFilter<"ClassSession"> | string
    name?: StringFilter<"ClassSession"> | string
    dateTime?: DateTimeFilter<"ClassSession"> | Date | string
    durationMinutes?: IntFilter<"ClassSession"> | number
    instructorId?: StringFilter<"ClassSession"> | string
    capacity?: IntFilter<"ClassSession"> | number
    registeredParticipantsIds?: StringNullableListFilter<"ClassSession">
    waitlistParticipantsIds?: StringNullableListFilter<"ClassSession">
    status?: StringFilter<"ClassSession"> | string
    notes?: StringNullableFilter<"ClassSession"> | string | null
    isGenerated?: BoolFilter<"ClassSession"> | boolean
    createdAt?: DateTimeFilter<"ClassSession"> | Date | string
    updatedAt?: DateTimeFilter<"ClassSession"> | Date | string
  }

  export type ClassSessionCreateWithoutInstructorInput = {
    id?: string
    organizationId: string
    name: string
    dateTime: Date | string
    durationMinutes: number
    capacity: number
    registeredParticipantsIds?: ClassSessionCreateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionCreatewaitlistParticipantsIdsInput | string[]
    status?: string
    notes?: string | null
    isGenerated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    discipline: DisciplineCreateNestedOneWithoutClassesInput
    registrations?: ClassRegistrationCreateNestedManyWithoutClassInput
  }

  export type ClassSessionUncheckedCreateWithoutInstructorInput = {
    id?: string
    organizationId: string
    disciplineId: string
    name: string
    dateTime: Date | string
    durationMinutes: number
    capacity: number
    registeredParticipantsIds?: ClassSessionCreateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionCreatewaitlistParticipantsIdsInput | string[]
    status?: string
    notes?: string | null
    isGenerated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    registrations?: ClassRegistrationUncheckedCreateNestedManyWithoutClassInput
  }

  export type ClassSessionCreateOrConnectWithoutInstructorInput = {
    where: ClassSessionWhereUniqueInput
    create: XOR<ClassSessionCreateWithoutInstructorInput, ClassSessionUncheckedCreateWithoutInstructorInput>
  }

  export type ClassSessionCreateManyInstructorInputEnvelope = {
    data: ClassSessionCreateManyInstructorInput | ClassSessionCreateManyInstructorInput[]
    skipDuplicates?: boolean
  }

  export type ClassSessionUpsertWithWhereUniqueWithoutInstructorInput = {
    where: ClassSessionWhereUniqueInput
    update: XOR<ClassSessionUpdateWithoutInstructorInput, ClassSessionUncheckedUpdateWithoutInstructorInput>
    create: XOR<ClassSessionCreateWithoutInstructorInput, ClassSessionUncheckedCreateWithoutInstructorInput>
  }

  export type ClassSessionUpdateWithWhereUniqueWithoutInstructorInput = {
    where: ClassSessionWhereUniqueInput
    data: XOR<ClassSessionUpdateWithoutInstructorInput, ClassSessionUncheckedUpdateWithoutInstructorInput>
  }

  export type ClassSessionUpdateManyWithWhereWithoutInstructorInput = {
    where: ClassSessionScalarWhereInput
    data: XOR<ClassSessionUpdateManyMutationInput, ClassSessionUncheckedUpdateManyWithoutInstructorInput>
  }

  export type UserCreateWithoutClassRegistrationsInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    membershipRenewals?: MembershipRenewalCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutClassRegistrationsInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    membershipRenewals?: MembershipRenewalUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutClassRegistrationsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutClassRegistrationsInput, UserUncheckedCreateWithoutClassRegistrationsInput>
  }

  export type ClassSessionCreateWithoutRegistrationsInput = {
    id?: string
    organizationId: string
    name: string
    dateTime: Date | string
    durationMinutes: number
    capacity: number
    registeredParticipantsIds?: ClassSessionCreateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionCreatewaitlistParticipantsIdsInput | string[]
    status?: string
    notes?: string | null
    isGenerated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    discipline: DisciplineCreateNestedOneWithoutClassesInput
    instructor: InstructorCreateNestedOneWithoutClassesInput
  }

  export type ClassSessionUncheckedCreateWithoutRegistrationsInput = {
    id?: string
    organizationId: string
    disciplineId: string
    name: string
    dateTime: Date | string
    durationMinutes: number
    instructorId: string
    capacity: number
    registeredParticipantsIds?: ClassSessionCreateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionCreatewaitlistParticipantsIdsInput | string[]
    status?: string
    notes?: string | null
    isGenerated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClassSessionCreateOrConnectWithoutRegistrationsInput = {
    where: ClassSessionWhereUniqueInput
    create: XOR<ClassSessionCreateWithoutRegistrationsInput, ClassSessionUncheckedCreateWithoutRegistrationsInput>
  }

  export type UserUpsertWithoutClassRegistrationsInput = {
    update: XOR<UserUpdateWithoutClassRegistrationsInput, UserUncheckedUpdateWithoutClassRegistrationsInput>
    create: XOR<UserCreateWithoutClassRegistrationsInput, UserUncheckedCreateWithoutClassRegistrationsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutClassRegistrationsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutClassRegistrationsInput, UserUncheckedUpdateWithoutClassRegistrationsInput>
  }

  export type UserUpdateWithoutClassRegistrationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    membershipRenewals?: MembershipRenewalUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutClassRegistrationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    membershipRenewals?: MembershipRenewalUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ClassSessionUpsertWithoutRegistrationsInput = {
    update: XOR<ClassSessionUpdateWithoutRegistrationsInput, ClassSessionUncheckedUpdateWithoutRegistrationsInput>
    create: XOR<ClassSessionCreateWithoutRegistrationsInput, ClassSessionUncheckedCreateWithoutRegistrationsInput>
    where?: ClassSessionWhereInput
  }

  export type ClassSessionUpdateToOneWithWhereWithoutRegistrationsInput = {
    where?: ClassSessionWhereInput
    data: XOR<ClassSessionUpdateWithoutRegistrationsInput, ClassSessionUncheckedUpdateWithoutRegistrationsInput>
  }

  export type ClassSessionUpdateWithoutRegistrationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    discipline?: DisciplineUpdateOneRequiredWithoutClassesNestedInput
    instructor?: InstructorUpdateOneRequiredWithoutClassesNestedInput
  }

  export type ClassSessionUncheckedUpdateWithoutRegistrationsInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    disciplineId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    instructorId?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateWithoutMembershipRenewalsInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    classRegistrations?: ClassRegistrationCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutMembershipRenewalsInput = {
    id?: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    role?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    classRegistrations?: ClassRegistrationUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutMembershipRenewalsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutMembershipRenewalsInput, UserUncheckedCreateWithoutMembershipRenewalsInput>
  }

  export type UserUpsertWithoutMembershipRenewalsInput = {
    update: XOR<UserUpdateWithoutMembershipRenewalsInput, UserUncheckedUpdateWithoutMembershipRenewalsInput>
    create: XOR<UserCreateWithoutMembershipRenewalsInput, UserUncheckedCreateWithoutMembershipRenewalsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutMembershipRenewalsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutMembershipRenewalsInput, UserUncheckedUpdateWithoutMembershipRenewalsInput>
  }

  export type UserUpdateWithoutMembershipRenewalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    classRegistrations?: ClassRegistrationUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutMembershipRenewalsInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstName?: StringFieldUpdateOperationsInput | string
    lastName?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    membership?: NullableJsonNullValueInput | InputJsonValue
    classRegistrations?: ClassRegistrationUncheckedUpdateManyWithoutUserNestedInput
  }

  export type ClassRegistrationCreateManyUserInput = {
    id?: string
    classId: string
    status?: string
    registeredAt?: Date | string
    cancelledAt?: Date | string | null
    notes?: string | null
  }

  export type MembershipRenewalCreateManyUserInput = {
    id?: string
    currentPlanId?: string | null
    requestedPlanId?: string | null
    status?: string
    requestedAt?: Date | string
    processedAt?: Date | string | null
    notes?: string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ClassRegistrationUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    class?: ClassSessionUpdateOneRequiredWithoutRegistrationsNestedInput
  }

  export type ClassRegistrationUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    classId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClassRegistrationUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    classId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type MembershipRenewalUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    requestedPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipRenewalUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    requestedPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
  }

  export type MembershipRenewalUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    currentPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    requestedPlanId?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    requestedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    processedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    renewalDetails?: NullableJsonNullValueInput | InputJsonValue
  }

  export type ClassRegistrationCreateManyClassInput = {
    id?: string
    userId: string
    status?: string
    registeredAt?: Date | string
    cancelledAt?: Date | string | null
    notes?: string | null
  }

  export type ClassRegistrationUpdateWithoutClassInput = {
    id?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutClassRegistrationsNestedInput
  }

  export type ClassRegistrationUncheckedUpdateWithoutClassInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClassRegistrationUncheckedUpdateManyWithoutClassInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    registeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cancelledAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ClassSessionCreateManyDisciplineInput = {
    id?: string
    organizationId: string
    name: string
    dateTime: Date | string
    durationMinutes: number
    instructorId: string
    capacity: number
    registeredParticipantsIds?: ClassSessionCreateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionCreatewaitlistParticipantsIdsInput | string[]
    status?: string
    notes?: string | null
    isGenerated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClassSessionUpdateWithoutDisciplineInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    instructor?: InstructorUpdateOneRequiredWithoutClassesNestedInput
    registrations?: ClassRegistrationUpdateManyWithoutClassNestedInput
  }

  export type ClassSessionUncheckedUpdateWithoutDisciplineInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    instructorId?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    registrations?: ClassRegistrationUncheckedUpdateManyWithoutClassNestedInput
  }

  export type ClassSessionUncheckedUpdateManyWithoutDisciplineInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    instructorId?: StringFieldUpdateOperationsInput | string
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ClassSessionCreateManyInstructorInput = {
    id?: string
    organizationId: string
    disciplineId: string
    name: string
    dateTime: Date | string
    durationMinutes: number
    capacity: number
    registeredParticipantsIds?: ClassSessionCreateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionCreatewaitlistParticipantsIdsInput | string[]
    status?: string
    notes?: string | null
    isGenerated?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ClassSessionUpdateWithoutInstructorInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    discipline?: DisciplineUpdateOneRequiredWithoutClassesNestedInput
    registrations?: ClassRegistrationUpdateManyWithoutClassNestedInput
  }

  export type ClassSessionUncheckedUpdateWithoutInstructorInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    disciplineId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    registrations?: ClassRegistrationUncheckedUpdateManyWithoutClassNestedInput
  }

  export type ClassSessionUncheckedUpdateManyWithoutInstructorInput = {
    id?: StringFieldUpdateOperationsInput | string
    organizationId?: StringFieldUpdateOperationsInput | string
    disciplineId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    dateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    durationMinutes?: IntFieldUpdateOperationsInput | number
    capacity?: IntFieldUpdateOperationsInput | number
    registeredParticipantsIds?: ClassSessionUpdateregisteredParticipantsIdsInput | string[]
    waitlistParticipantsIds?: ClassSessionUpdatewaitlistParticipantsIdsInput | string[]
    status?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    isGenerated?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}