//#ifdef __WITH_ELEMENT_FROM_POINT
    
    if (!document.elementFromPoint) {
        Document.prototype.elementFromPointRemove = function(el){
            if (!this.RegElements) return;

            this.RegElements.remove(el);
        };
        
        Document.prototype.elementFromPointAdd = function(el){
            if (!this.RegElements)
                this.RegElements = [];
            this.RegElements.push(el);
        };
        
        Document.prototype.elementFromPointReset = function(RegElements){
            //define globals
            FoundValue   = [];
            FoundNode    = null;
            LastFoundAbs = document.documentElement;
        };
        
        Document.prototype.elementFromPoint = function(x, y){
            // Optimization, Keeping last found node makes it ignore all lower levels 
            // when there is no possibility of changing positions and zIndexes
            /*if(self.FoundNode){
                var sx = getElementPosX(FoundNode); 
                var sy = getElementPosY(FoundNode);
                var ex = sx + FoundNode.offsetWidth; var ey = sy + FoundNode.offsetHeight;
            }
            if(!self.FoundNode || !(x > sx && x < ex && y > sy && y < ey))*/
                document.elementFromPointReset();
        
            // Optimization only looking at registered nodes
            if (this.RegElements) {
                var calc_z = -1,
                    i, calc, n, sx, sy, ex, ey, z
                for (calc_z = -1, calc, i = 0; i < this.RegElements.length; i++) {
                    n = this.RegElements[i];
                    if (getStyle(n, "display") == "none") continue;
        
                    sx = getElementPosX(n); 
                    sy = getElementPosY(n);
                    ex = sx + n.offsetWidth;
                    ey = sy + n.offsetHeight;
                    
                    if (x > sx && x < ex && y > sy && y < ey) {
                        z = getElementZindex(n);
                        if (z > calc_z) { //equal z-indexes not supported
                            calc   = [n, x, y, sx, sy];
                            calc_z = z;
                        }
                    }
                }
                
                if (calc) {
                    efpi(calc[0], calc[1], calc[2], 0, FoundValue, calc[3], calc[4]);
                    if (!FoundNode) {
                        FoundNode    = calc[0];
                        LastFoundAbs = calc[0];
                        FoundValue   = [calc_z];
                    }
                }
            }
            
            if (!this.RegElements || !this.RegElements.length)
                efpi(document.body, x, y, 0, [], getElementPosX(document.body),
                    getElementPosY(document.body));
                
            return FoundNode;
        };
        
        function efpi(from, x, y, CurIndex, CurValue, px, py){
            var StartValue = CurValue,
                StartIndex = CurIndex,
            //Loop through childNodes
                nodes      = from.childNodes,
                n, i, z, sx, sy, ex, ey, isAbs, isHidden, inSpace;
            for (n, i = 0; i < from.childNodes.length; i++) {
                n = from.childNodes[i];
                if (n.nodeType == 1 && getStyle(n, "display") != "none" && n.offsetParent) {
                    sx = px + n.offsetLeft - n.offsetParent.scrollLeft;//getElementPosX(n); 
                    sy = py + n.offsetTop - n.offsetParent.scrollTop;//getElementPosY(n);
                    ex = sx + n.offsetWidth;
                    ey = sy + n.offsetHeight;
                    
                    //if(Child is position absolute/relative and overflow == "hidden" && !inSpace) continue;
                    isAbs    = getStyle(n, "position");
                    isAbs        = (isAbs == "absolute") || (isAbs == "relative");
                    isHidden = getStyle(n, "overflow") == "hidden";
                    inSpace  = (x > sx && x < ex && y > sy && y < ey);

                    if (isAbs && isHidden && !inSpace) continue;
            
                    CurIndex = StartIndex;
                    CurValue = StartValue.copy();
            
                    //if (Child is position absolute/relative and has zIndex) or overflow == "hidden"
                    z = parseInt(getStyle(n, "zIndex")) || 0;
                    if (isAbs && (z || z == 0) || isHidden) {
                        //if(!is position absolute/relative) zIndex = 0
                        if (!isAbs) z = 0;
                        
                        //if zIndex >= FoundValue[CurIndex] 
                        if (z >= (FoundValue[CurIndex] || 0)) {
                            //if zIndex > CurValue[CurIndex];
                            if (z > (CurValue[CurIndex] || 0)) {
                                //CurValue = StartValue.copy();
                                
                                //set CurValue[CurIndex] = zIndex
                                CurValue[CurIndex] = z;
                            }
                            
                            CurIndex++;
                            
                            //if(inSpace && CurIndex >= FoundValue.length)
                            if (inSpace && CurIndex >= FoundValue.length) {
                                //Set FoundNode is currentNode
                                FoundNode = n;
                                //Set FoundValue is CurValue
                                FoundValue = CurValue;//.copy();
                                
                                LastFoundAbs = n;
                            }
                        }
                        else
                            continue; //Ignore this treedepth
                    }
                    else if(inSpace && CurIndex >= FoundValue.length){
                        //else if CurValue[CurIndex] continue; //Ignore this treedepth
                        //else if(CurValue[CurIndex]) continue;
                        
                        //Set FoundNode is currentNode
                        FoundNode = n;
                        //Set FoundValue is CurValue
                        FoundValue = CurValue;//.copy();
                    }
                    
                    //loop through childnodes recursively
                    efpi(n, x, y, CurIndex, CurValue, isAbs ? sx : px, isAbs ? sy : py)
                }
            }
        }
        
        function getElementPosY(myObj){
            return myObj.offsetTop + parseInt(apf.getStyle(myObj, "borderTopWidth"))
                + (myObj.offsetParent ? getElementPosY(myObj.offsetParent) : 0);
        }
        
        function getElementPosX(myObj){
            return myObj.offsetLeft + parseInt(apf.getStyle(myObj, "borderLeftWidth"))
                + (myObj.offsetParent ? getElementPosX(myObj.offsetParent) : 0);
        }
        
        function getElementZindex(myObj){
            //This is not quite sufficient and should be changed
            var z = 0, n, p = myObj;
            while (p && p.nodeType == 1) {
                z = Math.max(z, parseInt(getStyle(p, "zIndex")) || -1);
                p = p.parentNode;
            }
            return z;
        }
    }
    
    //#endif