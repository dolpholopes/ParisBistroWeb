
let adicionalSelecionadaAlterar;
let adicionalSelecionadaRemover;

let tabela = document.getElementById("tabelaAdicional").getElementsByTagName("tbody")[0]

let bd = firebase.firestore().collection("adicionais");

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
	const colunaValor = linha.insertCell(2)

	const colunaAcoes = linha.insertCell(3)

	const itemId = document.createTextNode(dados.id)
	const itemNome = document.createTextNode(dados.nome) 
	const itemValor = document.createTextNode(dados.valor) 

	colunaId.appendChild(itemId)
	colunaNome.appendChild(itemNome)
	colunaValor.appendChild(itemValor)
	
	criarBotoesTabela(colunaAcoes,dados)
	ordemCrescente()
}

//---- alterando itens tabela
function alterarItensTabela(dados) {

	const index = keyLista.indexOf(dados.id)

	const row = tabela.rows[index]
	const cellId = row.cells[0]
	const cellNome = row.cells[1]
	const cellValor = row.cells[2]

	const acoes = row.cells[3]

	acoes.remove()

	const colunaAcoes = row.insertCell(3)

	cellId.innerText = dados.id
	cellNome.innerText = dados.nome
	cellValor.innerText = dados.valor

	criarBotoesTabela(colunaAcoes,dados)
}

//---- removendo itens tabela
function removerItensTabela(dados) {
	const index = keyLista.indexOf(dados.id)
	tabela.rows[index].remove()
	keyLista.splice(index,1)
}

//--- criar botoes tabela
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


//==================================================== MODAL ADICIONAR ====================================================
//------------abri modal
function abrirModalAdicionar() {
	$("#modalAdicionar").modal()
}

//------------limpar campos - usando pelo botao cancelar e pelo botao salvar
function limparCamposAdicionar() {
	document.getElementById("adicionarID").value = ""
	document.getElementById("adicionarNome").value = ""
	document.getElementById("adicionarValor").value = ""
}

//------------ botao de salvar da modal
function buttonAdicionarValidarCampos() {
	const id = document.getElementById("adicionarID").value
	const nome = document.getElementById("adicionarNome").value
	const valor = document.getElementById("adicionarValor").value

	if (keyLista.indexOf(id) > -1) {
		abrirModalAlerta("ID já está Cadastrado no Sistema")
	}
	else if (nome.trim() == "" || id.trim() == "" || valor.trim() == "") {
		abrirModalAlerta("Preencha todos os Campos")
	}
	else {
		abrirModalProgress()
		salvarDadosFirebase(id, nome,valor)
	}
}

//------------ salvar dados Firebase
function salvarDadosFirebase(id, nome,valor) {

	const dados = {
		id: id,
		nome: nome,
		valor: valor
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

//==================================================== MODAL ABRIR ====================================================
//------------abri modal
function abrirModalAlterar(dados) {
	$("#modalAlterar").modal()

	const id = document.getElementById("alterarID")
	const nome = document.getElementById("alterarNome")
	const valor = document.getElementById("alterarValor")

	id.innerText = dados.id
	nome.value = dados.nome
	valor.value = dados.valor

	adicionalSelecionadaAlterar = dados
}

function buttonAlterarValidarCampos() {

	const id = document.getElementById("alterarID").innerHTML
	const nome = document.getElementById("alterarNome").value
	const valor = document.getElementById("alterarValor").value
	
	if (adicionalSelecionadaAlterar.nome.trim() == nome.trim() && 
	adicionalSelecionadaAlterar.valor.trim() == valor.trim()  ){
		abrirModalAlerta("Nenhuma informação foi alterada")
	}
	else if (nome.trim() == "" || valor.trim() == "" ){
		abrirModalAlerta("Preencha os campos obrigatórios")
	}
	else{ // vamos executar esse else somente se o usuario alterar somente o nome
		abrirModalProgress()
		alterarDadosFirebase(id,nome,valor)
	}
}

//------------ alterar dados Firebase
function alterarDadosFirebase(id, nome,valor) {

	const dados = {
		id: id,
		nome: nome,
		valor: valor
	}

	bd.doc(id).update(dados).then(function () {
		$("#modalAlterar").modal("hide")
		abrirModalAlerta("Sucesso ao Alterar Dados")
		removerModalProgress()

	}).catch(function (error) {
		removerModalProgress()
		abrirModalAlerta("Erro ao Alterar Dados: " + error)
	})

}


//==================================================== MODAL REMOVER ====================================================
//------------abri modal
function abrirModalRemover(dados) {
	$("#modalRemover").modal()
	adicionalSelecionadaRemover = dados
}

//------------ click em botao de SIM na modal de remover
function removerAdicional() {
	abrirModalProgress()
	removerDadosFirebase()
}


//------------ remover dados Firebase
function removerDadosFirebase(){

	const id = adicionalSelecionadaRemover.id

	bd.doc(id).delete().then(function () {
		$("#modalRemover").modal("hide")
		removerModalProgress()
		abrirModalAlerta("Sucesso ao Remover Dados")

	}).catch(function (error) {
		removerModalProgress()
		abrirModalAlerta("Erro ao Remover Dados: " + error)
	})
}


//==================================================== MODAL PROGRESS ====================================================
function abrirModalProgress() {
	$("#modalProgress").modal("show")
}

function removerModalProgress() {
	$("#modalProgress").modal('hide')
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
			} 
			else {
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
		} 
		else {
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
		$("#tabelaAdicional tr:gt(0)").each(function () {

			if (i > (rows * numpage) || i <= ((rows * numpage) - rows)) {
				$(this).hide()
			}
			else {
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
	} 
	else {
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