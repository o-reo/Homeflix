const bcrypt = require('bcrypt');




// exports.postUsers = function (req, res) {
//     let newUser = new User({
//         first_name: req.body.first_name,
//         last_name: req.body.last_name,
//         password: req.body.password,
//         mail: req.body.mail,
//         username: req.body.username
//     });
//     User.find({ $or: [{username: req.body.username}, {mail: req.body.mail}] }, function(err1, user){
//         if (err1) {
//             res.json({msg: 'Username ou Mail deja existant'});
//             console.log('err1');
//         }
//         else {
//             newUser.save((err2, user) => {
//                 if (err2) {
//                     res.json({msg: 'Failed to add contact, error :' + err2});
//                     console.log(JSON.stringify(newUser));
//                 } else {
//                     res.json({msg: 'Contact added successfully'});
//                     console.log('Contact added successfully');
//                 }
//             });
//         }
//     });
// };
//
// exports.getUsers = function (req, res) {
//     User.find(function(err, users){
//         res.json(users);
//     });
// };
//
// exports.getUser = function (req, res) {
//     User.findOne({_id: req.params.id}, function(err, result) {
//        if (err)
//            res.json(err);
//        res.json(result);
//     });
// };
//
// exports.getMyUser = function (req, res) {
//     User.findOne({ _id: req.user._id }, function(err, result) {
//         if (err)
//             res.json(err);
//         res.json(result);
//     });
// };
//
// exports.modifyMyUser = function (req, res) {
//     console.log(req.body);
//     let request = {
//         first_name: req.body.first_name,
//         last_name: req.body.last_name,
//         lang: req.body.lang
//     };
//     User.updateOne(
//         { _id: req.user._id },
//         { $set: request },
//         function(err, result) {
//             if (err)
//                 res.json(err);
//             res.json(request);
//         });
// };
//
// exports.modifyMyUserPhoto = function (req, res) {
//     User.updateOne({ _id: req.user._id }, { $set: {photo: req.body.photo} }, function(err, res) {
//         if (err)
//             res.json(err);
//         else
//             res.json({msg: 'success'});
//     });
// };
//
// exports.removeUser = function (req, res) {
//     User.remove({_id: req.params.id}, function(err, result) {
//         if (err){
//             res.json(err);
//         }else {
//             res.json(result);
//         }
//     })
// };
//
// exports.modifyUser = function (req, res) {
//     console.log('HELLO');
//     console.log('LANG', req.body.lang);
//     let request = {
//         first_name: req.first_name,
//         last_name: req.last_name,
//         password: req.body.password,
//         mail: req.body.mail,
//         username: req.body.username,
//         grant: req.body.grant,
//         lang: req.body.lang
//     };
//     User.updateOne(
//         { _id: req.params.id },
//         { $set: request },
//         function(err, result) {
//             if (err)
//                 res.json(err);
//             res.json(request);
//     });
// };
//
// exports.UpdateUsers = function (req, res) {
//     let request = {
//         lang: 'fre'
//     };
//     User.update({$set: request}, function(err, user) {
//        if(err)
//            res.json(err);
//        else
//            res.json({msg: 'finish'});
//     });
// };
