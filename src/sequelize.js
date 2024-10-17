"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {Sequelize} from 'sequelize';
// const Sequelize = require('sequelize');
var sequelize_1 = require("sequelize");
var sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: 'database/db.sqlite3',
});
exports.default = sequelize;
