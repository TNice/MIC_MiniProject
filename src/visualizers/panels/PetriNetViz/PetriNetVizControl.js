/*globals define, WebGMEGlobal*/
/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Mon Dec 05 2022 19:06:47 GMT+0000 (Coordinated Universal Time).
 */

define([
    'js/Constants',
    'js/Utils/GMEConcepts',
    'js/NodePropertyNames'
], function (
    CONSTANTS,
    GMEConcepts,
    nodePropertyNames
) {

    'use strict';

    function PetriNetVizControl(options) {

        this._logger = options.logger.fork('Control');

        this._client = options.client;

        // Initialize core collections and variables
        this._widget = options.widget;

        this._currentNodeId = null;
        //this._currentNodeParentId = undefined;

        this._networkRootLoaded = false;
        
        this._widget._control = this;

        this._initWidgetEventHandlers();

        this._logger.debug('ctor finished');
    }

    PetriNetVizControl.prototype._initWidgetEventHandlers = function () {
        this._widget.onNodeClick = function (id) {
            // Change the current active object
            WebGMEGlobal.State.registerActiveObject(id);
        };
    };

    /* * * * * * * * Visualizer content update callbacks * * * * * * * */
    // One major concept here is with managing the territory. The territory
    // defines the parts of the project that the visualizer is interested in
    // (this allows the browser to then only load those relevant parts).
    PetriNetVizControl.prototype.selectedObjectChanged = function (nodeId) {
        var self = this;

        // Remove current territory patterns
        if (self._currentNodeId) {
            self._client.removeUI(self._territoryId);
            self._networkRootLoaded = false;
        }

        self._currentNodeId = nodeId;
        //self._currentNodeParentId = undefined;

        if (typeof self._currentNodeId === 'string') {
            // Put new node's info into territory rules
            self._selfPatterns = {};
            
            self._selfPatterns[nodeId] = {children: 1};

            self._territoryId = self._client.addUI(self, function (events) {
                self._eventCallback(events);
            });

            // Update the territory
            self._client.updateTerritory(self._territoryId, self._selfPatterns);

        }
    };

    /* * * * * * * * Node Event Handling * * * * * * * */
    PetriNetVizControl.prototype._eventCallback = function (events) {    
        const self = this;
        console.log(events);
        events.forEach(event => {
            if(event.eid && event.eid === self._currentNodeId){
                if(event.etype == 'load' || event.etpye == 'update'){
                    self._networkRootLoaded = true;
                }
                else{
                    self.clearPN();
                    return;
                }
            }
        });

        if (events.length && events[0].etype == 'complete' && self._networkRootLoaded){
            self._initPN();
        }
    };


    PetriNetVizControl.prototype._stateActiveObjectChanged = function (model, activeObjectId) {
        if (this._currentNodeId === activeObjectId) {
            // The same node selected as before - do not trigger
        } else {
            this.selectedObjectChanged(activeObjectId);
        }
    };

    /* * * * * * * * Machine Manipulation Functions * * * * * * * */
    PetriNetVizControl.prototype._initPN = function () {
        const self = this;
        const rawMETA = self._client.getAllMetaNodes();
        const META = {};
        rawMETA.forEach(node => {
            META[node.getAttribute('name')] = node.getId();
        });
        
        const pnNode = self._client.getNode(self._currentNodeId);
        const elementIds = pnNode.getChildrenIds();
        const pn = {places: {}, transitions: {}};
        elementIds.forEach(id => {
            const node = self._client.getNode(id);
            if (node.isTypeOf(META['Transition'])){
                const transition = {name: node.getAttribute('name'), next:{}, position: node.getRegistry('position'), prev: []};

                elementIds.forEach(nextId => {
                    const nextNode = self._client.getNode(nextId);
                    if(nextNode.isTypeOf(META['Arc']) && nextNode.getPointerId('src') === id) {
                        transition.next[nextNode.getPointerId('dst')] = nextNode.getPointerId('dst');
                    }
                });
                pn.transitions[id] = transition;
            }
        });

        elementIds.forEach(id => {
            const node = self._client.getNode(id);
            if (node.isTypeOf(META['Place'])){
                const place = {name: node.getAttribute('name'), next:{}, position: node.getRegistry('position'), marking: node.getAttribute('marking')};
                elementIds.forEach(nextId => {
                    const nextNode = self._client.getNode(nextId);
                    if(nextNode.isTypeOf(META['Arc']) && nextNode.getPointerId('src') === id) {
                        place.next[nextNode.getPointerId('dst')] = nextNode.getPointerId('dst');
                        pn.transitions[nextNode.getPointerId('dst')].prev.push(place)
                    }
                });
                pn.places[id] = place;
            }
        });

        self._widget.initNetwork(pn);
        console.log(pn)
    };

    PetriNetVizControl.prototype.clearPN = function () {
        const self = this;
        self._networkRootLoaded = false;
        self._widget.destroyNetwork();
    };

    PetriNetVizControl.prototype.runDeadlockCheck = function () {
        var self = this;
        const context = self._client.getCurrentPluginContext('CheckDeadlock', self._currentNodeId, []);
        context.pluginConfig = {};
        self._client.runServerPlugin(
            'CheckDeadlock',
            context,
            function(err, result){
                console.log('plugin err:', err);
                console.log('plugin result:', result);
            });
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    PetriNetVizControl.prototype.destroy = function () {
        this._detachClientEventListeners();
        this._removeToolbarItems();
    };

    PetriNetVizControl.prototype._attachClientEventListeners = function () {
        this._detachClientEventListeners();
        WebGMEGlobal.State.on('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged, this);
    };

    PetriNetVizControl.prototype._detachClientEventListeners = function () {
        WebGMEGlobal.State.off('change:' + CONSTANTS.STATE_ACTIVE_OBJECT, this._stateActiveObjectChanged);
    };

    PetriNetVizControl.prototype.onActivate = function () {
        this._attachClientEventListeners();
        this._displayToolbarItems();

        if (typeof this._currentNodeId === 'string') {
            WebGMEGlobal.State.registerActiveObject(this._currentNodeId, {suppressVisualizerFromNode: true});
        }
    };

    PetriNetVizControl.prototype.onDeactivate = function () {
        this._detachClientEventListeners();
        this._hideToolbarItems();
    };

    /* * * * * * * * * * Updating the toolbar * * * * * * * * * */
    PetriNetVizControl.prototype._displayToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].show();
            }
        } else {
            this._initializeToolbar();
        }
    };

    PetriNetVizControl.prototype._hideToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].hide();
            }
        }
    };

    PetriNetVizControl.prototype._removeToolbarItems = function () {

        if (this._toolbarInitialized === true) {
            for (var i = this._toolbarItems.length; i--;) {
                this._toolbarItems[i].destroy();
            }
        }
    };

    PetriNetVizControl.prototype._initializeToolbar = function () {
        var self = this,
            toolBar = WebGMEGlobal.Toolbar;

        this._toolbarItems = [];

        this._toolbarItems.push(toolBar.addSeparator());

        /************** Go to hierarchical parent button ****************/
        this.$btnReset = toolBar.addButton({
            title: 'Reset Network',
            icon: 'glyphicon glyphicon-flash',
            clickFn: function (/*data*/) {
                //WebGMEGlobal.State.registerActiveObject(self._currentNodeParentId);
                self._initPN();
                console.log("Reset Our Network");
            }
        });
        this._toolbarItems.push(this.$btnReset);

        this.$btnClassify = toolBar.addButton({
            title: 'Classify Petri Net',
            icon: 'glyphicon glyphicon-circle-arrow-right',
            clickFn: function (/*data*/) {
                const context = self._client.getCurrentPluginContext('PetriNetPlugin', self._currentNodeId, []);
                context.pluginConfig = {};
                self._client.runServerPlugin(
                    'PetriNetPlugin',
                    context,
                    function(err, result){
                        console.log('plugin err:', err);
                        console.log('plugin result:', result);
                    }
                );
            }
        });
        this._toolbarItems.push(this.$btnClassify);

        /************** Checkbox example *******************/

        this.$cbShowConnection = toolBar.addCheckBox({
            title: 'toggle checkbox',
            icon: 'gme icon-gme_diagonal-arrow',
            checkChangedFn: function (data, checked) {
                self._logger.debug('Checkbox has been clicked!');
            }
        });
        this._toolbarItems.push(this.$cbShowConnection);

        this._toolbarInitialized = true;
    };

    return PetriNetVizControl;
});
