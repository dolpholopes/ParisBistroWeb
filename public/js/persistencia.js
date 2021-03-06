firebase.firestore().settings({
    cacheSizeBytes: 10405760
});


firebase.firestore().enablePersistence().then(function(){

    
}).catch(function(err){
    if(err.code == 'failed-precondition'){
        
    }
    else if(err.code == 'unimplemented'){
        
    }
});