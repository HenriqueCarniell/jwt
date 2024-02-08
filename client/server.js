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

// checar se usuario existe
let usuarioexiste = async (email) => {
    return new Promise((resolve, reject) => {
        const sql = "select * from usuario where email = ?";

        db.query(sql,[email], (err,result) => {
            if(err) {
                reject(err);
            }
        
            if(result.length > 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    });
}

let CriarUser = async (nome,email,senha) => {
    const salt = await bcrypt.genSalt(12);
    const senhacript = await bcrypt.hash(senha, salt);

    const sql = "insert into usuario (nome, email, senha) values (?, ?, ?)"

    db.query(sql,[nome,email,senhacript], (err,result) => {
        if(err) {
            console.log(err)
        } else {
            console.log(result)
        }
    })
}

let ValidacampoRegistro = (nome,email,senha) => {
    //validações
    if(!nome) {
        return { status: 422, msg: "O nome é obrigatorio" };
    }
    if(!email) {
        return { status: 422, msg: "O email é obrigatorio" };
    }
    if(!senha) {
        return { status: 422, msg: "A senha é obrigatorio" };
    }
    return null;
}

let ValidacampoLogin = (email,senha) => {
    //validações
    if(!email) {
        return { status: 422, msg: "O email é obrigatorio" };
    }
    if(!senha) {
        return { status: 422, msg: "A senha é obrigatorio" };
    }
    return null;
}

// registrar usuario
app.post('/register/usuario', async(req,res) => {
    const {nome,email,senha} = req.body;

    const erro = ValidacampoRegistro(nome,email,senha);

    if(erro) {
        return res.status(422).json({msg: erro});
    }
    
    try {
        const existe = await usuarioexiste(email);
        if(existe === true) {
            res.status(201).json({msg: "Utilize outro email"});
        } else {
            await CriarUser(nome,email,senha);
            res.status(200).json({msg: "Usuário criado com sucesso"});
        }
    } catch(err) {
        console.log(err);
        res.status(500).json({msg: "Erro ao verificar o usuário"});
    }
})

app.post('/login/usuario', async (req,res) => {
    const {email,senha} = req.body;

    const erro = ValidacampoLogin(email,senha)

    try {
        if(erro) {
            res.status(501).json({erro})
        }
    } catch(err) {
        console.log(err)
    }

})

app.listen(4000, () => {
    console.log(`servidor rodando na porta 4000`);
})
