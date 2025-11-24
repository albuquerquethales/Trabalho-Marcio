//Define o endereço do backend que será usado em todas as requisições.
const API_URL = 'http://localhost:3000';

// =================== LOGIN ===================
/**
 login() → envia email e senha para /login.

Se sucesso, salva o token JWT no localStorage e redireciona para o dashboard.
Se falha, mostra alerta com mensagem de erro.

logout() → remove token e retorna para a tela de login.
*/
async function login() {
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    });

    const data = await res.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        window.location.href = 'dashboard.html';
    } else {
        alert(data.message);
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// =================== CRUD USUÁRIOS ===================
/**
 getUsuarios() → lista todos os usuários do banco e mostra na tela.

addUsuario() → adiciona novo usuário enviando dados ao backend com token de autenticação.

deleteUsuario() → deleta usuário pelo ID usando token.
 */
async function getUsuarios() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': token }
    });
    const users = await res.json();
    const container = document.getElementById('usuariosList');
    container.innerHTML = '';

    users.forEach(u => {
        container.innerHTML += `<p>
            ${u.nome} (${u.email}) 
            <button onclick="deleteUsuario(${u.id})">Deletar</button>
        </p>`;
    });
}

async function addUsuario() {
    const token = localStorage.getItem('token');
    const nome = document.getElementById('nomeUser').value;
    const email = document.getElementById('emailUser').value;
    const senha = document.getElementById('senhaUser').value;

    await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ nome, email, senha })
    });
    getUsuarios();
}

async function deleteUsuario(id) {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    getUsuarios();
}
/**
getProdutos() -> Funciona igual ao CRUD de usuários, mas para produtos.

addProduto() -> Preço é convertido para número e exibido formatado.

deleteProduto(id) -> Todas as operações usam token JWT para segurança.
 */
// =================== CRUD PRODUTOS ===================
async function getProdutos() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/produtos`, {
        headers: { 'Authorization': token }
    });
    const prods = await res.json();
    const container = document.getElementById('produtosList');
    container.innerHTML = '';

    prods.forEach(p => {
    const preco = parseFloat(p.preco) || 0; // garante que seja número
    container.innerHTML += `<p>
        ${p.nome} - R$ ${preco.toFixed(2)}
        <button onclick="deleteProduto(${p.id})">Deletar</button>
    </p>`;
});

}

async function addProduto() {
    const token = localStorage.getItem('token');
    const nome = document.getElementById('nomeProd').value;
    const descricao = document.getElementById('descProd').value;
    const preco = parseFloat(document.getElementById('precoProd').value);

    await fetch(`${API_URL}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token },
        body: JSON.stringify({ nome, descricao, preco })
    });
    getProdutos();
}

async function deleteProduto(id) {
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/produtos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': token }
    });
    getProdutos();
}

// =================== INICIALIZAÇÃO ===================
/*
Quando a página é carregada, verifica se o usuário está logado (tem token).

Se não estiver, redireciona para login.

Se estiver, carrega usuários e produtos.
*/
if (window.location.pathname.includes('dashboard.html')) {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';
    getUsuarios();
    getProdutos();
}
// =================== REGISTRO ===================
/**
register() ->

Recebe nome, email e senha da tela de registro.

Envia para o backend via POST /register.

Se sucesso, mostra alerta e redireciona para login.
 */
async function register() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!nome || !email || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    });

    const data = await res.json();
    if (res.status === 200) {
        alert(data.message);
        window.location.href = 'index.html'; // redireciona para login
    } else {
        alert("Erro: " + JSON.stringify(data));
    }   
}
document.addEventListener('DOMContentLoaded', () => {
    const tour = new Shepherd.Tour({
        useModalOverlay: true,
        defaultStepOptions: {
            classes: 'shadow-lg bg-purple-dark',
            scrollTo: true
        }
    });

    // Função para criar o boneco apontando
    function createMascote(text) {
        return `
            <div style="display:flex; align-items:center;">
                <img src="boneco.gif" style="width:60px; margin-right:10px; animation: bounce 1s infinite;" alt="Mascote">
                <span>${text}</span>
            </div>
        `;
    }

    // Adicionando animação CSS
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
    `;
    document.head.appendChild(style);

    // Passo 1
    tour.addStep({
        title: 'Menu Usuários',
        text: createMascote('Clique aqui para visualizar ou gerenciar os usuários.'),
        attachTo: { element: '.nav-link.active', on: 'right' },
        buttons: [{ text: 'Próximo', action: tour.next }]
    });

    // Passo 2
    tour.addStep({
        title: 'Adicionar Usuário',
        text: createMascote('Preencha o nome, email e senha para adicionar um novo usuário.'),
        attachTo: { element: '#nomeUser', on: 'bottom' },
        buttons: [
            { text: 'Anterior', action: tour.back },
            { text: 'Próximo', action: tour.next }
        ]
    });

    // Passo 3 (clicável)
    const produtosLink = Array.from(document.querySelectorAll('.nav-link'))
        .find(link => link.textContent.trim() === 'Produtos');

    tour.addStep({
        title: 'Menu Produtos',
        text: createMascote('Clique aqui para gerenciar produtos.'),
        attachTo: { element: produtosLink, on: 'right' },
        buttons: [{ text: 'Anterior', action: tour.back }],
        canClickTarget: true,
        when: {
            show: () => {
                produtosLink.addEventListener('click', function handler(e) {
                    e.preventDefault();
                    showSection('produtosSection');
                    tour.next();
                    produtosLink.removeEventListener('click', handler);
                });
            }
        }
    });

    // Passo 4
    tour.addStep({
        title: 'Adicionar Produto',
        text: createMascote('Preencha nome, descrição e preço para adicionar um produto.'),
        attachTo: { element: '#nomeProd', on: 'bottom' },
        buttons: [
            { text: 'Anterior', action: tour.back },
            { text: 'Finalizar', action: tour.complete }
        ]
    });

    tour.start();
});



