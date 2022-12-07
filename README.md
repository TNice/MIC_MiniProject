# Mini-Project (Petri Net Design Studio)
## What Is A Petri Net

## Installation
- install [Docker-Desktop](https://www.docker.com/products/docker-desktop)
- clone the repository
- edit the '.env' file so that the BASE_DIR variable points to the main repository directory
- `docker-compose up -d`
- connect to your server at http://localhost:8888

## Getting Started

## Features and Use

## Main docker commands
All of the following commands should be used from your main project directory (where this file also should be):
- To **rebuild** the complete solution `docker-compose build` (and follow with the `docker-compose up -d` to restart the server)
- To **debug** using the logs of the WebGME service `docker-compose logs webgme`
- To **stop** the server just use `docker-compose stop`
- To **enter** the WebGME container and use WebGME commands `docker-compose exec webgme bash` (you can exit by simply closing the command line with linux command 'exit') 
- To **clean** the host machine of unused (old version) images `docker system prune -f`
## Using WebGME commands to add components to your project
In general, you can use any WebGME commands after you successfully entered the WebGME container. It is important to note that only the src directory is shared between the container and the host machine, so you need to additionally synchronize some files after finishing your changes inside the container! The following is few scenarios that frequently occur:
### Adding new npm dependency
When you need to install a new library you should follow these steps:
- enter the container
- `npm i -s yourNewPackageName`
- exit the container
- copy the package.json file `docker-compose cp webgme:/usr/app/package.json package.json`

Alternatively, run the 'add_npm_package.bat(sh)' and follow instructions.
### Adding new interpreter/plugin to your DS
Follow these steps to add a new plugin:
- enter the container
- for JS plugin: `npm run webgme new plugin MyPluginName`
- for Python plugin: `npm run webgme new plugin --language Python MyPluginName`
- exit container
- copy webgme-setup.json `docker-compose cp webgme:/usr/app/webgme-setup.json webgme-setup.json`
- copy webgme-config `docker-compose cp webgme:/usr/app/config/config.webgme.js config/config.webgme.js`

Alternatively, run the 'create_plugin.bat(sh)' and follow instructions.
### Adding new visualizer to your DS
Follow these steps to add a new visualizer:
- enter the container
- `npm run webgme new viz MyVisualizerName`
- exit container
- copy webgme-setup.json `docker-compose cp webgme:/usr/app/webgme-setup.json webgme-setup.json`
- copy webgme-config `docker-compose cp webgme:/usr/app/config/config.webgme.js config/config.webgme.js`

Alternatively, run the 'create_visualizer.bat(sh)' and follow instructions.
### Adding new seed to your DS
Follow these steps to add a new seed based on an existing project in your server:
- enter the container
- `npm run webgme new seed MyProjectName -n MySeedName`
- exit container
- copy webgme-setup.json `docker-compose cp webgme:/usr/app/webgme-setup.json webgme-setup.json`
- copy webgme-config `docker-compose cp webgme:/usr/app/config/config.webgme.js config/config.webgme.js`

Alternatively, run the 'create_seed.bat(sh)' and follow instructions.
