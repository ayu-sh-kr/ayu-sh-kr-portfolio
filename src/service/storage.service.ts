/**
 * Options controlling how a value is persisted.
 *
 * Both `ttl` and `version` are embedded in the stored envelope so reads can
 * validate them without requiring the caller to pass the same values twice.
 */
export interface StorageSetOptions {
  /** Time-to-live in milliseconds. The record is silently discarded on the next read after expiry. */
  ttl?: number;
  /** Schema version tag. Reads that specify a different version treat the record as absent. */
  version?: number;
}

/** Options supplied to {@link StorageService.get} or {@link StorageScope.get}. */
export interface StorageGetOptions {
  /** Expected schema version. A stored record whose version differs is treated as absent. */
  version?: number;
}

/**
 * A namespaced view over the root {@link StorageService}.
 *
 * Every key operation is automatically prefixed with `namespace:`, so distinct
 * features can own disjoint key spaces without coordinating raw key strings.
 */
export interface StorageScope {
  /**
   * Returns the typed value for `key`, or `null` when it is absent, expired, or
   * does not match the requested schema version.
   */
  get<T>(key: string, options?: StorageGetOptions): T | null;
  /**
   * Persists `value` under `key`, optionally attaching a TTL or schema version
   * that future reads can validate.
   */
  set<T>(key: string, value: T, options?: StorageSetOptions): void;
  /**
   * Removes the record for `key` and notifies subscribers that are observing
   * the namespaced key.
   */
  remove(key: string): void;
  /**
   * Returns whether a non-expired record currently exists for `key` within the
   * scope's namespace.
   */
  has(key: string): boolean;
  /**
   * Removes every record whose fully qualified key belongs to this scope while
   * preserving records owned by other namespaces.
   */
  clear(): void;
  /**
   * Subscribes to changes on `key` within this scope.
   *
   * The subscriber fires immediately with the current value, then again on every
   * `set` or `remove` for that key. Returns a cleanup function.
   */
  observe<T>(key: string, subscriber: (value: T | null) => void): () => void;
}

/** Internal envelope wrapping the caller's value with optional metadata. */
interface StorageRecord<T> {
  /** Caller-owned value recovered by a typed read. */
  value: T;
  /** Absolute Unix-ms timestamp after which the record is invalid. */
  expiresAt?: number;
  /** Schema version embedded at write time. */
  version?: number;
}

/** Callback notified when one managed key changes or expires. */
type StorageSubscriber<T = unknown> = (value: T | null) => void;

/**
 * Guarded, feature-scoped wrapper over the browser's `localStorage`.
 *
 * Probes storage availability once at construction time and falls back to an
 * in-memory map for the rest of the page lifetime, so the rest of the
 * application never needs a try/catch around storage calls.
 *
 * All reads and writes pass through a JSON envelope that carries an optional
 * expiry timestamp and schema version, enabling TTL-based expiry and
 * version-gated retrieval without extra bookkeeping in callers.
 *
 * Use {@link AppStorage} for direct access or {@link StorageService.scope} to
 * obtain a namespaced view for a specific feature.
 */
class StorageService {
  private readonly browserStorage: Storage | null;
  private readonly memory = new Map<string, string>();
  private readonly managedKeys = new Set<string>();
  private readonly subscribers = new Map<string, Set<StorageSubscriber>>();

  /**
   * Probes browser storage once so all later operations use the same fallback
   * path instead of repeating availability checks.
   */
  constructor() {
    try {
      const storage = globalThis.localStorage;
      const probe = "__dota_storage_probe__";
      storage.setItem(probe, "1");
      storage.removeItem(probe);
      this.browserStorage = storage;
    } catch {
      this.browserStorage = null;
    }
  }

  /**
   * Returns a {@link StorageScope} that prefixes all key operations with `namespace:`.
   *
   * @example
   * const theme = AppStorage.scope("ayu-sh-kr.com");
   * theme.set("theme", "dark");   // stored as "ayu-sh-kr.com:theme"
   * theme.get<string>("theme");   // → "dark"
   */
  scope(namespace: string): StorageScope {
    const prefix = (key: string) => `${namespace}:${key}`;
    return {
      get: <T>(key: string, options?: StorageGetOptions) => this.get<T>(prefix(key), options),
      set: <T>(key: string, value: T, options?: StorageSetOptions) => this.set(prefix(key), value, options),
      remove: (key: string) => this.remove(prefix(key)),
      has: (key: string) => this.has(prefix(key)),
      clear: () => this.clearPrefix(`${namespace}:`),
      observe: <T>(key: string, subscriber: (value: T | null) => void) =>
        this.observe<T>(prefix(key), subscriber),
    };
  }

