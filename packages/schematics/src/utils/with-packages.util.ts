import { npmLatestVersion } from './npm-latest-version.util';

/**
 * This function takes an array of package names and returns an object
 * where the keys are the package names and the values are the latest
 * versions of those packages.
 *
 * @param packages - An array of package names.
 * @returns An object with package names as keys and their latest versions as values.
 */
export function withPackages(...packages: string[]): Record<string, string> {
  return packages.reduce(
    (acc, item) => ({ ...acc, [item]: npmLatestVersion(item) }),
    {}
  );
}
