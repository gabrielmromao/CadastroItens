import express from 'express';
//commonjs const express = require('express')

//Importando session do módulo express-session;
import session from 'express-session';

//Importando o módulo cookie-parser para permitir que a nossa aplicação
//solicite e retorne cookies
import cookieParser from 'cookie-parser';


const app = express();

//Configurar uma sessão a fim de permitir que a nossa aplicação
//seja capaz de lembrar com quem ela está falando....
//Em outras palavras, session, permite identificar individualmente cada
//usuário da aplicação.
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'M1nh4Chav3S3cr3t4',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, //utilizada com http e não somente com https
        httpOnly: true,
        maxAge: 1000 * 60 * 30 //30 minutos
    }
}));

//adicionando o middleware cookieParser
app.use(cookieParser());

//configurar a nossa aplicação para receber os dados do formulário
//você pode escolher entre duas bibliotecas: QS ou QueryString
app.use(express.urlencoded({ extended: true }));


//configurar a aplicação para servir conteúdos estáticos
//Permitindo que o conteúdo de uma determinada pasta seja visível para os usuários/clientes
app.use(express.static('./paginas/publicas'));

const porta = 3000;
const host = '0.0.0.0'; //ip refere-se a todas as interfaces (placas de rede) locais

var listaItens = []; //variável global - lista para armazenar os itens cadastrados

//implementar a funcionalidade para entregar um formulário html para o cliente
function cadastroItemView(req, resp) {
    resp.send(`
        <html>
            <head>
                <title>Cadastro de itens</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body>
                <div class="container text-center">
                    <h1 class="mb-5">Cadastro de itens no estoque</h1>
                    <form method="POST" action="/cadastrarItem" class="border p-3 row g-3" novalidate>
                        <div class="col-md-4">
                            <label for="codigoBarras" class="form-label">Código de Barras</label>
                            <input type="text" class="form-control" id="codigoBarras" name="codigoBarras" required>
                        </div>
                        <div class="col-md-8">
                            <label for="descricaoProduto" class="form-label">Descrição do Produto</label>
                            <input type="text" class="form-control" id="descricaoProduto" name="descricaoProduto" required>
                        </div>
                        <div class="col-md-4">
                            <label for="precoCusto" class="form-label">Preço de Custo</label>
                            <input type="number" class="form-control" id="precoCusto" name="precoCusto" step="0.01" required>
                        </div>
                        <div class="col-md-4">
                            <label for="precoVenda" class="form-label">Preço de Venda</label>
                            <input type="number" class="form-control" id="precoVenda" name="precoVenda" step="0.01" required>
                        </div>
                        <div class="col-md-4">
                            <label for="dataValidade" class="form-label">Data de Validade</label>
                            <input type="date" class="form-control" id="dataValidade" name="dataValidade">
                        </div>
                        <div class="col-md-4">
                            <label for="quantidadeEstoque" class="form-label">Quantidade em Estoque</label>
                            <input type="number" class="form-control" id="quantidadeEstoque" name="quantidadeEstoque" required>
                        </div>
                        <div class="col-md-8">
                            <label for="nomeFabricante" class="form-label">Nome do Fabricante</label>
                            <input type="text" class="form-control" id="nomeFabricante" name="nomeFabricante" required>
                        </div>
                        <div class="col-12">
                            <button class="btn btn-primary" type="submit">Cadastrar</button>
                        </div>
                    </form>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        </html>
    `);
}

function menuView(req, resp) {
    const dataHoraUltimoLogin = req.cookies['dataHoraUltimoLogin'];
    if (!dataHoraUltimoLogin){
        dataHoraUltimoLogin='';
    }

    resp.send(`
        <html>
            <head>
                <title>Cadastro de itens</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
            </head>
            <body>
                <nav class="navbar navbar-expand-lg bg-body-tertiary">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="#">MENU</a>
                        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                            <div class="navbar-nav">
                                <a class="nav-link active" aria-current="page" href="/cadastrarItem">Cadastrar Item</a>
                                <a class="nav-link active" aria-current="page" href="/logout">Sair</a>
                                <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Seu último acesso foi realizado em ${dataHoraUltimoLogin}</a>
                            </div>
                        </div>
                    </div>
                </nav>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>
        </html>
        `);
}

