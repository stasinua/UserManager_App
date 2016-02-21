
var User       = require('../../app/models/user'),
    bodyParser = require('body-parser'),
    jwt        = require('jsonwebtoken'),
    config     = require('../../config'),
    // super secret for creating tokens
    superSecret = config.secret;

module.exports = function(app,express){
  var apiRouter = express.Router();

  apiRouter.post('/authenticate', function(req,res){
    //Find user. Проверяем имя пользователя и пароль отдельно
    User.findOne({
      username: req.body.username
    }).select('name username password').exec(function(err, user){
      if(err){
        throw(err);
      }
      //Check user
      if(!user){
        res.json({success: false, message: "Ошибка! Пользователь не найден"});
      } else if(user){
        //Check password
        var validPassword = user.comparePassword(req.body.password);
        if(!validPassword){
          res.json({success: false, message: "Ошибка! Неверный пароль"});
        }
        //If everything OK:
        else {
          var token = jwt.sign({
            name: user.name,
            username: user.username},
            superSecret, {expiresInMinutes: 1440});

          res.json({
            success: true,
            message: "Enjoy your token",
            token: token
          });
        }
      }
    });
  });

  //register new user
  apiRouter.post('/register', function(req,res){
    //Find user. Проверяем имя пользователя
    User.findOne({
      username: req.body.username
    }).select('name username password').exec(function(err, user){
      if(err){
        throw(err);
      }
      //Check user
      if(user){
        res.json({
          success: false,
          message: "Ошибка! Такой пользователь уже зарегистрирован"
        });
      }
      //If everything OK:
      else {
        var registerUser = new User();

				registerUser.name = req.body.name;
				registerUser.username = req.body.username;
				registerUser.password = req.body.password;

				registerUser.save();

        res.json({
          success: true,
          message: "Регистрация прошла успешно"
        });

      }
    });
  });

  apiRouter.use(function(req,res,next){
    console.log("Somebody just came to our app!");
    //middleware

    //Checking token middleware
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    if(token){
      jwt.verify(token, superSecret, function(err, decoded){
        if (err) {
          return res.status(403).send({
            success: false,
            message: "Failed to authenticate token"});
        }
        else {
          req.decoded = decoded;
          next();
        }
      });
    }
    else {
      return res.status(403).send({
        success: false,
        message: "No token provided"
      });
    }

  });

  apiRouter.get('/', function(req,res){
    res.json({ message: "Hooray! Welcome to our API!" });
  });

  apiRouter.route('/users')
  //create user on POST request to "localhost:8080/api/user"
  .post(function(req,res){
      var user = new User();
      user.name = req.body.name;
      user.username = req.body.username;
      user.password = req.body.password;

      user.save(function(err){
        if(err){
          //duplicate entry
          if (err.code == 11000){
            return res.json({success: false, message: "Пользователь с таким именем уже существует"});
          }
          else {
            return res.send(err);
          }
        }
        res.json({message: "Пользователь создан"});
      });
  })
  //Get all users
  .get(function(req, res){
    User.find(function(err,users){
      if(err){
        return res.send(err);
      }
      else {
        res.json(users);
      }
    });
  });

  //Getting single user by id

  apiRouter.route('/users/:user_id')
  .get(function(req, res){
    User.findById(req.params.user_id, function(err, user){
      if(err){
        res.send(err);
      }
      else {
        res.json(user);
      }
    });
  })
  .put(function(req, res){
    User.findById(req.params.user_id, function(err,user){
      if(err){
        res.send(err);
      }
      /*Блок с тремя if нуждается в дополнительной проверке на совпадение строк
      и защиту от ввода пустой строки(null), чтобы не запускать лишних
      обновлений строк
      user.save рекомендуется запустить после проверки на вышеуказанные условия,
      Добавить доп.информацию, к этому комментраию, если данные проверки будут
      осуществлены во фронтенде
      Проверки осуществлены во фронтенде!
      */
      if(req.body.name !== user.name){
        user.name = req.body.name;
      }
      if(req.body.username !== user.username){
        user.username = req.body.username;
      }
      if(req.body.password !== user.password){
        user.password = req.body.password;
      }

      user.save(function(err) {
      if(err){
        res.send(err);
      }
      else {
        res.json({message: "Пользователь изменен"});
      }
      });
    });
  })
  .delete(function(req,res){
    User.remove({_id: req.params.user_id}, function(err,user){
      if(err){
        res.send(err);
      }
      else {
        res.json({message: "Пользователь успешно удален"});
      }
    });
  });

  apiRouter.get('/me', function(req,res){
    res.send(req.decoded);
  });

  return apiRouter;
};
