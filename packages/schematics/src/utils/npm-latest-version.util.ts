import { logger } from '@nx/devkit';
import { execSync } from 'node:child_process';

/**
 * Returns the latest version of a package
 * @param packageName Name of the package
 * @returns Latest version string or 'latest'
 */
export function npmLatestVersion(packageName: string): string {
  try {
    const latestVersion = execSync(`npm show ${packageName} version`, {
      encoding: 'utf-8',
    }).trim();

    return latestVersion;
  } catch {
    logger.warn(
      `Could not fetch latest version for ${packageName}, using 'latest' instead`
    );

    return 'latest';
  }
}
