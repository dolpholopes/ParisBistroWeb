

let imagemSelecionada1;
let imagemSelecionada2;
let informativoRecuperadoBD;

let bd = firebase.firestore().collection("app").doc("homeapp")
let storage = firebase.storage().ref().child("app").child("homeapp")


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

//==================================================== TRATAMENTO COM IMAGENS ====================================================

//------------------ click imagem 1
function clickAdicionarImagem1() {
	$("#imagem1Upload").click()
}

$("#imagem1Upload").on("change", function (event) {
	const imagem = document.getElementById("imagem1")
	compactarImagem(event,imagem,1)
})

//------------------ click imagem 2
function clickAdicionarImagem2() {
	$("#imagem2Upload").click()
}

$("#imagem2Upload").on("change", function (event) {
	const imagem = document.getElementById("imagem2")
	compactarImagem(event,imagem,2)
})


//------------------funcoes para tratar imagem 
function compactarImagem(event, imagem, opcao){

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
            
            if(opcao == 1){
                imagemSelecionada1 = file
            }
            else{
                imagemSelecionada2 = file
            }

            imagemSelecionada1 = file
            imagemSelecionada2 = file
			inserirImagem(imagem, file)
		}
	})
}


function inserirImagem(imagem, file) {

	imagem.file = file

	if (file != null) {

		const reader = new FileReader()
		reader.onload = (function (img) {
			return function (e) {
				img.src = e.target.result
			}
		})(imagem)

		reader.readAsDataURL(file)
	}
}


//==================================================== IMAGEM 1 ====================================================
function limparCamposImagem1() {
	$("#imagem1Upload").val("")
	imagemSelecionada1 = null
}

function validarImagem1(){
    if(imagemSelecionada1 == null){

    }
    else{
        const nome = "imagem1"
        salvarImagem1Firebase(nome)
    }
}

function salvarImagem1Firebase(nome) {
	const nomeImagem = nome
	const upload = storage.child(nomeImagem).put(imagemSelecionada1)

	upload.on("state_changed", function (snapshot) {

	}, function (error) {

		abrirModalAlerta("Erro ao Salvar Imagem")
		removerModalProgress()

	}, function () {
		upload.snapshot.ref.getDownloadURL().then(function (url_imagem) {
			salvarDadosImagem1Firebase(url_imagem)
            limparCamposImagem1()
		})
	})
}

//------------ salvar dados Firebase
function salvarDadosImagem1Firebase(url_imagem) {

	const dados = {
		url_imagem: url_imagem
	}

	bd.update(dados).then(function () {
		removerModalProgress()
		limparCamposImagem1()
		abrirModalAlerta("Sucesso ao Salvar Dados")

	}).catch(function (error) {
		removerModalProgress()
		abrirModalAlerta("Erro ao Salvar Dados: " + error)
	})

}


//==================================================== IMAGEM 2 ====================================================
function limparCamposImagem2() {
	$("#imagem2Upload").val("")
	imagemSelecionada2 = null
}


function validarImagem2(){
    if(imagemSelecionada2 == null){

    }
    else{
        const nome = "imagem2"
        salvarImagem2Firebase(nome)
    }
}

function salvarImagem2Firebase(nome) {
	const nomeImagem = nome
	const upload = storage.child(nomeImagem).put(imagemSelecionada2)

	upload.on("state_changed", function (snapshot) {

	}, function (error) {

        abrirModalAlerta("Erro ao Salvar Imagem")
        limparCamposImagem2()
		removerModalProgress()

	}, function () {

		upload.snapshot.ref.getDownloadURL().then(function (url_imagem) {

			salvarDadosImagem2Firebase(url_imagem)
            limparCamposImagem1()
		})
	})
}

//------------ salvar dados Firebase
function salvarDadosImagem2Firebase(url_imagem) {

	const dados = {
		url_imagem: url_imagem
	}

	bd.update(dados).then(function () {
		removerModalProgress()
		limparCamposImagem2()
		abrirModalAlerta("Sucesso ao Salvar Dados")

	}).catch(function (error) {
		removerModalProgress()
		abrirModalAlerta("Erro ao Salvar Dados: " + error)
	})

}



//==================================================== ALTERANDO INFORMATIVO ====================================================
function validarCampoInformativo(){
	
	const informativo = document.getElementById("informativo").value

	if(informativo.trim() == ""){
		abrirModalAlerta("Preencha o campo informativo!")
	}
	else if(informativoRecuperadoBD == informativo){
		abrirModalAlerta("Mensagem não foi alterada!")
	}
	else{
		abrirModalProgress()
		salvarDadosInformativo(informativo)
	}
}

function salvarDadosInformativo(informativo) {
	const dados = {
		informativo: informativo
	}
	bd.update(dados).then(function () {
		removerModalProgress()

	}).catch(function (error) {
		removerModalProgress()
		abrirModalAlerta("Erro ao Salvar Dados: " + error)
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
