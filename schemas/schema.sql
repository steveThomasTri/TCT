DROP DATABASE if exists tct2018;
CREATE DATABASE tct2018;

use tct2018;

drop table if exists bouncerlist;
create table bouncerlist (
	id int not null auto_increment,
    fullname varchar(50) not null,
    email varchar(50) not null,
    password varchar(100) not null,
    primary key(id),
    unique `email` (email)
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
    primary key(id),
    unique `name` (name),
    unique `tournamentid` (tournamentid)
);

drop table if exists games;
create table games (
	id int not null auto_increment,
    game varchar(100) not null,
    points int(5) default 0,
    MTP int(2) default 1,
    AAV int(2) default 1,
    description text,
    tournament_id int,
    primary key(id),
    foreign key (tournament_id) references tournaments(id) on delete cascade
);

drop table if exists registration;
drop table if exists players;
create table registration (
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
    primary key(id),
    unique `username` (username),
    unique `playerid` (playerid)
);

drop table if exists stats;
create table stats (
    id int not null auto_increment,
    player_id int,
    wins int default 0,
    losses int default 0,
    victories int default 0,
    primary key(id),
    foreign key(player_id) references registration(id) on delete cascade
);

drop table if exists messages;
create table messages (
    id int not null auto_increment,
    player_id int,
    message text not null,
    primary key(id),
    foreign key(player_id) references registration(id) on delete cascade
);

drop table if exists achievements;
create table achievements (
    id int not null auto_increment,
    player_id int,
    achievement text not null,
    primary key(id),
    foreign key(player_id) references registration(id) on delete cascade
);

drop table if exists tournament_status;
create table tournament_status(
	id int not null auto_increment,
    tournament_id int not null,
    isclosed bool default false,
    primary key(id),
    foreign key (tournament_id) references tournaments(id) on delete cascade
);

drop table if exists players;
create table players (
    id int not null auto_increment,
    player_id int not null,
    tournament_id int not null,
    primary key(id),
    foreign key(player_id) references registration(id) on delete cascade,
    foreign key(tournament_id) references tournaments(id) on delete cascade
);

--select * from games;