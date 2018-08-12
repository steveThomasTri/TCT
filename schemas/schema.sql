DROP DATABASE if exists tct2016_;
CREATE DATABASE tct2016_;

use tct2016_;

drop table if exists bouncerlist;
create table bouncerlist (
	id int not null auto_increment,
    fullname varchar(50) not null,
    email varchar(50) not null,
    password varchar(100) not null,
    primary key(id)
);

drop table if exists tournaments;
create table tournaments (
	id int not null auto_increment,
    name varchar(100) not null,
    date char(10) not null,
    maxnum int(4) not null,
    location varchar(100) not null,
    email varchar(50) not null,
    code char(4) not null,
    tournamentid char(7) not null,
    primary key(id)
);

drop table if exists games;
create table games (
	id int not null auto_increment,
    game varchar(100) not null,
    points int(5) default 0,
    MTP int(2) default 1,
    AAV int(2) default 1,
    description text,
    code char(4) not null,
    primary key(id)
);

drop table if exists players;
create table players (
	id int not null auto_increment,
    firstname varchar(20) not null,
    lastname varchar(20) not null,
		dateofbirth char(10) not null,
    email varchar(50),
    username varchar(20) not null,
    password varchar(100) not null,
    infosens varchar(200) not null,
    playerid char(10) not null,
    verified bool default false,
		code char(4) not null,
    primary key(id)
);
