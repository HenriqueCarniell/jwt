-- Active: 1706295515506@@localhost@3306@treinojwt
show databases;

create database treinojwt;

use treinojwt;
drop table usuario;
create Table usuario (
    idusuario int PRIMARY KEY  AUTO_INCREMENT,
    email VARCHAR(30),
    senha VARCHAR(1000)
);

delete FROM usuario;
select * from usuario;

