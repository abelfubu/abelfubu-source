import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import * as path from 'path';
import { FeatureGeneratorSchema } from './schema';

export async function featureGenerator(
  tree: Tree,
  options: FeatureGeneratorSchema
) {
  const projectRoot = `src/${options.name}`;

  const { className, fileName, propertyName } = names(
    options.name.split('/').pop()
  );

  generateFiles(tree, path.join(__dirname, 'files'), projectRoot, {
    fileName,
    className,
    propertyName,
    prefix: options.prefix,
  });

  await formatFiles(tree);
}

export default featureGenerator;
