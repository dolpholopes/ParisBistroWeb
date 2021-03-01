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

let bd = firebase.firestore().collection("pedidos");

let tabela = document.getElementById("tabelaPedidos").getElementsByTagName("tbody")[0];

let pedidoSelecionadoFinalizarPedido;

let pedidoSelecionadoCliente;

let keyLista = []


//==================================================== OUVINTE ====================================================

bd.where("pedido_status", "==", "em andamento").onSnapshot(function (documentos) {

	documentos.docChanges().forEach(function (changes) {

		if (changes.type === "added") {
			const doc = changes.doc
			const dados = doc.data()
			keyLista.push(dados.pedido_id)
			criarItensTabela(dados)
		}
		else if (changes.type === "modified") {
			const doc = changes.doc
			const dados = doc.data()
		}
		else if (changes.type === "removed") {
			const doc = changes.doc
			const dados = doc.data()
			removerItensTabela(dados)
		}
	})
})


//==================================================== TABELA ==================================================== 

//---- adicionando itens tabela
function criarItensTabela(dados) {

	const linha = tabela.insertRow()

	const colunaClienteNome = linha.insertCell(0)
	const colunaPedidoDados = linha.insertCell(1)
	const colunaPedidoHora = linha.insertCell(2)

	const dados_pedido = dados.pedido_dados.substr(0, 10) + " ..."

	colunaClienteNome.appendChild(document.createTextNode(dados.cliente_nome))
	colunaPedidoDados.appendChild(document.createTextNode(dados_pedido.replace(/<br>/g, "")))
	colunaPedidoHora.appendChild(document.createTextNode(dados.pedido_data))

	criarBotoesTabela(linha, dados)

	//ordemCrescente()
}


//---- removendo itens tabela
function removerItensTabela(dados) {

	const index = keyLista.indexOf(dados.pedido_id)

	tabela.rows[index].remove()
	keyLista.splice(index, 1)

}

//---- criar botoes tabela
function criarBotoesTabela(linha, dados) {

	const colunaPedidoInf = linha.insertCell(3)
	const colunaClienteInf = linha.insertCell(4)
	const colunaImprimir = linha.insertCell(5)
	const colunaFinalizar = linha.insertCell(6)

	const buttonDetalhesPedido = document.createElement("button")
	buttonDetalhesPedido.innerHTML = ` <i class="fas fa-info"></i> `
	buttonDetalhesPedido.className = "btn btn-success btn-xs"

	const buttonDetalhesClientes = document.createElement("button")
	buttonDetalhesClientes.innerHTML = `<i class="fas fa-info"></i> `
	buttonDetalhesClientes.className = "btn btn-success btn-xs"

	const buttonImprimir = document.createElement("button")
	buttonImprimir.innerHTML = `<i class="fas fa-print"></i> `
	buttonImprimir.className = "btn btn-success btn-xs"

	const buttonFinalizar = document.createElement("button")
	buttonFinalizar.innerHTML = `<center><i class="fas fa-check"></i></center> `
	buttonFinalizar.className = "btn btn-success btn-xs"

	buttonDetalhesPedido.onclick = function () {
		clickDetalhePedido(dados)
		return false
	}

	buttonDetalhesClientes.onclick = function () {
		clickDetalheCliente(dados)
		return false
	}

	buttonImprimir.onclick = function () {
		clickImprimir(dados)
		return false
	}

	buttonFinalizar.onclick = function () {
		clickFinalizarPedido(dados)
		return false
	}

	colunaPedidoInf.appendChild(buttonDetalhesPedido)
	colunaClienteInf.appendChild(buttonDetalhesClientes)
	colunaImprimir.appendChild(buttonImprimir)
	colunaFinalizar.appendChild(buttonFinalizar)

}


// ===============================  BOTÃO DETALHES PEDIDO =======================================
function clickDetalhePedido(dados) {
	$("#modalPedido").modal()

	const id = document.getElementById("pedidoID")
	const pedido_dados = document.getElementById("pedidoDados")
	const pedido_pagamento = document.getElementById("pedidoPagamento")
	const pedido_data = document.getElementById("pedidoData")

	id.innerHTML = dados.pedido_id
	pedido_dados.innerHTML = dados.pedido_dados
	pedido_pagamento.innerHTML = dados.pedido_forma_pagamento
	pedido_data.innerHTML = dados.pedido_data

}

// ===============================  BOTÃO DETALHES PEDIDO =======================================
function clickDetalheCliente(dados) {
	$("#modalCliente").modal()

	const cliente_nome = document.getElementById("clienteNome")
	const cliente_endereco = document.getElementById("clienteEndereco")
	const cliente_contato = document.getElementById("clienteContato")

	cliente_nome.innerHTML = dados.cliente_nome
	cliente_endereco.innerHTML = dados.cliente_endereco
	cliente_contato.innerHTML = dados.cliente_contato

	pedidoSelecionadoCliente = dados


}

// Notificação
function validarCamposNotificação() {
	const titulo = document.getElementById("clienteTituloNotificacao").value
	const mensagem = document.getElementById("clienteMensagemNotificacao").value

	if (titulo.trim() == "" || mensagem.trim() == "") {
		abrirModalAlerta("Preencha todos os campos")
	}
	else {
		abrirModalProgress()
		obterDadosNotificacao(titulo, mensagem, pedidoSelecionadoCliente.token_msg)
	}
}

