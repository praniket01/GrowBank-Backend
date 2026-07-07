import userModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import { sendRegistrationEmail } from "../services/email.service.js";


export const userRegisterationController = async (req, res) => {
    const { email, password, name } = req.body;
    const exists = await userModel.findOne({
        email: email
    });
    if (exists) {
        return res.status(422).json({
            message: "User already present",
            status: "failed"
        })
    }

    const user = await userModel.create({
        email, password, name
    })

    const token = jwt.sign({
        userId: user._id,
    }, process.env.JWT_SECRET, { expiresIn: "3d" }
    );

    res.cookie("token", token);
    res.status(201).json({
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    });
    //await sendRegistrationEmail(user.email,user.name);

}

export const userLoginController = async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    const exists = await userModel.findOne({
        email: email
    }).select("+password");
    let token = null;
    if (exists) {
        const passValid = await exists.comparePassword(password);
        if (passValid) {
            token = jwt.sign({
                userId: exists._id,
            }, process.env.JWT_SECRET, { expiresIn: "3d" }
            );
        }
        else{
            res.status(400).json({
                error : "wrong credentials",
                
            })
        }
    }

    res.cookie("token", token);
    res.status(200).json({
        user: {
            _id: exists._id,
            email: exists.email,
            name: exists.name
        },
        token
    })

}

