const firebaseConfig = {
    apiKey: "AIzaSyDRIp4lGgH_chsQK0f064-yh19AuBeRgQo",
    authDomain: "paris-bistro-6b97e.firebaseapp.com",
    databaseURL: "https://paris-bistro-6b97e.firebaseio.com",
    projectId: "paris-bistro-6b97e",
    storageBucket: "paris-bistro-6b97e.appspot.com",
    messagingSenderId: "969052337299",
    appId: "1:969052337299:web:1a3a70d51d11f4f64fc966",
    measurementId: "G-HDRM88PYEG"
};

firebase.initializeApp(firebaseConfig)


//-------------------------------------------validar campos de login -------------------------------------------

function login(){
    const email = document.getElementById("email").value
    const senha = document.getElementById("senha").value

    if(email.trim() == "" || senha.trim() == ""){
        abrirModalAlerta("Preencha os campos Obrigatórios")
    }
    else{
        loginFirebase(email,senha)
    }
}


//----------login Firebase
function loginFirebase(email, senha){
    firebase.auth().signInWithEmailAndPassword(email, senha).then(function(){
        confirmarAdmin()
    }).catch(function(error) {
        abrirModalAlerta("Email ou senha incorretos") 
      });
}


//----------confirmar usuario admin Firebase
/*function confirmarAdmin(){

    abrirModalProgress()

    firebase.firestore().collection("web").doc("admin").get().then(function (doc){

        removerModalProgress()

        window.location.href = "pedidos.html"

    } ).catch(function(error){


        removerModalProgress()
        firebase.auth().signOut()

        const errorMessage = error.message
       // errorFirebase(errorMessage)
    })
}*/

function confirmarAdmin(){
    abrirModalProgress()
    
    firebase.firestore().collection("web").doc("admin").get().then(function (doc){
        
        removerModalProgress()

        const uid = doc.data().uid
        const uidAdmin = firebase.auth().currentUser.uid

        if(uid == uidAdmin){
            window.location.href = "pedidos.html"
        }
        else{
            firebase.auth().signOut()
            abrirModalAlerta("Login ou senha incorretos")
        }
    }).catch(function(error){
        removerModalProgress()
        abrirModalAlerta("Necessario ser administrador para acessar o painel")
        console.log("error"+ error.message)
    })
}


//==================================================== MODAL PROGRESSBAR ====================================================
function abrirModalProgress() {
	$("#modalProgress").modal()
}
function removerModalProgress() {
	$("#modalProgress").modal("hide")
	window.setTimeout(function () {
		document.getElementById("modalProgress").click()
	}, 500)
}

//==================================================== MODAL ALERTA ====================================================
function abrirModalAlerta(mensagem) {
	$("#modalAlerta").modal()
	document.getElementById("alertaMenssagem").innerText = mensagem
}

//==================================================== LIMPAR CAMPOS ====================================================
function limparCampos() {
	document.getElementById("email").value = ""
	document.getElementById("senha").value = ""
}