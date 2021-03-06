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

//==================================================== MOSTRAR SENHA ====================================================
function revelarSenha(){
    const senha = document.getElementById("senha")
    const imagemRevelarSenha = document.getElementById("imagemRevelarSenha")

    if(senha.type == "password"){
        senha.type =  "text"
        imagemRevelarSenha.setAttribute("class","fas fa-eye-slash")
    }
    else{
        senha.type = "password"
        imagemRevelarSenha.setAttribute("class","fas fa-eye")
    }
}

//============================== PULAR INPUT COM ENTER ==================================
function proximoInput(id, evento){
    if(evento.keyCode == 13){
        document.getElementById(id).focus()
    }
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