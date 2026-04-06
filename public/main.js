async function carregarProdutos() {
    try {
        const response = await fetch('/api/produtos');
        const corpoTabela = document.getElementById('corpo-tabela');

        if (!response.ok) {
            const dadoErro = await response.json();
            corpoTabela.innerHTML = `<tr><td colspan="6" style="color: red; text-align: center;">${dadoErro.error}</td></tr>`;
            return;
        }

        const produtos = await response.json();
        corpoTabela.innerHTML = "";
        
        produtos.forEach(item => {
            corpoTabela.innerHTML += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.nome}</td>
                    <td>${item.quantidade}</td>
                    <td>${item.marca}</td>
                    <td>${item.fornecedor}</td>
                    <td>
                        <button id="btn-editar" class="btn-editar" onclick="preencherEditar(${JSON.stringify(item).replace(/"/g, '&quot;')})">Editar</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Erro de conexão:", error);
    }
}
function preencherEditar(produto) {
    // 1. Coloca os valores atuais nos inputs do modal
    document.getElementById('edit-id').value = produto.id;
    document.getElementById('edit-nome').value = produto.nome;
    document.getElementById('edit-quantidade').value = produto.quantidade;
    document.getElementById('edit-marca').value = produto.marca;
    document.getElementById('edit-fornecedor').value = produto.fornecedor;

    // 2. Abre o modal de edição
    document.getElementById('modal-edit').style.display = "block";
}
document.addEventListener('DOMContentLoaded', carregarProdutos);
const modal = document.getElementById('modal-produto');
const btnAbrir = document.getElementById('btn-adicionar');
const spanFechar = document.querySelector('.fechar');
const form = document.getElementById('form-produto');

// 1. Abrir modal
btnAbrir.onclick = () => {
    modal.style.display = "block";
};


// Fechar modal (no X ou clicando fora)
spanFechar.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = "none";
}


// Enviar dados para o Node.js
form.onsubmit = async (e) => {
    e.preventDefault(); // Impede a página de recarregar

    const novoProduto = {
        nome: document.getElementById('nome').value,
        quantidade: document.getElementById('quantidade').value,
        marca: document.getElementById('marca').value,
        fornecedor: document.getElementById('fornecedor').value
    };

    try {
        const response = await fetch('/api/produtos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoProduto)
        });

    if (response.ok) {
            modal.style.display = "none"; // Fecha o pop-up
            form.reset();                // Limpa o formulário
            carregarProdutos();          // Atualiza a tabela na hora!
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
    }
};
const modalExcluir = document.getElementById('modal-excluir');
const btnDeleteGeral = document.getElementById('btn-delete');
const btnConfirmarExclusao = document.getElementById('btn-confirmar-exclusao');
const spanFecharExcluir = document.querySelector('.fechar-excluir');



// 1. Abrir o modal de exclusão
btnDeleteGeral.onclick = function() {
    modal.style.display = "none"; // FECHA o de adicionar primeiro
    modalExcluir.style.display = "block";  // ABRE o de deletar
};

// 2. Fechar o modal
spanFecharExcluir.onclick = () => {
    modalExcluir.style.display = "none";
};

// 3. Lógica do botão "Confirmar Exclusão" dentro do pop-up
btnConfirmarExclusao.onclick = async () => {
    const id = document.getElementById('id-excluir').value;

    if (!id) {
        alert("Por favor, insira um ID válido.");
        return;
    }

    try {
        const response = await fetch(`/api/produtos/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert(`Produto ID ${id} excluído com sucesso!`);
            modalExcluir.style.display = "none"; // Fecha o modal
            document.getElementById('id-excluir').value = ""; // Limpa o input
            carregarProdutos(); // Atualiza a tabela
        } else {
            const erro = await response.json();
            alert("Erro: " + (erro.error || "Não foi possível excluir. Verifique o ID."));
        }
    } catch (error) {
        console.error("Erro na conexão:", error);
    }
};

document.getElementById('form-editar').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;

    const dadosAtualizados = {
        nome: document.getElementById('edit-nome').value,
        quantidade: document.getElementById('edit-quantidade').value,
        marca: document.getElementById('edit-marca').value,
        fornecedor: document.getElementById('edit-fornecedor').value
    };

    const response = await fetch(`/api/produtos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosAtualizados)
    });

    if (response.ok) {
        alert("Produto atualizado!");
        document.getElementById('modal-edit').style.display = "none";
        carregarProdutos(); // Recarrega a tabela
    }
};

document.getElementById('form-editar').onsubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    const id = document.getElementById('edit-id').value;
    console.log("Tentando atualizar o ID:", id); // <--- VEJA ISSO NO CONSOLE

    if (!id || id === "undefined") {
        alert("Erro: ID não encontrado!");
        return;
    }
    
    // Monta o objeto com os novos valores
    const produtoAtualizado = {
        nome: document.getElementById('edit-nome').value,
        quantidade: document.getElementById('edit-quantidade').value,
        marca: document.getElementById('edit-marca').value,
        fornecedor: document.getElementById('edit-fornecedor').value
    };

    try {
        const response = await fetch(`/api/produtos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produtoAtualizado)
        });

        if (response.ok) {
            alert("Produto atualizado com sucesso!");
            modalEditar.style.display = "none"; // Fecha o pop-up
            carregarProdutos(); // Atualiza a sua tabela automaticamente
        } else {
            alert("Erro ao atualizar o produto.");
        }
    } catch (error) {
        console.error("Erro na comunicação com o servidor:", error);
    }
};

const modalEditar = document.getElementById('modal-edit');
const spanFecharEditar = document.getElementById('fechar-editar');

// Fecha quando clica no X
spanFecharEditar.onclick = function() {
    modalEditar.style.display = "none";
};

// Fecha se clicar fora da caixa branca
window.onclick = function(event) {
    if (event.target == modalEditar) {
        modalEditar.style.display = "none";
    }
    // Repita essa lógica para os outros modais se necessário
};


