# Mini-Project (Petri Net Design Studio)
## What Is A Petri Net
A Petri Net is a directed graph of places and transitions. The directed connections are called are and connect either place -> transition or transition -> place. Places have a non-negative amount of tokens called markings. A transition is enabled if all the places feeding into the transition have at least 1 marking. When a transition fires all the places feeding the transition have a marking removed and all the places fed by the transition get a marking.

## Potential Use Case
Petri nets are typically used to model the behavior of distributed systems. However can also be used to model things such as state machines.

## Installation
- install [Docker-Desktop](https://www.docker.com/products/docker-desktop)
- clone the repository
- edit the '.env' file so that the BASE_DIR variable points to the main repository directory
- `docker-compose build`
- `docker-compose up -d`
- connect to your server at http://localhost:8888

## Getting Started
### Creating New Project
1. Enter the name of the project and click create
2. Select either of the PetriNet (default) or PetriNetWithSamples seeds
3. Drag the PetriNet item from the tray into the Root composition and give it a name
4. Go into the newly created network by double clicking
5. Drag and drop places and transitions into the composition (to edit the attributes click on the place or transition and press the 'Enter' button when done)

### Using The Simulator
1. Click the "PetriNetViz" button in the Visulizer selector
2. To step through the simulation click on an active transition (green = active, red = disabled)
3. To reset the network to the original sate click on the "Reset Network" button (lightning bolt icon)
4. If the state is in deadlock you will get a notification along with all the transitions being red
5. To see the network classification click the "Classify Petri Net" button (Circle with right arrow)


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
