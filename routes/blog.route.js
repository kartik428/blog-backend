import express from "express"
import { isAuthenticated } from "../middleware/isAuthenticated.js"
import { createBlog, deleteBlog, dislikeBlog, getMyTotalBlogLikes, getOwnBlogs, getPublishedBlog, likeBlog, togglePublishedBlog, updateBlog } from "../controllers/blog.controller.js";
import { singleUpload } from "../middleware/multer.js";
const router = express.Router();  



router.route('/').post(isAuthenticated, createBlog)
router.route('/:blogId').put(isAuthenticated, singleUpload, updateBlog )
router.route("/get-published-blogs").get(getPublishedBlog)
router.route('/get-own-blogs').get(isAuthenticated, getOwnBlogs )
router.route('/delete/:id').delete(isAuthenticated, deleteBlog )
router.get("/:blogId/like", isAuthenticated, likeBlog);
router.get("/:id/dislike", isAuthenticated, dislikeBlog);
router.get('/my-blogs/likes', isAuthenticated, getMyTotalBlogLikes)
router.route("/:blogId").patch(togglePublishedBlog);
// router.route("/get-all-blogs").get(getAllBlogs)

export default router;
