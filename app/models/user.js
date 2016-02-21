//setting up mongoose model
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
  name: String,
  username: {type: String, required: true, index: {unique: true}},
  password: {type: String, required: true, select: false}
});

//Хешируем пароль, перед сохранением пользователя
UserSchema.pre('save', function(next){
  var user = this;
  //Хешируем пароль, если он изменен или новый пользователь
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.hash(user.password, null, null, function(err, hash){
    if(err){
      return next(err);
    }
    user.password = hash;
    next();
  });
});

//Сравниваем пароль и данные из БД
UserSchema.methods.comparePassword = function(password){
  var user = this;
  return bcrypt.compareSync(password, user.password);
};

//Експортируем модель
module.exports = mongoose.model('User', UserSchema);
