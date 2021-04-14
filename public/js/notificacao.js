function validarCamposNotificacao(){

    const titulo = document.getElementById("tituloNotificacao").value
    const mensagem = document.getElementById("mensagemNotificacao").value

    if(titulo.trim() == "" || mensagem.trim() == ""){

        abrirModalAlerta("Preencha os campos obrigatórios")
    }else{

        obterDadosNotificacao(titulo,mensagem)
    }
}

function obterDadosNotificacao(titulo,mensagem){
    firebase.firestore().collection("app").doc("notificacao").get().then(function(documento){

        const dados = documento.data()

        const key = dados.key
        const topico = dados.topico

        abrirModalProgress()
        post(titulo,mensagem,topico,key)

    }).catch(function(error){

        abrirModalAlerta("Erro ao enviar Notificação: "+ error)
    })
}

function post(titulo,mensagem,topico,key){

    const xmlHttpRequest = new XMLHttpRequest()
    const url = "https://fcm.googleapis.com/fcm/send"

    xmlHttpRequest.open("POST",url,true)
    xmlHttpRequest.setRequestHeader("Content-Type","application/json")
    xmlHttpRequest.setRequestHeader("Authorization",key)

    xmlHttpRequest.onreadystatechange = function(){

        removerModalProgress()

        if(xmlHttpRequest.status == 200){

            limparCampos()
            abrirModalAlerta("Sucesso ao enviar notificação - Alguns clientes vão receber dentro de 5 minutos")
        }
        else{
            
            abrirModalAlerta("Falha ao enviar Notificação")
        }
    }
 
    const parametros = {
        "to": topico,
        "data": {
            "titulo":titulo,
            "mensagem":mensagem,
            "url_imagem": "https://firebasestorage.googleapis.com/v0/b/painel-delivery.appspot.com/o/app%2Fhomeapp%2Fimagem2?alt=media&token=2c6f9488-2752-42cd-a4b8-dc3e5057cfc6"
        }
    }

    const notificacao = JSON.stringify(parametros)

    xmlHttpRequest.send(notificacao)

}



//==================================================== MODAL PROGRESSBAR ====================================================

function abrirModalProgress() {
	$("#modalProgress").modal()
}

function removerModalProgress() {
	$("#modalProgress").modal("hide")
	window.setTimeout(function(){
		document.getElementById("modalProgress").click()
	},500)
}


//==================================================== MODAL ALERTA ====================================================
function abrirModalAlerta(mensagem) {
	$("#modalAlerta").modal()
	document.getElementById("alertaMenssagem").innerText = mensagem
}

//==================================================== LIMPAR CAMPOS ====================================================
function limparCampos(){
	document.getElementById("tituloNotificacao").value = ""
	document.getElementById("mensagemNotificacao").value = ""
}

//==================================================== PROXIMO CAMPO ====================================================
function proximoInput(id, evento){
    if (evento.keyCode == 13){
        document.getElementById(id).focus()
    }
}