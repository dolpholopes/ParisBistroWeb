
window.onload = function (){
    firebase.auth().onAuthStateChanged(function (user){
        if(user){

        }
        else{
           // alert("Usuario não esta logado")
            window.location.href = "index.html"
        }
    })
}


function deslogar(){
    firebase.auth().signOut()
    window.location.href = "index.html"
}
