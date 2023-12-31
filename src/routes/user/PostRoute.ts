import express from "express";
import authMiddleware from "../../middleware/user-auth-middleware";

import {create, destroy, index, show, update,} from "../../controllers/user/posts/PostController";

import {timeline,} from "../../controllers/user/posts/PostUtilityTimelineController";

import {commit, commitDestroy, likeOrDislike,} from "../../controllers/user/posts/PostUtilityCommentController";

import {removeCategory, updateCategories,} from "../../controllers/user/posts/PostUtilityCategoryController";

import {removeTags, updateTags,} from "../../controllers/user/posts/PostUtilityTagController";

import {
  createOrUpdate as createOrUpdateCat,
  destroy as destroyCat,
  index as indexCat,
} from "../../controllers/user/posts/PostCategories";

import {
  createOrUpdate as createOrUpdateTags,
  destroy as destroyTags,
  index as indexTags,
} from "../../controllers/user/posts/PostTags";

const router = express.Router();

// Post categories routes
router.get("/categories", authMiddleware, indexCat);
router.post("/categories", authMiddleware, createOrUpdateCat);
router.delete("/categories/:id", authMiddleware, destroyCat);

// Post tags routes
router.get("/tags", authMiddleware, indexTags);
router.post("/tags", authMiddleware, createOrUpdateTags);
router.delete("/tags/:id", authMiddleware, destroyTags);

// Posts routes
router.get("/", authMiddleware, index);
router.get("/:id", authMiddleware, show);
router.post("/", authMiddleware, create);
router.put("/:id", authMiddleware, update);
router.delete("/:id", authMiddleware, destroy);

router.put("/:id/categories", authMiddleware, updateCategories);
router.delete("/:id/category/:categoryId", authMiddleware, removeCategory);

router.put("/:id/tags", authMiddleware, updateTags);
router.delete("/:id/tag/:tagSlug", authMiddleware, removeTags);

router.put("/:id/like", authMiddleware, likeOrDislike);
router.get("/timeline", authMiddleware, timeline);
router.post("/:id/comment", authMiddleware, commit);
router.delete("/:id/comment/:commentId", authMiddleware, commitDestroy);

const postRoutes = (app) => {
  app.use("/posts", router);
};

export default postRoutes;
