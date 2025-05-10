import {
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  logger,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { execSync } from 'child_process';

/**
 * Returns the latest version of a package
 * @param packageName Name of the package
 * @returns Latest version string or 'latest'
 */
function getLatestVersion(packageName: string): string {
  try {
    // Execute npm command to get the latest version
    const latestVersion = execSync(`npm show ${packageName} version`, {
      encoding: 'utf-8',
    }).trim();

    return latestVersion;
  } catch (error) {
    logger.warn(
      `Could not fetch latest version for ${packageName}, using 'latest' instead`
    );
    return 'latest';
  }
}

export async function addGenerator(tree: Tree) {
  const tasks = [];

  // 1. Add Prettier
  const prettier = getLatestVersion('prettier');
  tasks.push(addDependenciesToPackageJson(tree, {}, { prettier }));

  if (!tree.exists('.prettierrc')) {
    tree.write(
      '.prettierrc',
      JSON.stringify(
        {
          semi: false,
        },
        null,
        2
      )
    );
  }

  // 2. Add Tailwind
  const tailwindcss = getLatestVersion('tailwindcss');
  const postcss = getLatestVersion('postcss');
  const tailwindPostcss = getLatestVersion('@tailwindcss/postcss');
  tasks.push(
    addDependenciesToPackageJson(
      tree,
      {},
      {
        tailwindcss,
        '@tailwindcss/postcss': tailwindPostcss,
        postcss,
      }
    )
  );

  tree.write(
    '.postcssrc.json',
    `{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}`
  );

  tree.write('src/styles.css', `@import "tailwindcss";`);

  // 3. Run ng add @angular-eslint/schematics
  execSync('npx ng add @angular-eslint/schematics --skip-confirmation', {
    stdio: 'inherit',
  });

  await formatFiles(tree);

  return runTasksInSerial(...tasks, () => installPackagesTask(tree));
}

export default addGenerator;
