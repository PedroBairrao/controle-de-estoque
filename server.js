const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(express.json());
const port = 3000;

const dbPath = path.resolve(__dirname, 'estoque_db.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco:", err.message);
    } else {
        console.log("Conectado ao SQLite.");
    }
});

app.use(express.static('public'));
app.use(express.json());

// ROTA COM VERIFICAÇÃO DE ERRO
app.get('/api/produtos', (req, res) => {
    // Primeiro, verificamos se a tabela existe e se tem algo
    db.all("SELECT * FROM produtos", [], (err, rows) => {
        if (err) {
            // Caso a tabela nem exista (Erro de SQL)
            console.error("Erro: Tabela 'produtos' não encontrada.");
            return res.status(500).json({ error: "A tabela de produtos não existe no banco de dados." });
        }

        if (rows.length === 0) {
            // Caso a tabela exista, mas esteja vazia
            console.warn("Aviso: O banco de dados está vazio.");
            return res.status(404).json({ error: "Nenhum produto cadastrado no estoque." });
        }

        // Se tudo estiver ok, envia os dados
        res.json(rows);
    });
});

// Rota para RECEBER os dados do formulário
app.post('/api/produtos', (req, res) => {
    // Pega os dados que o main.js enviou no 'body'
    const { nome, quantidade, marca, fornecedor } = req.body;

    const sql = 'INSERT INTO produtos (nome, quantidade, marca, fornecedor) VALUES (?, ?, ?, ?)';
    const params = [nome, quantidade, marca, fornecedor];

    db.run(sql, params, function(err) {
        if (err) {
            console.error("Erro ao inserir no banco:", err.message);
            return res.status(500).json({ error: "Erro ao salvar o produto." });
        }
        
        // Retorna sucesso e o ID do produto que acabou de ser criado
        res.json({ 
            message: "Produto cadastrado com sucesso!",
            id: this.lastID 
        });
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
app.delete('/api/produtos/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM produtos WHERE id = ?', id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        if (this.changes === 0) {
            return res.status(404).json({ error: "ID do produto não encontrado." });
        }
        
        res.json({ message: "Produto excluído com sucesso!" });
    });
});

app.put('/api/produtos/:id', (req, res) => {
    const id = req.params.id;
    const { nome, quantidade, marca, fornecedor } = req.body;

    const sql = `UPDATE produtos SET nome = ?, quantidade = ?, marca = ?, fornecedor = ? WHERE id = ?`;
    const params = [nome, quantidade, marca, fornecedor, id];

    db.run(sql, params, function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Atualizado com sucesso", changes: this.changes });
    });
});