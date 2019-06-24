function node(){
    return {
        "next": {},
        "methods": {}
    }
}
const self={
    "get_interfaces": (api)=>{
        let nodes=node();
        let warnings=[];
        let operations={};
        const paths=Object.keys(api.paths);
        for (let path of paths){
            let tree=nodes;
            let arguments=[];
            for(let part of path.split("/")){
                if(part=="") continue;
                if(part.startsWith("{")){ // Parameter
                    const param_name=part.slice(1, -1);
                    if(!tree.next_any){
                        tree.next_any=node();
                    }
                    arguments.push(param_name);
                    tree=tree.next_any;
                }else{ // Given name
                    if(!tree.next[part]){
                        tree.next[part]=node();
                    }
                    tree=tree.next[part];
                }
                
            }
            for(let verb of Object.keys(api.paths[path])){
                let method=verb.toUpperCase();
                if(tree.methods[verb]){
                    warnings.push(`API endpoint ${method} ${path} defined twice! This is most likely that you used one wildcard in two different names.`);
                }
                tree.methods[method]={
                    "arguments": arguments,
                    "op": api.paths[path][verb].operationId
                }
                if(!api.paths[path][verb].operationId){
                    warnings.push(`${path} ${verb} does not have an operationID. This function will always be inaccessible.`);
                }else{
                    if(operations[api.paths[path][verb].operationId]){
                        warnings.push(`Two paths bound to the same operation: ${api.paths[path][verb].operationId}.`);
                    }
                    operations[api.paths[path][verb].operationId]={path, verb, "ref": tree.methods[method]};
                }
                
            }
        }
        return {nodes, warnings, operations}
    },
    "traverse": (compiled_api, f)=>{
        for(let method of Object.keys(compiled_api.methods)){
            f(compiled_api.methods[method]);
        }
        for(let n of Object.keys(compiled_api.next)){
            self.traverse(compiled_api.next[n], f);
        }
        if(compiled_api.next_any){
            self.traverse(compiled_api.next_any, f);
        }
    }

}

module.exports=self;