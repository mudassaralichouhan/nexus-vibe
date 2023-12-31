import {Request, Response} from "express";

export const timeline = async (request: Request, response: Response) => {
  // const userId = request.user.id;
  //
  // try {
  //     const currentUserPosts = await PostModel.find({userId: userId});
  //     const followingPosts = await UserModel.aggregate([{
  //         $match: {
  //             _id: new mongoose.Types.ObjectId(userId),
  //         },
  //     }, {
  //         $lookup: {
  //             from: "posts", localField: "following", foreignField: "userId", as: "followingPosts",
  //         },
  //     }, {
  //         $project: {
  //             followingPosts: 1, _id: 0,
  //         },
  //     },]);
  //
  //     response.status(200).json(currentUserPosts
  //         .concat(...followingPosts[0].followingPosts)
  //         .sort((a, b) => {
  //             return b.createdAt - a.createdAt;
  //         }));
  // } catch (error) {
  //     response.status(500).json(error);
  // }
};
