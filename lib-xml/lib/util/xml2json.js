define([
    "lib-xml", 
    "lib-ecmaext",
    "lib-ecmaext/json",
    "optional!debug/console"], 
    function(getXmlDom, ecma, json, console){

var json2xml_Obj  = {};
var json2xml_Attr = {};
var json2xml_ObjByAttr = {};

return {
    /**
     * Creates xml nodes from an JSON string/ object recursively.
     *
     * @param {String}  strJson     the JSON definition.
     * @param {Boolean} [noError]  whether an exception should be thrown by the parser when the xml is not valid.
     * @param {Boolean} [preserveWhiteSpace]  whether whitespace that is present between XML elements should be preserved
     * @return {XMLNode} the created xml document (NOT the root-node).
     */
    json2Xml : (function(){
        var jsonToXml = function (v, name, xml, notag) {
            var i, n, m, t; 
            // do an apf warn
            function cleanString(s){
                return s.replace(/&/g,"&amp;").replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
            }
            if(!notag){
                if(name != (m=name.replace(/[^a-zA-Z0-9_-]/g, "_")))
                    console && console.warn("Json2XML, invalid characters found in JSON tagname '" + name, "json2Xml");
                name = m;
            }    
            if (v.dataType == ecma.ARRAY) {
                for (i = 0, n = v.length; i < n; i++)
                    jsonToXml(v[i],name,xml);
            }
            else if (typeof v == "object") {
                var hasChild = false, objAttr = null;
                
                if(!notag)xml.push("<", name);
                for (i in v) {
                    if ((n=json2xml_Attr[i]) || i.charAt(0)=='@'){
                        if(!n && !objAttr) objAttr = json2xml_ObjByAttr[i.slice(1)];
                        if(!notag)xml.push(" ", n?n:i.slice(1), "=\"", cleanString(v[i].toString()), "\"");
                    } else 
                       hasChild = true;
                }
                if (hasChild) {
                    if(!notag)xml.push(">");
                    if(t=(objAttr || json2xml_Obj[name])){
                        if(t==1) t = { child : name.replace(/(.*)s$/,"$1")||name, key : "name", value: "value"};
                        for (i in v) {
                            if(i.charAt(0)!='@' && !json2xml_Attr[i]){
                                if( typeof(m = v[i]) =='object'){
                                    if(json2xml_Obj[i]){
                                        jsonToXml(m,i,xml);
                                    }else {
                                        xml.push("<",t.child," ",t.key,"=\"",cleanString(i.toString()),"\" >");
                                        jsonToXml(m, i,xml,true);
                                        xml.push("</",t.child,">\n");
                                    }
                                } else {
                                    xml.push("<",t.child," ",t.key,"=\"",i,"\" ");
                                    if(t.value){
                                        if(t.value==1)
                                            xml.push("/>");
                                        else
                                            xml.push(t.value,"=\"",cleanString(v[i].toString()),"\"/>");
                                    }else
                                     xml.push(">",cleanString(v[i].toString()),"</",t.child,">");
                                }
                            }
                        }
                        if(!notag)xml.push("</",name,">\n");
                    }else{
                        for (i in v) {
                            if (!json2xml_Attr[i] && i.charAt(0)!='@'){
                               if(i.match(/[^a-zA-Z0-9_-]/g)){
                                   console && console.warn("Json2XML, invalid characters found in JSON tagname: '" + i, "json2Xml");
                               }else
                                   jsonToXml(v[i], i, xml,false);
                            }
                        }
                        if(!notag)xml.push("</", name, ">");
                    }
                }else if(!notag)xml.push("/>");
            }
            else {
                if(!notag)xml.push("<", name, ">", cleanString(v.toString()), "</", name, ">");
                else xml.push( cleanString(v.toString()));
           }
         
        }
            
        return function(strJson, noError, preserveWhiteSpace) {
            var o   = (typeof strJson == "string" && json.isJson(strJson))
              ? JSON.parse(strJson.replace(/""/g, '" "'))//eval("(" + strJson + ")")
              : strJson,
                xml = [], i;
            jsonToXml(o,"jsondoc", xml, false);
    
            return getXmlDom(xml.join("").replace(/\t|\n/g, ""), noError, true);//preserveWhiteSpace);//@todo apf3.0
        };
    })(),
    
    xml2json : function (xml, noattrs) {
        // alright! lets go and convert our xml back to json.
        var filled, out = {}, o, nodes = xml.childNodes, cn, i,j, n,m, u,v,w, s,t,cn1,u1,v1,t1,name; 
    
        if(!noattrs){
            if(m = (xml.attributes))for(u = 0,v = m.length; u < v; u++){
              t = json2xml_Attr[w=m[u].nodeName] || ('@'+w);
              if(t.indexOf('@a_')!=0)out[t] = m[u].nodeValue, filled = true;
            }
        }
    
        for (var i = 0, j = nodes.length;i<j; i++) {
            if ((n = nodes[i]).nodeType != 1)
                continue;
             name = n.tagName;
            filled = true;
    
            // scan for our special attribute
            t = s = null,o = {};
    
            if(m = (n.attributes))for(u = 0,v = m.length; u < v; u++){
                o['@'+(w = m[u].nodeName)] = m[u].nodeValue;
                if(!s)s = json2xml_ObjByAttr[w];
            }
            if(t = s || json2xml_Obj[name]){
                if(t==1)t={key:'name',value:'value'};
                // lets enumerate the children
                for(cn = n.childNodes, u=0,v = cn.length;u<v;u++){
                    if ((s = cn[u]).nodeType != 1) continue;
                    
                    if(t1 = json2xml_Obj[s.nodeName]){
                        var o2={};
                        for(cn1 = s.childNodes, u1=0,v1 = cn1.length;u1<v1;u1++){
                            if ((s1 = cn1[u1]).nodeType != 1) continue;
                             if(w=s1.getAttribute(t1.key)){
                                o2[w] = (t1.value==1?(s1.childNodes.length?this.xml2json(s1,1):1):(s1.getAttribute(t1.value||'value')) || this.xml2json(s1,1));
                            }
                        }
                        o[s.nodeName]=o2;
                    } else {
                        if(w=s.getAttribute(t.key)){
                            o[w] = (t.value==1?(s.childNodes.length?this.xml2json(s,1):1):(s.getAttribute(t.value||'value')) || this.xml2json(s,1));
                        }
                   }
                }
            }else{
                o =  this.xml2json( n );
            }
            if(out[name] !== undefined){
                if((s=out[name]).dataType!=ecma.ARRAY)
                    out[name]=[s,o];
                else out[name].push(o);
            }else out[name] = o;
        }
       
        if (filled)
            return out;
        
        return (xml.nodeType == 1 
            ? (xml.firstChild ? xml.firstChild.nodeValue : "") 
            : xml.nodeValue);
    }
}

    }
);