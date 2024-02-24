require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authconfig = require('./auth')

const app = express();

const db = mysql.createPool({
    user: 'root',
    host: 'localhost',
    database: 'treinojwt',
    port: 3306,
    password: "2006"
})

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.post("/send/login/dados", async (req,res) => {
    const {email,senha} = req.body;

    let usuario = await validaEmailEnviadoBancoDeDados(email)

    if(usuario) {
        let comparaSenha = await bcrypt.compare(senha, usuario.senha)

        if (comparaSenha) {
            const {secret, expiresIn} = authconfig.jwt;

            const token = jwt.sign({}, secret, {
                subject: String(usuario.idusuario),
                expiresIn
            })
            
            res.status(201).json({token, usuario});
        } else {
            res.status(404).json({ msg: "Email ou Senha incorretos" });
        }
    }
})


let validaEmailEnviadoBancoDeDados = (email) => {
    return new Promise((resolve, reject) => {
        const sql = "select * from usuario where email = ?";

        db.query(sql, [email], (err,result) => {
            if(err) {
                reject(err)
                console.log(err)
            }
            if(result.length > 0) {
                resolve(result[0])
            } else {
                resolve(false)
            }
        })
    })
}

app.post("/send/register/dados", async (req,res) => {
    const {email,senha} = req.body;

    await ValidaRegistroUsuario(email,senha,res)
    
})

let ValidaRegistroUsuario = async (email, senha, res) => {
    const sql = "select * from usuario where email = ?";

    const salt = await bcrypt.genSalt(12);
    const senhaCript = await bcrypt.hash(senha, salt);

    db.query(sql,[email], async (err,result) => {
        if(err) {
            console.log(err)
        }
        if(result.length > 0) {
            await res.status(202).json({msg: "Esse email já foi registrado"})
        } else {
            await inserirUsuario(email,senhaCript,res)
        }
    })
}

let inserirUsuario = (email,senhaCript,res) => {
    const sql = "insert into usuario(email,senha) values(?,?)";

    db.query(sql, [email,senhaCript], async (err,result) => {
        if(err) {
            console.log(err)
        }
        if(result) {
            await res.status(202).json({msg: "Usuario inserido com sucesso"})
        } else {
            await res.status(202).json({error: "Erro ao inserir Usuario"})
        }
    })
} 

app.listen(4000, () => {
    console.log(`servidor rodando na porta 4000`)
})