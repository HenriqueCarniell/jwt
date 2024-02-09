require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

const db = mysql.createPool({
    user: 'root',
    host: 'localhost',
    database: 'jwt',
    port: 3306,
    password: "2006"
});

app.use(express.json())

let checarToken = (req,res,next) => {
    const authheader = req.headers['authorization'];
    const token = authheader && authheader.split(" ")[1];

    if(!token) {
        res.status(501).json({error: "acesso negado"});
    }

    try {
        const secret = process.env.SECRET;
        jwt.verify(token,secret);
        next();
    } catch(error) {
        res.status(501).json({msg: "acesso invalido"});
    }
}

//Rota privada
app.get("/user/:id", checarToken, async(req, res) => {
    const id = req.params.id;

    const sql = "SELECT * FROM usuario WHERE idusuario = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Erro ao recuperar o usuário" });
        }

        if (result.length > 0) {
            res.status(200).json({ msg: "Usuário encontrado", user: result[0]});
        } else {
            res.status(404).json({ msg: "Usuário não encontrado" });
        }
    });
});


// checar se usuario existe no banco de dados
let usuarioexiste = async (email) => {
    return new Promise((resolve, reject) => {
        const sql = "select * from usuario where email = ?";

        db.query(sql, [email], (err, result) => {
            if (err) {
                reject(err);
            }

            if (result.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    });
}

// Função que insere os dados no banco de dados
let CriarUser = async (nome, email, senha) => {

    // Criptografar a senha
    const salt = await bcrypt.genSalt(12);
    const senhacript = await bcrypt.hash(senha, salt);

    const sql = "insert into usuario (nome, email, senha) values (?, ?, ?)";

    return new Promise((resolve, reject) => {
        db.query(sql, [nome, email, senhacript], (err, result) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(result);
                resolve(result.insertId);
            }
        });
    });
}

// Função para validar os dados na rota de registro
let ValidacampoRegistro = (nome, email, senha) => {
    //validações
    if (!nome) {
        return { status: 422, msg: "O nome é obrigatorio" };
    }
    if (!email) {
        return { status: 422, msg: "O email é obrigatorio" };
    }
    if (!senha) {
        return { status: 422, msg: "A senha é obrigatorio" };
    }
    return null;
}

// Função para validar os dados na rota de login
let ValidacampoLogin = (email, senha) => {
    //validações
    if (!email) {
        return { status: 422, msg: "O email é obrigatorio" };
    }
    if (!senha) {
        return { status: 422, msg: "A senha é obrigatorio" };
    }
    return null;
}

// Rota para registrar usuario
app.post('/register/usuario', async (req, res) => {
    const { nome, email, senha } = req.body;

    const erro = ValidacampoRegistro(nome, email, senha);

    if (erro) {
        return res.status(422).json({ msg: erro });
    }

    try {
        const existe = await usuarioexiste(email);
        if (existe === true) {
            res.status(201).json({ msg: "Utilize outro email" });
        } else {
            await CriarUser(nome, email, senha);
            res.status(200).json({ msg: "Usuário criado com sucesso" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "Erro ao verificar o usuário" });
    }
})

// Checar se o email e a senha do usuario bate com a do banco de dados
let checardados = async (emaillogin, senhalogin) => {
    return new Promise((resolve, reject) => {
        const sql = "select * from usuario where email = ?";

        db.query(sql, [emaillogin], async (err, result) => {
            if (err) {
                reject(err);
                console.log(err);
            }
            if (result.length > 0) {
                const match = await bcrypt.compare(senhalogin, result[0].senha);
                resolve(match);
            } else {
                resolve(false);
            }
        })
    })
}

// Logar Usuario
app.post('/login/usuario', async (req, res) => {
    const { email, senha } = req.body;

    const erro = ValidacampoLogin(email, senha);

    if (erro) {
        return res.status(422).json({ erro });
    }

    const match = await checardados(email, senha);

    if (match === false) {
        return res.status(404).json({ err: "Usuario não encontrado" });
    }

    // Recupera o usuário do banco de dados
    const sql = "select * from usuario where email = ?";
    db.query(sql, [email], async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ err: "Erro ao recuperar o usuário" });
        } else {

            // Cria um token JWT com o ID do usuário
            const userId = result[0].id;
            const secrete = process.env.SECRET;
            const token = jwt.sign({ id: userId }, secrete);
    
            // Retorna o token para o cliente
            res.status(200).json({ msg: "Usuario encontrado", token: token });
        }
    });
    
});

app.listen(4000, () => {
    console.log(`servidor rodando na porta 4000`);
})
