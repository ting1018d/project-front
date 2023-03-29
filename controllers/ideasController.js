import Idea from "../models/Idea.js";

//* add export 
export const getIdeas = (req,res) => {
    Idea.find({ userID : res.locals.user._id }) //? find passportConfig - user._id   
        .lean()
        .sort({date: "desc"})
        .then((ideas) => {
        console.log(ideas);
        res.locals.ideas = ideas; //? bring it to template engine 
        res.render("ideas/ideasIndex",{name:res.locals.user.name});
        //* similar to above statement 
        //* res.render("ideas/ideasIndex", { ideas: ideas }); change to above statement
    });   
};
export const getAddIdeas = (req,res) => {
    res.render("ideas/add")
};
export const postAddIdeas = (req,res) => {
    let errors = []; //* if no variable => array
    if (!req.body.title) {
        errors.push({text: "Please add a title"});
    }
    if (!req.body.details) {
        errors.push({text: "Please add some details"});
    }
    if (errors.length > 0) {
        res.render("ideas/add", {
            errors : errors,
            title : req.body.title,
            details : req.body.details,
        });
    } else {
        const newUser = {
            title : req.body.title,
            details : req.body.details,
            userID : res.locals.user._id, 
            //? passportConfig - user._id -> find the id and bring back for respond client, break though all the page code 
        }; 
        //* available for edited more databese
        new Idea(newUser).save().then(() => {
            req.flash("success_msg","Note Added!");
            res.redirect("/ideas");
        });
    }

};
//? delete
export const deleteIdeas = (req,res) => {
    Idea.deleteOne({_id: req.params.id})
    .then(() => {
        req.flash("error_msg","Note Deleted!");
        res.redirect("/ideas")
    }); 
};
//? edit 
export const getEditIdeas = (req,res) => {
    Idea.findOne({_id: req.params.id}) //? find unique records
    .lean()
    .then((idea) => {
        res.render("ideas/edit", { idea : idea });
    });
};
//? send data after edit 
export const putEditIdeas = (req,res) => {
    Idea.findOne({
        _id: req.params.id,
    }).then((idea) => {
        let edit_error_msg = "";
        if (!req.body.title) {
            edit_error_msg += "Please add a title, "
        }
        if (!req.body.details) {
            edit_error_msg += "please add some details."
        }
        if (edit_error_msg) {
            req.flash("error_msg", edit_error_msg);
            console.log(res.locals); //? check the "locals" global or not 
            res.redirect("/ideas/edit/" + idea._id); //? if error return previous page 

        } else {
            idea.title = req.body.title;
            idea.details = req.body.details;
            idea.save().then(() => {
                req.flash("success_msg","Note Upated!")
                res.redirect("/ideas"); //? GET IDEAS
            });
        }
    })
};

export const getRecords = (req, res) => {
    Idea.aggregate ([
            {
              '$lookup': {
                'from': 'users', 
                'localField': 'userID', 
                'foreignField': '_id', 
                'as': 'userInfo'
              }
            }, {
              '$unwind': {
                'path': '$userInfo', 
                'preserveNullAndEmptyArrays': true
              }
            }, {
              '$sort': {
                'date': -1
              }
            }])
        .then(records => {
        console.log(records);
        res.render("ideas/records",{records: records})
    }); 
}