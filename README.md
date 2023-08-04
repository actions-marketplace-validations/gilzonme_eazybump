# eazybump
GitHub action to easily bump the NodeJS package version


## Usage

```
name: Your Workflow Name

on:
  push:
    branches:
      - main # Replace with your target branch name

jobs:
  your_job_name:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v2

      - name: Update Package Version
        uses: eazybump
        with:
          npm-token: ${{ secrets.NPM_AUTH_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          package-file: 'path/to/package.json' # Replace with the correct path to your package.json file
```