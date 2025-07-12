import { Tree } from '@nx/devkit';
import { join } from 'path';
import { Project } from 'ts-morph';
import { SyntaxKind } from 'typescript';

interface ProviderConfig {
  provider: string | null;
  moduleSpecifier: string;
  namedImports?: string[];
  defaultImport?: string;
}

export async function updateAppConfig(tree: Tree, providers: ProviderConfig[]) {
  const configPath = 'src/app/app.config.ts';

  if (!tree.exists(configPath)) {
    throw new Error(`File ${configPath} does not exist`);
  }

  const project = new Project();
  const filePath = join(process.cwd(), configPath);
  const sourceFile = project.createSourceFile(
    filePath,
    tree.read(configPath, 'utf-8'),
    { overwrite: true }
  );

  for (const imp of providers) {
    const existing = sourceFile
      .getImportDeclarations()
      .find((d) => d.getModuleSpecifierValue() === imp.moduleSpecifier);

    if (existing) continue;

    sourceFile.addImportDeclaration({
      moduleSpecifier: imp.moduleSpecifier,
      namedImports: imp.namedImports,
      defaultImport: imp.defaultImport,
    });
  }

  // Find the appConfig object
  const appConfig = sourceFile.getVariableDeclaration('appConfig');
  if (!appConfig) {
    throw new Error(`appConfig not found in ${configPath}`);
  }

  const initializer = appConfig.getInitializerIfKind(
    SyntaxKind.ObjectLiteralExpression
  );

  const providersProp = initializer?.getProperty('providers');

  if (!providersProp) {
    throw new Error(`providers not found in appConfig`);
  }

  const array = providersProp.getFirstDescendantByKind(
    SyntaxKind.ArrayLiteralExpression
  );

  if (!array) {
    throw new Error(`Array not found in providers`);
  }

  // Append new providers if not already added
  const existing = array.getElements().map((e) => e.getText());

  for (const { provider } of providers.filter((p) => p.provider)) {
    if (!existing.includes(provider)) {
      array.addElement(provider);
    }
  }

  tree.write(configPath, sourceFile.getFullText());
}
