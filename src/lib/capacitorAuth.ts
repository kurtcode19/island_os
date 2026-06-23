export async function isNativePlatform(): Promise<boolean> {
  try {
    const mod = await import('@capacitor/core');
    return mod.Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}
