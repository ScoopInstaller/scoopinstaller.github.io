
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
- Run `npm start`

Application should run on http://localhost:3000 or https://localhost:5000 to pass CORS checks and query the search database.

#### Build the application
- Run `npm run build`

### Contribute to this project
Pull requests are most welcome!
Please target the `develop` branch and run `npm run build` (or at least `npm run lint`) to ensure your changes compile and match the code guidelines.
