"""
This is where the implementation of the plugin code goes.
The PetriNetPlugin-class is imported from both run_plugin.py and run_debug.py
"""
import sys
import logging
from webgme_bindings import PluginBase

# Setup a logger
logger = logging.getLogger('PetriNetPlugin')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)  # By default it logs to stderr..
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


class PetriNetPlugin(PluginBase):
    def main(self):
        core = self.core
        root_node = self.root_node
        META = self.META
        active_node = self.active_node
        
        isFreeChoice = True
        isStateMachine = True
        isMarked = True
        isWorkflow = False

        places = {}
        transitions = {}
        graph = {}

        nodes = core.load_children(active_node)
        
        #Creates dictionaries of places and transitions with their in and out arcs
        for node in nodes:
            if core.is_type_of(node, META['Place']):
                places[core.get_path(node)] = {'in': [], 'out': []}
                graph[core.get_path(node)] = []
            elif core.is_type_of(node, META['Transition']):
                transitions[core.get_path(node)] = {'in': [], 'out': []}
                graph[core.get_path(node)] = []

        for node in nodes:
            if core.is_type_of(node, META['Arc']):
                if core.get_pointer_path(node, 'src') in places:
                    places[core.get_pointer_path(node, 'src')]['out'].append(core.get_pointer_path(node, 'dst'))
                    transitions[core.get_pointer_path(node, 'dst')]['in'].append(core.get_pointer_path(node, 'src'))
                    graph[core.get_pointer_path(node, 'src')].append(core.get_pointer_path(node, 'dst'))
                elif core.get_pointer_path(node, 'src') in transitions:
                    transitions[core.get_pointer_path(node, 'src')]['out'].append(core.get_pointer_path(node, 'dst'))
                    places[core.get_pointer_path(node, 'dst')]['in'].append(core.get_pointer_path(node, 'src'))
                    graph[core.get_pointer_path(node, 'src')].append(core.get_pointer_path(node, 'dst'))

        

        #Check If State Machine
        for t in transitions:
            if len(transitions[t]['in']) != 1 or len(transitions[t]['out']) != 1:
                isStateMachine = False
                break

        #Check If Free Choice
        for t1 in transitions:
            if not isFreeChoice:
                    break
            for t2 in transitions:
                if not isFreeChoice:
                    break
                if t1 == t2:
                    continue
                for p in transitions[t1]['in']:
                    if p in transitions[t2]['in']:
                        isFreeChoice = False
                        break
        
        #Check If Marked Graph
        for p in places:
            if len(places[p]['in']) != 1 or len(places[p]['out']) != 1:
                isMarked = False
                break

        #Check For Source and Sink
        sources = []
        sinks = []
        for p in places:
            if len(places[p]['in']) == 0:
                sources.append(p)

            if len(places[p]['out']) == 0:
                sinks.append(p)

        

        if len(sources) == 1 and len(sinks) == 1:
            isWorkflow = True

        if isWorkflow:
            #Check Workflow
            paths = [[]]

            def GetAllPaths(graph, currentNode, dst, path):
                path.append(currentNode)
                if currentNode == dst:
                    paths.append(path)
                for next in graph[currentNode]:
                    if next in path:
                        continue
                    GetAllPaths(graph, next, dst, path.copy())
                 
            GetAllPaths(graph, sources[0], sinks[0], [])

            for p in places:
                if not isWorkflow:
                    break
                for path in paths:
                    if p in path:
                        break
                    isWorkflow = False

        #Create Output Notification
        networkType = {'Free Choice Net': isFreeChoice, 'State Machine': isStateMachine, 'Marked Graph': isMarked, 'Workflow Net': isWorkflow}
        notify_str = "Network is "

        i = 0
        for k in networkType:
            if networkType[k] == False:
                continue
            
            if i > 0:
                notify_str += ' and '

            notify_str += f'a {k}'

            i += 1
        
        if notify_str == "Network is ":
            notify_str = 'Petri Net Has No Special Classification' 

        self.send_notification(notify_str)