function obterDadosNotificacao(titulo, mensagem, token) {
	firebase.firestore().collection("app").doc("notificacao").get().then(function (documento) {

		const dados = documento.data()
		const key = dados.key

		postMessage(titulo, mensagem, token, key)
	}).catch(function (error) {
		abrirModalAlerta("Erro ao enviar notificação " + error)
	})
}

function post(titulo, mensagem, topico, key) {
	const xmlHttpRequest = new XMLHttpRequest()

	const url = "https://fcm.googleapis.com/fcm/send"

	xmlHttpRequest.open("POST", url, true)
	xmlHttpRequest.setRequestHeader("Content-Type", "application/json")
	xmlHttpRequest.setRequestHeader("Authorization", key)

	xmlHttpRequest.onreadystatechange = function () {
		if (xmlHttpRequest.status == 200) {
			limparCampos()
			abrirModalAlerta("Sucesso ao enviar a notificação")
		}
		else {
			abrirModalAlerta("Erro ao enviar notificação")
		}
	}

	const parametros = {
		"to": topico,
		"data": {
			"titulo": titulo,
			"mensagem": mensagem
		}
	}

	const notificacao = JSON.stringify(parametros)

	xmlHttpRequest.send(notificacao)
}



// ===============================  BOTÃO IMPRIMIR =======================================
function clickImprimir(dados) {

	const doc = new jsPDF("potrait", "mm", [597, 410])

	doc.setFont("helvetica")
	doc.setFontStyle("bold")
	doc.setFontSize(11)

	doc.text("Pedido N°: " + dados.pedido_id, 20, 5)


	doc.setFont("times")
	doc.setFontStyle("normal")
	doc.text("Data e hora do pedido:\n " + dados.pedido_data, 20, 20)

	doc.text("Cliente:\n " + dados.cliente_nome, 20, 40)

	doc.text("Forma de pagamento:\n " + dados.pedido_forma_pagamento, 20, 60)

	doc.text("Valor total:\n " + dados.pedido_valor, 20, 80)

	doc.text("Pedido:\n " + dados.pedido_dados.replace(/<br>/g, "\n"), 20, 100)

	//doc.save("pedido: "+dados.pedido_id+".pdf")
	doc.autoPrint()
	doc.output("dataurlnewwindow")

}



// ===============================  BOTÃO FINALIZAR =======================================
function clickFinalizarPedido(dados) {
	$("#modalFinalizarPedido").modal()
	pedidoSelecionadoFinalizarPedido = dados
}

function finalizarPedido(){
	const dados = {
		pedido_status: "finalizado"
	}

	firebase.firestore().collection("pedidos").doc(pedidoSelecionadoFinalizarPedido.pedido_id).update(dados).then(function(){
		$("#modalFinalizarPedido").modal("hide")

		abrirModalAlerta("Sucesso ao finalizar pedido")
	}).catch(function(error){
		abrirModalAlerta("Erro ao finalizar pedido"+error)
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
	document.getElementById("clienteTituloNotificacao").value = ""
	document.getElementById("clienteMensagemNotificacao").value = ""
}


//==================================================== FUNÇOES TABELA ====================================================
//-----------------------------pesquisa por id e nome
function pesquisar(opcao) {

	let inputValor, filtro, tr, td, i, valorItemTabela;
	inputValor = document.getElementById("pesquisar" + opcao).value;
	filtro = inputValor.toUpperCase()
	tr = tabela.getElementsByTagName("tr")

	for (i = 0; i < tr.length; i++) {
		td = tr[i].getElementsByTagName("td")[opcao]
		
		if (td) {
			valorItemTabela = td.textContent.toUpperCase()
			
			if (valorItemTabela.indexOf(filtro) == -1) {
				tr[i].style.display = "none"
			} else {
				tr[i].style.display = ""
			}
		}
	}
}

//==================================================== PAGINAÇÃO ====================================================
$("#maxRows").on("change", function () {

	let maxRows, tr, i;

	maxRows = parseInt($("#maxRows").val()) - 1
	tr = tabela.getElementsByTagName("tr")

	for (i = 0; i < tr.length; i++) {
		if (i > maxRows) {
			tr[i].style.display = "none"
		} else {
			tr[i].style.display = ""
		}
	}


	//----------paginação inserindo botoes
	$("#pagination").html("")

	let rows = maxRows + 1
	let totalRows = tr.length

	if (totalRows > rows) {
		let numpage = Math.ceil(totalRows / rows)
		for (let i = 1; i <= numpage; i++) {
			$("#pagination").append(' <li class="page-item">   <a class="page-link" href="#" >' + i + '</a></li> ').show()
		}
	}


	//----------paginação  click
	$("#pagination").on("click", function (e) {

		let numpage = parseInt(e.target.innerText)

		i = 1
		$("#tabelaCategoria tr:gt(0)").each(function () {

			if (i > (rows * numpage) || i <= ((rows * numpage) - rows)) {
				$(this).hide()
			} else {
				$(this).show()
			}
			i++;
		})
	})
})