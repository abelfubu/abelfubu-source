import {
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { withPackages } from '../utils/with-packages.util';
import { AddOptionsSchema } from './schema';

import { updateAppConfig } from '../utils/update-app-config.util';

export async function addGenerator(tree: Tree, options: AddOptionsSchema) {
  const tasks = [];

  if (options.prettier) {
    tasks.push(
      addDependenciesToPackageJson(tree, {}, withPackages('prettier'))
    );

    if (!tree.exists('.prettierrc')) {
      tree.write('.prettierrc', JSON.stringify({ semi: false }, null, 2));
    }
  }

  if (options.tailwind) {
    tasks.push(
      addDependenciesToPackageJson(
        tree,
        withPackages('tailwindcss', '@tailwindcss/postcss', 'postcss'),
        {}
      )
    );

    tree.write(
      '.postcssrc.json',
      `{ "plugins": { "@tailwindcss/postcss": {} } }`
    );

    const styles = tree.read('src/styles.css', 'utf-8');
    tree.write(
      'src/styles.css',
      `@import "primeicons/primeicons.css";
@import "tailwindcss";
${options.primeng ? '@plugin "tailwindcss-primeui";' : ''}
\n
${styles}`
    );
  }

  if (options.primeng) {
    tasks.push(
      addDependenciesToPackageJson(
        tree,
        withPackages('primeng', 'primeicons', '@primeng/themes'),
        {}
      )
    );

    await updateAppConfig(tree, [
      {
        provider: 'provideAnimationsAsync()',
        moduleSpecifier: '@angular/platform-browser/animations/async',
        namedImports: ['provideAnimationsAsync'],
      },
      {
        provider: 'providePrimeNG({ theme: { preset: Aura } })',
        moduleSpecifier: 'primeng/config',
        namedImports: ['providePrimeNG'],
      },
      {
        provider: null,
        moduleSpecifier: '@primeng/themes/aura',
        defaultImport: 'Aura',
      },
    ]);
  }

  if (options.tailwind && options.primeng) {
    tasks.push(
      addDependenciesToPackageJson(
        tree,
        {},
        withPackages('tailwindcss-primeui')
      )
    );
  }

  await formatFiles(tree);

  return runTasksInSerial(...tasks, () => {
    installPackagesTask(tree);
  });
}
