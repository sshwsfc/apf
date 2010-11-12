module.declare(function(require, exports, module){
//Modify DOMDocument with the following properties

    //#ifdef __WITH_CONTENTEDITABLE
    //designMode property
    
    var selection;
    this.getSelection = function(){
        if (!selection)
            selection = new apf.AmlSelection(this);
        return selection;
    }
    
    var selectrect;
    this.$getSelectRect = function(){
        if (!selectrect)
            selectrect = new apf.selectrect();
        return selectrect;
    }
    
    var visualselect;
    this.$getVisualSelect = function(){
        if (!visualselect)
            visualselect = new apf.visualSelect(this.getSelection());
        return visualselect;
    }
    
    var visualconnect;
    this.$getVisualConnect = function(){
        if (!visualconnect)
            visualconnect = new apf.visualConnect(this.getSelection());
        return visualconnect;
    }
    
    this.createRange = function(){
        return new apf.AmlRange(this);
    }
    
    this.queryCommandState = function(commandId){
        return (this.$commands[commandId.toLowerCase()] || apf.K)
            .call(this, null, null, null, 1) || false;
    };

    this.queryCommandValue = function(commandId){
        return (this.$commands[commandId.toLowerCase()] || apf.K)
            .call(this, null, null, null, 2) || false;
    };
    
    this.queryCommandEnabled = function(commandId){
        return (this.$commands[commandId.toLowerCase()] || apf.K)
            .call(this, this.getSelection().$getNodeList(), false, arguments[2], 3) || false;
    };
    
    this.queryCommandIndeterm = function(commandId){
        return (this.$commands[commandId.toLowerCase()] || apf.K)
            .call(this, null, null, null, 4) || false;
    };
    
    this.queryCommandSupported = function(commandId){
        return this.$commands[commandId.toLowerCase()] ? true : false;
    };

    var special = {"commit":1,"rollback":1,"begin":1,"undo":1,"redo":1,"contextmenu":2,"mode":2,"pause":1};
    this.execCommand = function(commandId, showUI, value, query){
        var f;

        //if command is not enabled, do nothing
        if (!(f = this.$commands[commandId.toLowerCase()]))
            return false;
        
        if (special[commandId] == 1)
            return f.call(this, null, null, value);

        //Get Selection
        //var nodes = this.getSelection().$getNodeList();
        var nodes = this.$getVisualSelect().getLastSelection()
            || this.getSelection().$getNodeList();
        
        //Execute Action
        if (special[commandId] == 2)
            f.call(this, nodes, showUI, value, query);
        else {
            this.$commands.begin.call(this);
            if (f.call(this, nodes, showUI, value, query) === false)
                this.$commands.rollback.call(this);
            else
                this.$commands.commit.call(this); //Will only record if there are any changes
        }
    };
    
    this.$commands = {};
})