function cadastrarItem(req, resp) {
    const { codigoBarras, descricaoProduto, precoCusto, precoVenda, dataValidade, quantidadeEstoque, nomeFabricante } = req.body;

    if (codigoBarras && descricaoProduto && precoCusto && precoVenda && quantidadeEstoque && nomeFabricante) {
        const item = { codigoBarras, descricaoProduto, precoCusto, precoVenda, dataValidade, quantidadeEstoque, nomeFabricante };

        listaItens.push(item);

        resp.write(`
            <html>
                <head>
                    <title>Itens Cadastrados</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                </head>
                <body>
                    <div class="container text-center">
                        <h1>Itens no Estoque</h1>
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Código de Barras</th>
                                    <th>Descrição</th>
                                    <th>Preço de Custo</th>
                                    <th>Preço de Venda</th>
                                    <th>Data de Validade</th>
                                    <th>Quantidade</th>
                                    <th>Fabricante</th>
                                </tr>
                            </thead>
                            <tbody>
        `);

        listaItens.forEach(item => {
            resp.write(`
                <tr>
                    <td>${item.codigoBarras}</td>
                    <td>${item.descricaoProduto}</td>
                    <td>${item.precoCusto}</td>
                    <td>${item.precoVenda}</td>
                    <td>${item.dataValidade || ''}</td>
                    <td>${item.quantidadeEstoque}</td>
                    <td>${item.nomeFabricante}</td>
                </tr>
            `);
        });

        resp.write(`
                            </tbody>
                        </table>
                        <a class="btn btn-primary" href="/cadastrarItem">Cadastrar Novo Item</a>
                    </div>
                    <div> <p><span>Seu último acesso foi realizado em ${dataHoraUltimoLogin}</span></p> </div>
                </body>
            </html>
        `);
    } else {
        resp.status(400).send("Todos os campos obrigatórios devem ser preenchidos!");
    }

    resp.end();
}

function autenticarUsuario(req, resp){
    const usuario = req.body.usuario;
    const senha   = req.body.senha;

    if (usuario === 'admin' && senha === '123'){
        //criar uma sessão individualmente para cada usuário que faça o login
        req.session.usuarioLogado = true;
        //criar um cookie enviando para o navegador data e hora de acesso do usuário
        resp.cookie('dataHoraUltimoLogin', new Date().toLocaleString(), {maxAge: 1000 * 60 * 60 * 24 * 30, httpOnly: true});
        resp.redirect('/');
    }
    else{
        resp.send(`
                    <html>
                        <head>
                         <meta charset="utf-8">
                         <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
                               integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
                        </head>
                        <body>
                            <div class="container w-25"> 
                                <div class="alert alert-danger" role="alert">
                                    Usuário ou senha inválidos!
                                </div>
                                <div>
                                    <a href="/login.html" class="btn btn-primary">Tentar novamente</a>
                                </div>
                            </div>
                        </body>
                        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
                                integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
                                crossorigin="anonymous">
                        </script>
                    </html>
                  `
        );
    }
}

//é o nosso middleware de segurança
function verificarAutenticacao(req, resp, next){
    if (req.session.usuarioLogado){
        next(); //permita acessar os recursos solicitados
    }
    else
    {
        resp.redirect('/login.html');
    }
}

app.get('/login', (req, resp) =>{
    resp.redirect('/login.html');
});

app.get('/logout', (req, resp) => {
    req.session.destroy(); //eliminar a sessão.
    resp.redirect('/login.html');
});

app.post('/login', autenticarUsuario);
app.get('/', verificarAutenticacao, menuView);
app.get('/cadastrarItem', verificarAutenticacao, cadastroItemView); //enviar o formulário para cadastrar itens
app.post('/cadastrarItem', verificarAutenticacao, cadastrarItem);
//a novidade desta aula é o método POST

app.listen(porta, host, () => {
    console.log(`Servidor iniciado e em execução no endereço http://${host}:${porta}`);
});
