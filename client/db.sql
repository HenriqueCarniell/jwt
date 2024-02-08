-- Active: 1706295515506@@localhost@3306@jwt
show databases;

create database jwt;

use jwt;

drop table usuario;
create Table usuario (
    idusuario int PRIMARY KEY  AUTO_INCREMENT,
    nome VARCHAR(30),
    email VARCHAR(30),
    senha VARCHAR(1000)
);

delete FROM usuario;
select * from usuario;

