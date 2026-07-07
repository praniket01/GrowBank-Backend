import accountModel from '../models/account.model.js';
import ledgerModel from '../models/ledger.model.js';
import userModel from '../models/user.model.js';

export const createAccountController = async (req, res) => {
    const user = req.user;

    const account = await accountModel.create({
        user: user._id
    });

    res.status(201).json({
        account
    });
}

export const getUser = async (req,res,next) => {
    try {
    const user = await userModel
      .findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
}

export const getAccountBalance = async (req, res, next) => {
    try {
        console.log("Printing user : ",req.user._id);
        const userId = req.user._id;

        const account = await accountModel.findOne({
            user: userId,
        });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: "Account not found"
            })
        }

        const ledger = await ledgerModel.aggregate([{
            $match: {
                account: account._id,
            },
        },
        {
            $group: {
                _id: "$account",
                credits: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$type", "CREDIT"]
                            },
                            "$amount",
                            0
                        ]
                    }
                },
                debits: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$type", "DEBIT"]
                            },
                            "$amount",
                            0,
                        ]
                    }
                }
            }
        }
        ]);

        const balance = ledger.length === 0 ? 0 : ledger[0].credits - ledger[0].debits;

        return res.status(200).json({
            success : true,
            balance,
        });
    } catch (error) {
        next(error);
    }

}

export const getUserAccountsController = async (req, res) => {
    const accounts = await accountModel.find({ user: req.user._id });

    res.status(200).json({
        accounts
    })
}

