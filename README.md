[![Deployment status](https://img.shields.io/github/actions/workflow/status/ScoopInstaller/scoopinstaller.github.io/build-deploy.yml?label=Deployment&logo=github&style=flat-square)](https://github.com/ScoopInstaller/scoopinstaller.github.io/deployments)
[![Open in GitHub Codespaces](https://img.shields.io/badge/Codespaces-Open%20in%20GitHub%20CodeSpaces-blue?logo=github&style=flat-square)](https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=276677210)

# Scoop website

This repository is used to build the Scoop website https://scoopinstaller.github.io


### Build this project

#### Get the source
- If you already use Scoop, install Git and clone the repository:
```
scoop install git
git clone https://github.com/ScoopInstaller/scoopinstaller.github.io
cd scoopinstaller.github.io
```

#### Prerequisites
- Install a recent [Node](https://nodejs.org/en/ "Node") version >= 16.0.0, e.g. `scoop install nodejs`
- Run `npm update`

#### Launch the application
- Run `npm run dev`

Application should run on http://localhost:3000 or https://localhost:5000 to pass CORS checks and query the search database.

#### Build the application
- Run `npm run build`

#### Preview the production build
- Run `npm run preview`

### Contribute to this project
Pull requests are most welcome!
Please target the `main` branch and run `npm run build` (or at least `npm run lint`) to ensure your changes compile and match the code guidelines.
