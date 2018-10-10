const express = require('express');
const userController = require('../controllers/user');
const authController = require('../controllers/auth');
const clientController = require('../controllers/client');
const oauth2Controller = require('../controllers/oauth2');
const forumController = require('../controllers/forum');
const torrentController = require('../controllers/torrent');
const movieController = require('../controllers/movie');

const router = express.Router();

/* Users */
router.route('/auth')
    .post(authController.isAuth);

router.route('/users')
    .post(userController.postUsers)
    .get(userController.getUsers);

router.route('/user/:id')
    .get(userController.getUser)
    .delete(authController.isAdmin, userController.removeUser)
    .put(authController.isAdmin, userController.modifyUser);

router.route('/myuser')
    .get(authController.loginRequired, userController.getMyUser)
    .put(authController.loginRequired, userController.modifyMyUser);

router.route('/myuserphoto')
    .put(authController.loginRequired, userController.modifyMyUserPhoto);

router.route('/forum/section_forums')
    .get(forumController.getSectionForums);

router.route('/forum/section_forum')
    .post(authController.loginRequired, forumController.postSectionForum);

router.route('/forum/topics')
    .get(forumController.getTopics);

router.route('/forum/topic')
    .post(authController.loginRequired, forumController.postTopic);

router.route('/forum/topic/:id')
    .get(forumController.getTopic)
    .put(authController.loginRequired, forumController.updateMessage)
    .delete(authController.isAdmin, forumController.deleteTopic);

router.route('/forum/topics/:id_sectionForum')
    .get(forumController.getTopicsInSectionForum);

router.route('/forum/messages')
    .get(forumController.getMessages);

router.route('/forum/message')
    .post(authController.loginRequired, forumController.postMessage);

router.route('/forum/message/:id')
    .delete(authController.isAdmin, forumController.deleteMessage)
    .put(authController.loginRequired, forumController.updateMessage)
    .get(forumController.getMessage);

router.route('/forum/messages/:id_topic')
    .get(forumController.getMessagesInTopic);

router.route('/forum/message/lastinforum/:id_forum')
    .get(forumController.getLastMessageInForum);

router.route('/forum/message/lastintopic/:id_topic')
    .get(forumController.getLastMessageInTopic);

router.route('/clients')
    .post(authController.loginRequired, clientController.postClients)
    .get(authController.loginRequired, clientController.getClients);

router.route('/oauth2/authorize')
    .get(authController.loginRequired, oauth2Controller.authorization)
    .post(authController.loginRequired, oauth2Controller.decision);

router.route('/oauth2/token')
    .post(authController.isClientAuthenticated, oauth2Controller.token);

router.route('/auth/google')
    .get(authController.authGoogle);

router.route('/auth/google/callback')
    .get(authController.authGoogleCallback);

router.route('/auth/sign_in')
    .post(authController.sign_in);

router.route('/auth/sign_in/:social')
    .post(authController.sign_in_social);

router.route('/torrent/:api/:title')
    .get(torrentController.getTorrent);

router.route('/stream/:hash')
    .get(torrentController.streamTorrent);

router.route('/movie/:api/:id_api')
    .get(movieController.accessMovie);

router.route('/movie_comment/:id_comment')
    .get(movieController.getComment);

router.route('/movie_comments')
    .get(movieController.getAllComments);

router.route('/movie_comments/:id_movie')
    .get(movieController.getComments);

router.route('/movie_comment')
    .post(authController.loginRequired, movieController.postComment);

module.exports = router;
