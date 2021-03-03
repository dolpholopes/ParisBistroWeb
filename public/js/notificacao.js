

let informativoRecuperadoBD;

let bd = firebase.firestore().collection("app").doc("homeapp")



//==================================================== OUVINTE ====================================================
bd.onSnapshot(function(documento){
    const dados = documento.data()

    const informativo = document.getElementById("informativo")
    const imagem1 = document.getElementById("imagem1")
    const imagem2 = document.getElementById("imagem2")

	informativoRecuperadoBD = dados.informativo

    informativo.value = dados.informativo
    imagem1.src = dados.url_imagem1
    imagem2.src = dados.url_imagem2
})


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

		postMessage(titulo, mensagem, topico, key)
	}).catch(function(error){
		abrirModalAlerta("Erro ao enviar notificação " + error)
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
			"mensagem":mensagem
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