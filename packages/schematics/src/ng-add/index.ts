import {
  addDependenciesToPackageJson,
  formatFiles,
  installPackagesTask,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { withPackages } from '../utils/with-packages.util';
import { AddOptionsSchema } from './schema';

export async function addGenerator(tree: Tree, options: AddOptionsSchema) {
  const tasks = [];

  // 1. Add Prettier
  tasks.push(addDependenciesToPackageJson(tree, {}, withPackages('prettier')));

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

  if (options.tailwind) {
    tasks.push(
      addDependenciesToPackageJson(
        tree,
        {},
        withPackages('tailwindcss', '@tailwindcss/postcss', 'postcss')
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
  }

  await formatFiles(tree);

  return runTasksInSerial(...tasks, () => installPackagesTask(tree));
}

export default addGenerator;
