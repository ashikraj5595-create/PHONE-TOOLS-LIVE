/**
 * PHONE TOOLS — Object URL Lifecycle Manager
 *
 * Centralized, leak-proof tracking and reclamation of browser object URLs.
 *
 * Guarantees:
 * - Tracks every created object URL
 * - Prevents double-revocation
 * - Safely ignores null, undefined, or unmanaged foreign URLs
 * - Does NOT hold File/Blob references in memory (zero memory overhead)
 * - Session-oriented: Not tied to route changes (workspace persistence across tabs)
 * - Thread-safe within browser JavaScript event loop
 */
export class ObjectUrlManager {
  private readonly activeUrls = new Set<string>();

  /**
   * Allocates a browser object URL for the given Blob or File and registers it.
   */
  public create(blob: Blob | File): string {
    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
      throw new Error('URL.createObjectURL is unavailable in the current environment.');
    }
    const url = URL.createObjectURL(blob);
    this.activeUrls.add(url);
    return url;
  }

  /**
   * Safely revokes a single tracked object URL.
   * Returns true if the URL was tracked and revoked, false otherwise.
   */
  public revoke(url: string | null | undefined): boolean {
    if (!url || typeof url !== 'string') {
      return false;
    }

    if (this.activeUrls.has(url)) {
      this.activeUrls.delete(url);
      if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore revocation failure in restricted/test contexts
        }
      }
      return true;
    }

    return false;
  }

  /**
   * Revokes all currently tracked object URLs and clears the internal registry.
   * Useful when an asset is deleted, a workflow is reset, or the workspace is cleared.
   * Returns the count of revoked URLs.
   */
  public revokeAll(): number {
    const count = this.activeUrls.size;
    if (count === 0) {
      return 0;
    }

    if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
      for (const url of this.activeUrls) {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore individual revocation failure
        }
      }
    }

    this.activeUrls.clear();
    return count;
  }

  /**
   * Checks whether a given URL is currently tracked as active.
   */
  public isTracked(url: string | null | undefined): boolean {
    if (!url) return false;
    return this.activeUrls.has(url);
  }

  /**
   * Returns the count of active object URLs tracked by this manager instance.
   */
  public get activeCount(): number {
    return this.activeUrls.size;
  }
}

/**
 * Shared singleton instance for session-scoped workspace lifecycle.
 */
export const objectUrlManager = new ObjectUrlManager();
