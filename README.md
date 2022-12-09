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
