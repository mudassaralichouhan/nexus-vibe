import {Request, Response} from "express";

export const likeOrDislike = async (request: Request, response: Response) => {
  // const userId = request.user.id;
  // const postId = request.params.id;
  //
  // try {
  //     const post = await PostModel.findById(postId);
  //
  //     if (!post)
  //         return response.status(404).json({message: "Post not found"});
  //
  //     const alreadyLiked = post.likes.includes(userId);
  //
  //     if (alreadyLiked) {
  //         post.likes = post.likes.filter((likeId) => likeId !== userId);
  //     } else {
  //         post.likes.push(userId);
  //     }
  //
  //     await post.save();
  //
  //     response.status(200).json({message: "Like or Dislike updated"});
  // } catch (error) {
  //     console.log(error);
  //     response.status(500).json(error);
  // }
};

export const commit = async (request: Request, response: Response) => {
  // await VineValidationMiddleware(vine.object({
  //     comment: vine.string().minLength(1).maxLength(255),
  // }))(request: Request, response: Response)
  //
  // const userId = request.user.id;
  // const postId = request.params.id;
  //
  // try {
  //     const post = await PostModel.findById(postId);
  //
  //     if (!post)
  //         return response.status(404).json({message: "Post not found"});
  //
  //     post.comments.push({
  //         _id: new Date().getTime() + strRand(),
  //         userId: userId,
  //         comment: request.body.comment,
  //     });
  //
  //     await post.save();
  //
  //     response.status(200).json({message: "Comment added"});
  // } catch (error) {
  //     console.log(error);
  //     response.status(500).json({message: error.message, code: error.code});
  // }
};

export const commitDestroy = async (request: Request, response: Response) => {
  // const userId = request.user.id;
  // const postId = request.params.id;
  // const commentId = request.params.commentId;
  //
  // try {
  //     const post = await PostModel.findOne({userId: userId, _id: postId});
  //
  //     if (!post)
  //         return response.status(404).json({message: "Post not found"});
  //
  //     //const alreadyCommented = post.comments.some(comment => comment._id === commentId);
  //
  //     post.comments = post.comments.filter(comment => comment._id !== commentId)
  //     await post.save();
  //     response.status(200).json({message: "Comment removed"});
  // } catch (error) {
  //     console.log(error);
  //     response.status(500).json(error);
  // }
};
