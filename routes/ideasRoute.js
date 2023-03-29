import express from "express";

import { 
    getIdeas, 
    getAddIdeas, 
    postAddIdeas, 
    deleteIdeas, 
    getEditIdeas, 
    putEditIdeas,
    getRecords, 
    } from "../controllers/ideasController.js";
import ensureAuthenticated from "../helpers/auth.js"; //? import verify if user login 
const router = express.Router();

router.route("/").get(getIdeas); //? final step of refactoring
router.route("/:id").delete(deleteIdeas);
router.route("/edit/:id").get(getEditIdeas).put(putEditIdeas); 
router.route("/add").get(getAddIdeas).post(postAddIdeas); 

// router.get("/add", getAddIdeas); //? re-refactoring
// router.post("/add", postAddIdeas);
// router.get("/edit/(:id)", getEditIdeas); 
// router.put("/edit/:id", putEditIdeas); 

router.route("/edit/:id").get(getEditIdeas).put(putEditIdeas);
router.get("/records", getRecords);

export default router;