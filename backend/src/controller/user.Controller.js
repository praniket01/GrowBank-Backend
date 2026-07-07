import userModel from "../models/user.model.js";

export const searchUser = async (req,res,next) => {
    try {
        const query = req.query.query;
        if(!query || query.trim() === ""){
            return res.status(200).json({
                success : true,
                users : []
            });
        }

        const users = await userModel
        .find({
            _id : {$ne : req.user._id},

            $or : [
                {
                    name : {
                        $regex : query,
                        $options : "i",
                    }
                },
                {
                    email : {
                        $regex : query,
                        $options : "i",
                    }
                }
            ]
        })
        .select("_id name email")
        .limit(10);

        return res.status(200).json({
            success : true,
            users,
        });
    } catch (error) {
        next(error);
    }
}