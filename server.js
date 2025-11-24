const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const secret = '123456789'; // chave JWT

// Conexão com MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456789', // sua senha
    database: 'sistema_simples'
});

db.connect(err => {
    if (err) throw err;
    console.log('Conectado ao MySQL');
});

// =================== AUTENTICAÇÃO ===================

// Login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    db.query('SELECT * FROM usuarios WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(400).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'Usuário não encontrado' });

        const user = results[0];

        // Remove o "TAO" do começo do hash
        const hashOriginal = user.senha.replace(/^TAO/, '');

        // Compara a senha enviada com o hash original
        const check = await bcrypt.compare(senha, hashOriginal);
        if (!check) return res.status(401).json({ message: 'Senha incorreta' });

        const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Middleware de autenticação
const auth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Token necessário' });

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Token inválido' });
        req.user = decoded;
        next();
    });
};

// =================== CRUD PRODUTOS ===================

// Listar produtos
app.get('/produtos', auth, (req, res) => {
    db.query('SELECT * FROM produtos', (err, results) => {
        if (err) return res.status(400).json(err);
        res.json(results);
    });
});

// Adicionar produto
app.post('/produtos', auth, (req, res) => {
    const { nome, descricao, preco } = req.body;
    db.query('INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)', [nome, descricao, preco], (err, result) => {
        if (err) return res.status(400).json(err);
        res.json({ message: 'Produto adicionado!' });
    });
});

// Atualizar produto
app.put('/produtos/:id', auth, (req, res) => {
    const { id } = req.params;
    const { nome, descricao, preco } = req.body;
    db.query('UPDATE produtos SET nome=?, descricao=?, preco=? WHERE id=?', [nome, descricao, preco, id], (err, result) => {
        if (err) return res.status(400).json(err);
        res.json({ message: 'Produto atualizado!' });
    });
});

// Deletar produto
app.delete('/produtos/:id', auth, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM produtos WHERE id=?', [id], (err, result) => {
        if (err) return res.status(400).json(err);
        res.json({ message: 'Produto deletado!' });
    });
});

// =================== CRUD USUÁRIOS ===================

// Registro
app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;
    const hash = await bcrypt.hash(senha, 8);
    const hashFinal = "TAO" + hash;

    db.query('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hashFinal], (err, result) => {
    if (err) return res.status(400).json(err);
    res.json({ message: 'Usuário registrado com sucesso!' });
});

});

// Listar usuários
app.get('/usuarios', auth, (req, res) => {
    db.query('SELECT id, nome, email FROM usuarios', (err, results) => {
        if (err) return res.status(400).json(err);
        res.json(results);
    });
});

// Atualizar usuário
app.put('/usuarios/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { nome, email, senha } = req.body;
    const hash = await bcrypt.hash(senha, 8);
    const hashFinal = "TAO" + hash;

    db.query('UPDATE usuarios SET nome=?, email=?, senha=? WHERE id=?', [nome, email, hashFinal, id], (err, result) => {
        if (err) return res.status(400).json(err);
        res.json({ message: 'Usuário atualizado!' });
    });
});

// Deletar usuário
app.delete('/usuarios/:id', auth, (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM usuarios WHERE id=?', [id], (err, result) => {
        if (err) return res.status(400).json(err);
        res.json({ message: 'Usuário deletado!' });
    });
});


// =================== INICIAR SERVIDOR ===================
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});



