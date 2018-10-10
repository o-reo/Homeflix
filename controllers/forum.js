//const Message = require('models/forum/message');
const SectionForum = require('../models/forum/sectionForum');
const Topic = require('../models/forum/topic');
const Message = require('../models/forum/message');

/* Section Forum */

exports.postSectionForum = function (req, res) {
    let newSectionForum = new SectionForum({
        title: req.body.title,
        description: req.body.description
    });

    newSectionForum.save((err) => {
        if (err){
            res.json({msg: 'Failed to add forum section, error :' + err});
        }else {
            res.json({msg: 'Section forum added successfully'});
        }
    });
}

exports.getSectionForums = function (req, res) {
    SectionForum.find(function(err, sectionForums){
        res.json(sectionForums);
    });
};

/* Topics */

exports.postTopic = function (req, res) {
    let newTopic = new Topic({
        id_sectionForum: req.body.id_sectionForum,
        id_author: req.user._id,
        title: req.body.title,
        content: req.body.content
    });

    newTopic.save((err, topic) => {
        if (err){
            res.json({msg: 'Failed to add topic, error :' + err});
        }else {
            //res.json({msg: 'topic added successfully'});

            let newMessage = new Message({
                id_author: req.user._id,
                id_topic: topic._id,
                id_sectionForum: topic.id_sectionForum,
                content: req.body.content
            });
            newMessage.save((err) => {
                if (err) {
                    res.json({msg: 'Failed to add message, error :' + err});
                } else {
                    res.json({msg: 'message added successfully'});
                }
            });
        }
    });
}

exports.getTopic = function (req, res) {
  Topic.findById(req.params.id, function (req, topic) {
     res.json(topic);
  });
};

exports.getTopics = function (req, res) {
    if (req.query.sort)
    {
        if (req.query.sort === "date") {
            Topic.find({}).sort({ time: -1 }).exec(function(err, topics) {
                res.json(topics);
            });
        }
    }
    else
    {
        Topic.find(function (err, topics) {
            res.json(topics);
        });
    }
};

exports.getTopicsInSectionForum = function (req, res) {
    Topic.find({ id_sectionForum: req.params.id_sectionForum }, function(req, topics) {
        res.json(topics);
    });
};

exports.deleteTopic = function (req, res) {
    Topic.remove({ _id: req.params.id }, function (err, topic){
       if (err)
           res.json(err);
       else {
           Message.remove( {id_topic: req.params.id}, function (err, message){
               if (err)
                   res.json(err);
               res.json({ msg: 'success' });
           });
       }
    });
}

exports.updateTopic = function (req, res) {
    Topic.findOne({ _id: req.params.id }, function (err, result) {
        if (err)
            res.json(err);
        else if (req.user.grant < 2 && req.user._id != result.id_author)
            res.send('Unauthorized');
        else {
            Topic.updateOne(
                {_id: req.params.id},
                {$set: {content: req.params.content}},
                function (err, result) {
                    if (err)
                        res.json(err);
                    res.json(result);
                });
        }
    });
}

/* Messages */

exports.postMessage = function (req, res) {
    Topic.findOne({ _id: req.body.id_topic }, function (err, topic)
    {
        if (err)
            res.json(err);
        else {
            let newMessage = new Message({
                id_author: req.user._id,
                id_topic: req.body.id_topic,
                id_sectionForum: topic.id_sectionForum,
                content: req.body.content
            });
            console.log(req.body.id_topic);
            newMessage.save((err) => {
                if (err) {
                    res.json({msg: 'Failed to add message, error :' + err});
                } else {
                    res.json({msg: 'message added successfully'});
                }
            });
        }
    });
}

exports.deleteMessage = function (req, res) {
    Message.remove({ _id: req.params.id }, function (err, result){
        if (err)
            res.json(err);
        else
            res.json(result);
    });
}

exports.updateMessage = function (req, res) {
    //Authorization
   Message.findOne({ _id: req.params.id }, function (err, result){
        if (err)
            res.json(err);
        else if (req.user.grant < 2 && req.user._id != result.id_author)
            res.send('Unauthorized');
        else {
            Message.updateOne(
                {_id: req.params.id},
                {$set: {content: req.body.content}},
                function (err, result) {
                    if (err)
                        res.json(err);
                    res.json(result);
                });
        }
    });
}

exports.getMessages = function (req, res) {
    Message.find(function(err, messages){
        res.json(messages);
    });
};

exports.getMessage = function (req, res) {
    Message.findOne({ _id: req.params.id }, function(err, message) {
        res.json(message);
    })
}

exports.getMessagesInTopic = function (req, res) {
    Message.find({ id_topic: req.params.id_topic }, function(req, messages) {
        res.json(messages);
    });
};

exports.getLastMessageInForum = function (req, res) {
    Message.findOne({ id_sectionForum: req.params.id_forum }).sort({ time: -1 }).exec(function(err, message) {
        if (err)
            res.json(err);
        else
            res.json(message);
    });
};

exports.getLastMessageInTopic = function (req, res) {
    Message.findOne({ id_topic: req.params.id_topic }).sort({ time: -1 }).exec(function(err, message) {
        if (err)
            res.json(err);
        else
            res.json(message);
    });
};