  /**
   * Returns the typed value stored under `key`, or `null` when:
   * - the key does not exist,
   * - the record's TTL has elapsed (the record is also deleted),
   * - the stored schema version does not match `options.version`.
   */
  get<T>(key: string, options?: StorageGetOptions): T | null {
    const raw = this.read(key);
    if (!raw) {
      return null;
    }

    let record: StorageRecord<T>;
    try {
      record = JSON.parse(raw) as StorageRecord<T>;
    } catch {
      return null;
    }

    if (record.expiresAt !== undefined && Date.now() > record.expiresAt) {
      this.erase(key);
      this.notify(key);
      return null;
    }

    if (options?.version !== undefined && record.version !== options.version) {
      return null;
    }

    return record.value;
  }

  /**
   * Persists `value` under `key` inside a JSON envelope.
   *
   * Passing `ttl` sets an absolute expiry so the record is discarded on the
   * next read after that window. Passing `version` embeds a schema tag that
   * future `get` calls can validate.
   */
  set<T>(key: string, value: T, options?: StorageSetOptions): void {
    const record: StorageRecord<T> = {value};

    if (options?.ttl !== undefined) {
      record.expiresAt = Date.now() + options.ttl;
    }
    if (options?.version !== undefined) {
      record.version = options.version;
    }

    this.write(key, JSON.stringify(record));
    this.notify(key);
  }

  /**
   * Removes the record for `key` and publishes the resulting absence to active
   * subscribers.
   */
  remove(key: string): void {
    this.erase(key);
    this.notify(key);
  }

  /**
   * Checks for a readable, non-expired record by delegating to the normal
   * version and expiry handling in {@link StorageService.get}.
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Removes every key written through this service instance and notifies each
   * subscriber after its record has been erased.
   */
  clear(): void {
    const keys = [...this.managedKeys];
    keys.forEach((key) => {
      this.erase(key);
      this.notify(key);
    });
  }

  /**
   * Subscribes to changes on `key`.
   *
   * Fires immediately with the current value so the subscriber can initialize
   * state without a separate `get` call. Returns a cleanup function that
   * removes only this subscription.
   */
  observe<T>(key: string, subscriber: (value: T | null) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }

    const cast = subscriber as StorageSubscriber;
    this.subscribers.get(key)!.add(cast);
    subscriber(this.get<T>(key));

    return () => this.subscribers.get(key)?.delete(cast);
  }

  /**
   * Removes only keys in a namespace created by {@link StorageService.scope},
   * leaving records owned by other features untouched.
   */
  private clearPrefix(prefix: string): void {
    const targets = [...this.managedKeys].filter((key) => key.startsWith(prefix));
    targets.forEach((key) => {
      this.erase(key);
      this.notify(key);
    });
  }

  /**
   * Reads serialized data from browser storage and falls back to memory when
   * the browser rejects access.
   */
  private read(key: string): string | null {
    try {
      return this.browserStorage?.getItem(key) ?? this.memory.get(key) ?? null;
    } catch {
      return this.memory.get(key) ?? null;
    }
  }

  /**
   * Writes serialized data and tracks the key so {@link StorageService.clear}
   * can remove it later.
   */
  private write(key: string, serialized: string): void {
    this.managedKeys.add(key);
    try {
      if (this.browserStorage) {
        this.browserStorage.setItem(key, serialized);
        return;
      }
    } catch {
      // fall through to memory
    }
    this.memory.set(key, serialized);
  }

  /**
   * Removes serialized data from the managed-key set and whichever backend is
   * currently available.
   */
  private erase(key: string): void {
    this.managedKeys.delete(key);
    try {
      if (this.browserStorage) {
        this.browserStorage.removeItem(key);
        return;
      }
    } catch {
      // fall through to memory
    }
    this.memory.delete(key);
  }

  /**
   * Sends the latest typed value to subscribers after a key changes, including
   * the `null` value produced when a record was removed or expired.
   */
  private notify(key: string): void {
    const set = this.subscribers.get(key);
    if (!set?.size) {
      return;
    }
    const value = this.get(key);
    set.forEach((sub) => sub(value));
  }
}

/** Shared localStorage wrapper for all application-level persistence. */
export const AppStorage = new StorageService();
