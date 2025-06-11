import express from "express"
import {authMiddleware} from "../middleware/auth.middleware.js"
import { addProblemToPlaylist, createPlayList, deletePlayList, getAllListDetails, getPlayListDetails, removeProblemFromPlaylist } from "../controller/playlist.controller.js"


const playlistRoutes = express.Router()

router.get("/" , authMiddleware , getAllListDetails)

router.get("/:playlistId" , authMiddleware , getPlayListDetails)

router.post("/create-playlist" ,authMiddleware ,  createPlayList)



router.post('/:playlistId/add-problem' , authMiddleware , addProblemToPlaylist)

router.delete("/:playlistId" , authMiddleware , deletePlayList)

router.delete("/:playlistId/remove-problem" , authMiddleware , removeProblemFromPlaylist)


export default playlistRoutes