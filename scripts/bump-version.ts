import {promises as fs} from 'fs';
import {join} from 'path';
import prompts from 'prompts';
import semver from 'semver';
import git from 'simple-git/promise';

(async (): Promise<void> => {
  const manifestJSONPath: string = join(
    __dirname,
    '../source/assets/manifest.json'
  );
  const packageJSONPath: string = join(__dirname, '../package.json');

  const manifestJSON: any = JSON.parse(
    await fs.readFile(manifestJSONPath, 'utf8')
  );

  const packageJSON: any = JSON.parse(
    await fs.readFile(packageJSONPath, 'utf8')
  );

  if (manifestJSON.version !== packageJSON.version) {
    console.log(
      `manifest.json and package.json versions are not the same:\n` +
        `${String(manifestJSON.version)} | ${String(packageJSON.version)}`
    );
    return;
  }

  const currentVersion: string = manifestJSON.version;
  const input = await prompts({
    message: 'Bump major, minor or patch?',
    name: 'type',
    type: 'select',
    choices: [
      {
        title: 'Major',
        description: `${currentVersion} -> ${semver.inc(
          currentVersion,
          'major'
        )!}`,
        value: 'major'
      },
      {
        title: 'Minor',
        description: `${currentVersion} -> ${semver.inc(
          currentVersion,
          'minor'
        )!}`,
        value: 'minor'
      },
      {
        title: 'Patch',
        description: `${currentVersion} -> ${semver.inc(
          currentVersion,
          'patch'
        )!}`,
        value: 'patch'
      }
    ] as Array<prompts.Choice & {description?: string}> | undefined,
    initial: 1
  });

  switch (input.type) {
    case 'major':
      break;
    case 'minor':
      break;
    case 'patch':
      break;
    default:
      console.log(`Unknown input: ${String(input.type)}`);
      return;
  }

  const newVersion: string | null = semver.inc(currentVersion, input.type);
  if (newVersion === null) {
    console.log(
      `Something went wrong with semver incrementing ${currentVersion}`
    );
    return;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(
      'Running in development, not writing JSONs to file or committing the changes.'
    );
    return;
  }

  const repository: git.SimpleGit = git(join(__dirname, '../'));
  const status: git.StatusResult = await repository.status();
  if (status.staged.length > 0 || status.created.length > 0) {
    console.log(
      `Git repository has ${status.staged.length}/${status.created.length} staged/created files, commit these or unstage them then run this script again.`
    );
    return;
  }

  console.log(
    `Bumping ${currentVersion} to ${newVersion}, writing JSONs to file.`
  );
  manifestJSON.version = newVersion;
  await fs.writeFile(
    manifestJSONPath,
    JSON.stringify(manifestJSON, null, 2) + '\n'
  );

  packageJSON.version = newVersion;
  await fs.writeFile(
    packageJSONPath,
    JSON.stringify(packageJSON, null, 2) + '\n'
  );

  console.log('Committing changed files and tagging version.');
  await repository.add([manifestJSONPath, packageJSONPath]);
  await repository.commit(`Version: ${newVersion}`);
  await repository.addAnnotatedTag(`${newVersion}`, `Version ${newVersion}`);
})();
