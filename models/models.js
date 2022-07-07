const sequelize = require('../db')
const {DataTypes} = require('sequelize')

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, allowNull: true},
    password: {type: DataTypes.STRING, allowNull: true},
    role: {type: DataTypes.STRING, allowNull: false, defaultValue: 'USER'},
    IP: {type: DataTypes.STRING, allowNull: false},
    userConfirmationLink: {type: DataTypes.STRING, allowNull: true},
    adminConfirmationLink: {type: DataTypes.STRING, allowNull: true},
    isConfirmedEmail: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    isConfirmedAdmin: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
}, {hooks: true})

const Token = sequelize.define('token', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    refreshToken: {type: DataTypes.STRING, allowNull: false}
}, {hooks: true})

const Basket = sequelize.define('basket', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    is_paid: {type: DataTypes.BOOLEAN, defaultValue: false}
}, {hooks: true})

const BasketItem = sequelize.define('basket_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    amount: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1}
}, {hooks: true})

const MenuItem = sequelize.define('menu_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, allowNull: false},
    price: {type: DataTypes.FLOAT, allowNull: false},
    massInGramms: {type: DataTypes.FLOAT, allowNull: false},
    calories: {type: DataTypes.FLOAT, allowNull: false},
    image: {type: DataTypes.STRING}
}, {hooks: true})

const MenuItemType = sequelize.define('menu_item_type', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false}
}, {hooks: true})

const MenuItemInfo = sequelize.define('menu_item_info', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    info: {type: DataTypes.STRING, allowNull: false}
}, {hooks: true})

const TypeItem =  sequelize.define('type_item', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
}, {hooks: true})

User.hasOne(Token, {onDelete: 'CASCADE'})
Token.belongsTo(User, {onDelete: 'CASCADE'})

User.hasOne(Basket, {onDelete: 'CASCADE'})
Basket.belongsTo(User, {onDelete: 'CASCADE'})

Basket.hasMany(BasketItem, {onDelete: 'CASCADE'})
BasketItem.belongsTo(Basket, {onDelete: 'CASCADE'})

MenuItem.hasMany(BasketItem, {onDelete: 'CASCADE'})
BasketItem.belongsTo(MenuItem, {onDelete: 'CASCADE'})

MenuItem.hasMany(MenuItemInfo, {onDelete: 'CASCADE'})
MenuItemInfo.belongsTo(MenuItem, {onDelete: 'CASCADE'})

MenuItem.belongsToMany(MenuItemType, {through: TypeItem}, {onDelete: 'CASCADE'})
MenuItemType.belongsToMany(MenuItem, {through: TypeItem}, {onDelete: 'CASCADE'})

module.exports = {
    User,
    Token,
    Basket,
    BasketItem,
    MenuItem,
    MenuItemInfo,
    MenuItemType,
    TypeItem
}