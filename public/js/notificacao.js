function validarCamposNotificação(){
	const titulo = document.getElementById("tituloNotificacao").value
	const mensagem = document.getElementById("mensagemNotificacao").value

	if(titulo.trim() == "" || mensagem.trim() == "" ){
		abrirModalAlerta("Preencha todos os campos")
	}
	else{
		abrirModalProgress()
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

function post(titulo, mensagem, topico, key){
	const xmlHttpRequest = new XMLHttpRequest()

	const url = "https://fcm.googleapis.com/fcm/send"

	xmlHttpRequest.open("POST", url, true)
	xmlHttpRequest.setRequestHeader("Content-Type","application/json")
	xmlHttpRequest.setRequestHeader("Authorization", key)

	xmlHttpRequest.onreadystatechange = function(){
		if(xmlHttpRequest.status == 200){
			limparCampos()
			abrirModalAlerta("Sucesso ao enviar a notificação")
		}
		else{
			abrirModalAlerta("Erro ao enviar notificação")
		}
	}

	const parametros = {
		"to": topico,
		"data":  {
			"titulo":titulo,
			"mensagem":mensagem,
			"url_imagem": "https://firebasestorage.googleapis.com/v0/b/paris-bistro-6b97e.appspot.com/o/app%2Fhomeapp%2Flogo_branca.png?alt=media&token=7f741e31-3f7d-4731-9c9a-9cbabebb0f32"
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