const core = require('@actions/core');
const github = require('@actions/github');
const semver = require('semver');
const fs = require('fs');
const axios = require('axios');

async function run() {
  try {
    // Inputs from the action's metadata
    const npmToken = core.getInput('npm-token');
    const packageFile = core.getInput('package-file') || 'package.json';

    // Read the package name and current version from package.json
    const packageData = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const packageName = packageData.name;
    const currentVersion = packageData.version;

    // Get the latest version from npm
    const npmRegistryUrl = `https://registry.npmjs.org/${packageName}`;

    const response = await axios.get(npmRegistryUrl);
    const latestVersion = response.data['dist-tags'].latest;

    // Compare versions and update if needed
    if (semver.gt(latestVersion, currentVersion)) {
      const newVersion = semver.inc(currentVersion, 'patch'); // You can choose how to increment the version based on your requirements (major, minor, or patch)
      packageData.version = newVersion;

      // Write the updated package.json back to the file
      fs.writeFileSync(packageFile, JSON.stringify(packageData, null, 2));
      core.setOutput('new-version', newVersion);
      core.info(`Updated package version to ${newVersion} and published to npm.`);

      // Commit and push the changes back to the repository
      const githubToken = core.getInput('github-token');
      const octokit = github.getOctokit(githubToken);

      const { owner, repo } = github.context.repo;
      const branch = github.context.ref.split('/').pop();

      await octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: packageFile,
        message: `Update package.json version to ${newVersion}`,
        content: Buffer.from(JSON.stringify(packageData, null, 2)).toString('base64'),
        branch,
      });
    } else {
      core.info('Package version is up-to-date.');
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();