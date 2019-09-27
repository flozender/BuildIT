const Contest = require('../models/contest.model.js');

// Create and Save a new contest
exports.create = (req, res) => {
    // Validate request
    if(!req.body.contestId) {
        return res.status(400).send({
            message: "ContestId can not be empty"
        });
    }

    if(!req.body.contestName) {
        return res.status(400).send({
            message: "Contestname can not be empty"
        });
    }

    // Create a Contest
    const contest = new Contest({
        contestId: req.body.contestId,
        contestName: req.body.contestName,
        contestDate: req.body.contestDate,
        contestDuration: req.body.contestDuration,
        contestStartTime: req.body.contestStartTime
      });

    // SaveContest in the database
    contest.save()
    .then(data => {
        res.send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Contest."
        });
    });
};

// Retrieve and return all contests from the database.
exports.findAll = (req, res) => {
    Contest.find()
    .then(contests => {
        res.send(contests);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving contests."
        });
    });
};

// Find a single contest with a contestId
exports.findOne = (req, res) => {
    Contest.find({contestId: req.params.contestId})
    .then(contest => {
        if(!contest) {
            return res.status(404).send({
                message: "Contest not found with id " + req.params.contestId
            });            
        }
        res.send(contest);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Contest not found with id " + req.params.contestId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving contest with id " + req.params.contestId
        });
    });
};

// Update a contest identified by the contestId in the request
exports.update = (req, res) => {
    if(!req.body.contestId) {
        return res.status(400).send({
            message: "content can not be empty"
        });
    }
    console.log(req.body);
    // Findcontest and update it with the request body
   Contest.findOneAndUpdate({contestId: req.params.contestId}, {$set:{
        contestId: req.body.contestId,
        contestName: req.body.contestName,
        contestDate: req.body.contestDate,
        contestDuration: req.body.contestDuration,
        contestStartTime: req.body.contestStartTime
        }}, {new: true}, (err, doc) => {
          if(err){
              console.log("Error Occured");
          }
          console.log(doc);
      })
    .then(contest => {
        if(!contest) {
            return res.status(404).send({
                message: "Contest not found with id " + req.params.contestId
            });
        }
        res.send(contest);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Contest not found with id " + req.params.contestId
            });                
        }
        return res.status(500).send({
            message: "Error updating Contest with id " + req.params.contestId
        });
    });
};

// Delete a contest with the specified contestId in the request
exports.delete = (req, res) => {
    Contest.findOneAndRemove({contestId: req.params.contestId})
    .then(contest => {
        if(!contest) {
            return res.status(404).send({
                message: "contest not found with id " + req.params.contestId
            });
        }
        res.send({message: "contest deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "contest not found with id " + req.params.contestId
            });                
        }
        return res.status(500).send({
            message: "Could not deletecontest with id " + req.params.contestId
        });
    });
};