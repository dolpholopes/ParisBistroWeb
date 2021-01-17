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


let imagemSelecionada;
let categoriaSelecionadaAlterar;
let categoriaSelecionadaRemover;

let tabela = document.getElementById("tabelaCategoria").getElementsByTagName("tbody")[0]

let bd = firebase.firestore().collection("categorias");
let storage = firebase.storage().ref().child("categorias");

let keyLista = []


//==================================================== OUVINTE ====================================================

bd.onSnapshot(function (documentos) { 
	documentos.docChanges().forEach(function (changes) {

		if (changes.type === "added") {
			const doc = changes.doc
			const dados = doc.data()
			keyLista.push(dados.id)
			criarItensTabela(dados)
		}
		else if (changes.type === "modified") {
			const doc = changes.doc
			const dados = doc.data()
			alterarItensTabela(dados)
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

	const colunaId = linha.insertCell(0)
	const colunaNome = linha.insertCell(1)
	const colunaAcoes = linha.insertCell(2)

	const itemId = document.createTextNode(dados.id)
	const itemNome = document.createTextNode(dados.nome) 

	colunaId.appendChild(itemId)
	colunaNome.appendChild(itemNome)
	
	criarBotoesTabela(colunaAcoes,dados)

	ordemCrescente()
}

//---- alterando itens tabela
function alterarItensTabela(dados) {

	const index = keyLista.indexOf(dados.id)
	const row = tabela.rows[index]
	const cellId = row.cells[0]
	const cellNome = row.cells[1]
	const acoes = row.cells[2]

	acoes.remove()

	const colunaAcoes = row.insertCell(2)

	cellId.innerText = dados.id
	cellNome.innerText = dados.nome

	criarBotoesTabela(colunaAcoes,dados)

}


//---- removendo itens tabela
function removerItensTabela(dados) {

	const index = keyLista.indexOf(dados.id)

	tabela.rows[index].remove()
	keyLista.splice(index,1)

}

//---- criar botoes tabela
function criarBotoesTabela(colunaAcoes,dados){

	const buttonAlterar = document.createElement("button")
	buttonAlterar.innerHTML = ` <i class="fas fa-edit"></i> `
	buttonAlterar.className = "btn btn-success btn-xs"

	const buttonRemover = document.createElement("button")
	buttonRemover.innerHTML = `<i class="fas fa-trash-alt"></i> `
	buttonRemover.className = "btn btn-danger btn-xs"

	buttonAlterar.onclick = function () {
		abrirModalAlterar(dados) 
 		return false
	}


	buttonRemover.onclick = function () {
		abrirModalRemover(dados)
		return false
	}


	colunaAcoes.appendChild(buttonAlterar)
	colunaAcoes.appendChild(document.createTextNode(" "))
	colunaAcoes.appendChild(buttonRemover)

}


//==================================================== TRATAMENTO COM IMAGENS ====================================================

//------------------modal adicionar - click em imagem
function clickAdicionarImagem() {
	$("#imagemUploadAdicionar").click()
}

$("#imagemUploadAdicionar").on("change", function (event) {
	const imagem = document.getElementById("imagemAdicionar")
	compactarImagem(event,imagem)
})


//------------------modal alterar - click em imagem
function clickAlterarImagem() {
	$("#imagemUploadAlterar").click()
}

$("#imagemUploadAlterar").on("change", function (event) {
	const imagem = document.getElementById("imagemAlterar")
	compactarImagem(event,imagem)
})


//------------------funcoes para tratar imagem 
function compactarImagem(event, imagem){

	const compress = new Compress()
	const files = [...event.target.files]

	compress.compress(files, {
		size: 4, // the max size in MB, defaults to 2MB
		quality: 0.55, // the quality of the image, max is 1,
		maxWidth: 1920, // the max width of the output image, defaults to 1920px
		maxHeight: 1920, // the max height of the output image, defaults to 1920px
		resize: true // defaults to true, set false if you do not want to resize the image width and height
	}).then((data) => {

		if (data[0] != null) {

			const image = data[0]
			const file = Compress.convertBase64ToFile(image.data, image.ext)
			imagemSelecionada = file
			inserirImagem(imagem, file)
		}
	})
}


function inserirImagem(imagem, file) {

	imagem.file = file

	if (imagemSelecionada != null) {

		const reader = new FileReader()
		reader.onload = (function (img) {
			return function (e) {
				img.src = e.target.result
			}
		})(imagem)

		reader.readAsDataURL(file)
	}
}


//==================================================== MODAL ADICIONAR ====================================================

//------------abrir modal
function abrirModalAdicionar() {
	$("#modalAdicionar").modal()
}

//------------limpar campos - usando pelo botao cancelar e pelo botao salvar
function limparCamposAdicionar() {
	document.getElementById("adicionarID").value = ""
	document.getElementById("adicionarNome").value = ""
	document.getElementById("imagemAdicionar").src = "#"
	
	$("#imagemUploadAdicionar").val("")
	imagemSelecionada = null
}


//------------ botao de salvar da modal
function buttonAdicionarValidarCampos() {
	const id = document.getElementById("adicionarID").value
	const nome = document.getElementById("adicionarNome").value

	if (keyLista.indexOf(id) > -1) {
		abrirModalAlerta("ID já está Cadastrado no Sistema")
	}

	else if (nome.trim() == "" || id.trim() == "") {
		abrirModalAlerta("Preencha todos os Campos")
	}
	else if (imagemSelecionada == null) {
		abrirModalAlerta("Insira uma imagem")
	}
	else {
		abrirModalProgress()
		salvarImagemFirebase(id, nome)
	}
}


//------------ salvar imagem Firebase
function salvarImagemFirebase(id, nome) {
	const nomeImagem = id
	const upload = storage.child(nomeImagem).put(imagemSelecionada)

	upload.on("state_changed", function (snapshot) {

	}, function (error) {

		abrirModalAlerta("Erro ao Salvar Imagem")
		removerModalProgress()

	}, function () {

		upload.snapshot.ref.getDownloadURL().then(function (url_imagem) {

			salvarDadosFirebase(id, nome, url_imagem)

		})
	})
}


//------------ salvar dados Firebase
function salvarDadosFirebase(id, nome, url_imagem) {

	const dados = {
		id: id,
		nome: nome,
		url_imagem: url_imagem
	}

	bd.doc(id).set(dados).then(function () {
		removerModalProgress()
		limparCamposAdicionar()
		abrirModalAlerta("Sucesso ao Salvar Dados")

	}).catch(function (error) {
		removerModalProgress()
		abrirModalAlerta("Erro ao Salvar Dados: " + error)
	})

}


//==================================================== MODAL ALTERAR ====================================================
//------------limpar campos - usando pelo botao cancelar
function limparCamposAlterar() {
	$("#imagemUploadAlterar").val("")
	imagemSelecionada = null
}


//------------abrir modal
function abrirModalAlterar(dados) {
	$("#modalAlterar").modal()

	const id = document.getElementById("alterarID")
	const nome = document.getElementById("alterarNome")
	const imagem = document.getElementById("imagemAlterar")

	id.innerText = dados.id
	nome.value = dados.nome
	imagem.src = dados.url_imagem

	categoriaSelecionadaAlterar = dados
}


function buttonAlterarValidarCampos() {

	const id = document.getElementById("alterarID").innerHTML
	const nome = document.getElementById("alterarNome").value
	
	if (categoriaSelecionadaAlterar.nome.trim() == nome.trim()  && imagemSelecionada == null ){
		abrirModalAlerta("Nenhuma informação foi alterada")
	}

	else if (nome.trim() == ""){
		abrirModalAlerta("Preencha os campos obrigatórios")
	}

	else if (imagemSelecionada != null){ // vamos executar se o usuario alterar a imagem (nome)
		abrirModalProgress()
		alterarImagemFirebase(id,nome)
	}
	else{ // vamos executar esse else somente se o usuario alterar somente o nome
		abrirModalProgress()
		alterarDadosFirebase(id,nome,categoriaSelecionadaAlterar.url_imagem)
	}
}

//------------ alterar imagem Firebase
function alterarImagemFirebase(id, nome) {
	const nomeImagem = id
	const upload = storage.child(nomeImagem).put(imagemSelecionada)

	upload.on("state_changed", function (snapshot) {

	}, function (error) {
		abrirModalAlerta("Erro ao Alterar Imagem")
		removerModalProgress()

	}, function () {

		upload.snapshot.ref.getDownloadURL().then(function (url_imagem) {
			alterarDadosFirebase(id, nome, url_imagem)
		})
	})
}


//------------ alterar dados Firebase
function alterarDadosFirebase(id, nome, url_imagem) {

	const dados = {
		id: id,
		nome: nome,
		url_imagem: url_imagem
	}


	bd.doc(id).update(dados).then(function () {

		$("#modalAlterar").modal("hide")
		removerModalProgress()
		limparCamposAlterar()
		abrirModalAlerta("Sucesso ao Alterar Dados")

	}).catch(function (error) {
		removerModalProgress()
		abrirModalAlerta("Erro ao Alterar Dados: " + error)
	})

}


//==================================================== MODAL REMOVER ====================================================

//------------abri modal
function abrirModalRemover(dados) {
	$("#modalRemover").modal()
	categoriaSelecionadaRemover = dados
}


//------------ click em botao de SIM na modal de remover
function removerCategoria() {
	abrirModalProgress()
	removerImagemFirebase()
}


//------------ remover imagem Firebase
function removerImagemFirebase(){

	const nomeImagem = categoriaSelecionadaRemover.id
	const imagem = storage.child(nomeImagem)

	imagem.delete().then(function(){
		removerDadosFirebase()

	}).catch( function(error){
		removerModalProgress()
		abrirModalAlerta("Erro ao Remover Imagem: " + error)
	})
	
}


//------------ remover dados Firebase
function removerDadosFirebase(){
	const id = categoriaSelecionadaRemover.id

	bd.doc(id).delete().then(function () {
		$("#modalRemover").modal("hide")
		removerModalProgress()
		abrirModalAlerta("Sucesso ao Remover Dados")

	}).catch(function (error) {
		removerModalProgress()
		abrirModalAlerta("Erro ao Remover Dados: " + error)

	})
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


//==================================================== ORDENAÇÃO ====================================================

let ordem = true;

function ordenarId() {

	if (ordem) {
		ordemDecrescente()
		ordem = false
	} else {
		ordemCrescente()
		ordem = true
	}
}

//---------------------ordem Decrescente
function ordemDecrescente() {

	let tr = tabela.getElementsByTagName('tr')

	for (let i = 0; i < tr.length - 1; i++) {
		for (let j = 0; j < tr.length - (i + 1); j++) {

			let informacao1 = tr[j].getElementsByTagName("td")[0].textContent // 200
			let informacao2 = tr[j + 1].getElementsByTagName("td")[0].textContent // 152

			if (Number(informacao1) < Number(informacao2)) {
			//	if (informacao1) < informacao2 ) {
				tabela.insertBefore(tr.item(j + 1), tr.item(j))

				let valor = keyLista[j+1]
				keyLista[j + 1] = keyLista[j]
				keyLista[j] = valor

			}
		}
	}
}



//---------------------ordem Crescente
function ordemCrescente() {

	let tr = tabela.getElementsByTagName('tr')

	for (let i = 0; i < tr.length - 1; i++) {
		for (let j = 0; j < tr.length - (i + 1); j++) {

			let informacao1 = tr[j].getElementsByTagName("td")[0].textContent // 200
			let informacao2 = tr[j + 1].getElementsByTagName("td")[0].textContent // 152

			if (Number(informacao1) > Number(informacao2)) {
				//	if (informacao1) < informacao2 ) {
				tabela.insertBefore(tr.item(j + 1), tr.item(j))

				let valor = keyLista[j+1]
				keyLista[j + 1] = keyLista[j]
				keyLista[j] = valor
			}
		}
	}
}