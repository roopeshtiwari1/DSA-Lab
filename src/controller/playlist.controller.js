import { db } from "../libs/db"

export const createPlayList = async (req, res) => {
  try {
    const {name, description} = req.body
    const userId = req.user.userId

    const playlist = await db.playlist.create({
      data: {
        name,
        description,
        userId
      }
    })

    return res.status(201).json({
      success: true,
      message: "playlist created successfully",
      playlist
    })

  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
}

export const getAllListDetails = async (req, res) => {
  try {
    const playlists = await db.playlist.findMany({
      where: {
        userId : req.user.id
      },
      include : {
        problems :{
          include: {
            problem: true
          }
        }
      }
    })

     res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playlists,
    });
  } catch (error) {
    console.error("Error fetching all playlist details:", error);
    res.status(500).json({ error: "Failed to fetch all playlist details" });
  }
}

export const getPlayListDetails = async (req, res) => {
  const {playlistId} = req.params

  try {
    const playlist = await db.playlist.findUnique({
      where:{
        userId : req.user.id,
        id: playlistId
      },
      include: {
        problems: {
          include: {
            problem: true
          }
        }
      }
    })

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    res.status(200).json({
      success: true,
      message: "Playlist fetched successfully",
      playlist,
    });

  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
}

export const addProblemToPlaylist = async (req, res) => {
  const {playlistId} = req.params
  const {problemIds} = req.body
  
  try {
    
    if(!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({error: "invalid or missing problemIds"})
    }

    const addToPlaylist = await db.problemInPlaylist.createMany({
      data: problemIds.map((problemid) => ({
        playlistId,
        problemid
      }))
    })

    res.status(201).json({
      success: true,
      message: "Problems added to playlist successfully",
      problemsInPlaylist,
    });

  } catch (error) {
     console.error("Error adding problems to playlist:", error.message);
    res.status(500).json({ error: "Failed to add problems to playlist" });
  }
}

export const deletePlayList = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const deletedPlaylist = await db.playlist.delete({
      where: {
        id: playlistId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Playlist deleted successfully",
      deletedPlaylist,
    });
  } catch (error) {
    console.error("Error deleting playlist:", error.message);
    res.status(500).json({ error: "Failed to delete playlist" });
  }
}

export const removeProblemFromPlaylist = async (req, res) => {
  const {playlistId} = req.params
  const {problemIds} = req.body

  try {
    
    if(!Array.isArray(problemIds) || problemIds.length === 0) {
      return res.status(400).json({error: "invalid or missing problemIds"})
    }

    const removeProblemFromPlaylist = await db.problemInPlaylist.deleteMany({
      where: {
        playlistId,
        problemId : {
          in: problemIds
        }
      }
    })

    res.status(200).json({
      success: true,
      message: "Problem removed from playlist successfully",
      deletedProblem,
    });

  } catch (error) {
     console.error("Error removing problem from playlist:", error.message);
    res.status(500).json({ error: "Failed to remove problem from playlist" });
  }
}