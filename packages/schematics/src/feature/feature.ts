import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import { join } from 'node:path';
import { FeatureGeneratorSchema } from './schema';

export async function featureGenerator(
  tree: Tree,
  options: FeatureGeneratorSchema
) {
  const path = options.path.replace(/\\/g, '/');

  const { className, fileName, propertyName } = names(
    path.split('/').pop() || path
  );

  generateFiles(tree, join(__dirname, 'files'), path, {
    fileName,
    className,
    propertyName,
    prefix: options.prefix,
  });

  await formatFiles(tree);
}

export default featureGenerator;
