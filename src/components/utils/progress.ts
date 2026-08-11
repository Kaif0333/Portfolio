/**
 * Drives the loading percentage from real download progress.
 * - update(loaded, total): wire to the GLTF loader's onProgress event.
 * - loaded(): ramps the bar to 100 and resolves when it gets there.
 * - fail(): jumps to 100 so the site still unlocks without the 3D character.
 */
export const setProgress = (setLoading: (value: number) => void) => {
  // Approximate size of character.glb, used when the server sends no content-length.
  const FALLBACK_TOTAL = 2_340_000;
  let percent = 0;
  let interval: number | undefined;

  function update(loadedBytes: number, totalBytes: number) {
    const total = totalBytes > 0 ? totalBytes : FALLBACK_TOTAL;
    const next = Math.min(99, Math.round((loadedBytes / total) * 100));
    if (next > percent) {
      percent = next;
      setLoading(percent);
    }
  }

  function clear() {
    if (interval) clearInterval(interval);
  }

  function fail() {
    clear();
    percent = 100;
    setLoading(100);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      clear();
      interval = setInterval(() => {
        if (percent < 100) {
          percent += Math.max(1, Math.round((100 - percent) / 8));
          percent = Math.min(percent, 100);
          setLoading(percent);
        } else {
          clearInterval(interval);
          resolve(percent);
        }
      }, 30);
    });
  }

  return { update, loaded, fail, clear };
};
