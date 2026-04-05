import { Blog } from "../models/blog.model.js";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/dataUri.js";

export const createBlog = async(req, res)=>{
    try {
        const {title, category} = req.body;

        if (!title || !category) {
            return res.status(400).json({
                message:"BLog title and category is required"
            })
        }
        const blog = await Blog.create({
            title,
            category,
            author:req.id
        })

        return res.status(201).json({
            success:true,
            blog,
            message:"Blog created Successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failed to create Blog"
        })        
    }
}

export const updateBlog = async(req,res)=>{
    try {
        const blogId = req.params.blogId;
        const {title, subtitle, description, category} = req.body;
        const file = req.file;

        let blog = await Blog.findById(blogId)
        if(!blog){
            return res.status(404).json({
                message:"Blog not found"
            })                     
        }
        let thumbnail;
        if(file){
            const fileUri = getDataUri(file)
            thumbnail = await cloudinary.uploader.upload(fileUri)
        }
        const updateData = {title, subtitle, description, category, author:req.id, thumbnail:thumbnail?.secure_url}
        blog = await Blog.findByIdAndUpdate(blogId, updateData, {new:true})
        res.status(200).json({
            success:true,
            message:"Blog Updated Successfully"
        })
        // console.log(blog);
        
        } catch (error) {
        console.log(error);
        
       return res.status(500).json({
        message:"Error updating blog"
       })
    }
}

export const getOwnBlogs = async(req, res)=>{
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(400).json({
                message: "User is required"
            })
        }
        const blogs = await Blog.find({author:userId}).populate({
            path:"author",
            select:'firstname lastname photoUrl'
        })
        if (!blogs) {
            return status(404).json({message:"No blogs found", blogs:[], success:false})
        }
        return res.status(200).json({blogs, success:true})
    } catch (error) {
        return res.status(500).json({
            message:"error fetching blogs",
            error:error.message
        })
    }
}

export const deleteBlog = async(req, res)=>{
    try {
        const blogId = req.params.id;
        const authorId = req.id;
        const blog = await Blog.findById(blogId)
        if (!blog) {
            return res.status(404).json({
                success:false,
                message:"Blog not found"
            })
        }
        if (blog.author.toString() !== authorId) {
            return res.status(403).json({
                success:false,
                message:"Unauthorized to delete the blog"
            })
        }
        // Delete blog 
        await Blog.findByIdAndDelete(blogId)

        res.status(200).json({
                success:true,
                message:"Blog deleted successfully"
            })
       
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Failed to delete blog",
            error:error.message
        })
    }
}

export const getPublishedBlog = async(_, res)=>{
    try {
       
        const blogs = await Blog.find({isPublished:true}).sort({
            createdAt:-1
        }).populate({
                path:"author",
                select:'firstname lastname photoUrl'    
        });
        if (!blogs) {
            return res.status(401).json({
                success:false,
                message:"No published blog found"
            })
        }
        return res.status(200).json({
            success:true,
            blogs,
        })  
    } catch (error) {
        return res.status(500).json({
            message:"Failed to get published blog",
        })
    }
}

export const togglePublishedBlog = async(req, res)=>{
    try {
        const {blogId} = req.params;
        const {publish} = req.query; 
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({
                message:"Blog not found",
            })
        }
        // Update published status bassd on the query param
        blog.isPublished = !blog.isPublished;
        await blog.save();

        const statusMessage = blog.isPublished ? 'Published' : 'Unpublished';
        return res.status(200).json({
            success:true,
            message:`Blog ${statusMessage} successfully`,})
    } catch (error) {
        return res.status(500).json({
            message:"Failed to update status",
        })
    }   
}

export const likeBlog = async(req, res)=>{
    try {
        const {blogId} = req.params;
        const likeKrneWalaUserKiId = req.id;
        const blog = await Blog.findById(blogId).populate({path:"likes"});
        if (!blog) {
            return res.status(404).json({   
                message:"Blog not found",
                success:false
            })
        }   
        await blog.updateOne({$addToSet:{likes:likeKrneWalaUserKiId}});
        await blog.save();
        return res.status(200).json({
            message:"Blog liked successfully",
            blog,
            success:true
        })  
    } catch (error) {
      console.log(error);
            
    }       
}

export const dislikeBlog = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        const blogId = req.params.id;
        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ message: 'post not found', success: false })

        //dislike logic started
        await blog.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
        await blog.save();

        return res.status(200).json({ message: 'Blog disliked', blog, success: true });
    } catch (error) {
        console.log(error);

    }
}

export const getMyTotalBlogLikes = async (req, res) => {
    try {
      const userId = req.id; // assuming you use authentication middleware
  
      // Step 1: Find all blogs authored by the logged-in user
      const myBlogs = await Blog.find({ author: userId }).select("likes");
  
      // Step 2: Sum up the total likes
      const totalLikes = myBlogs.reduce((acc, blog) => acc + (blog.likes?.length || 0), 0);
  
      res.status(200).json({
        success: true,
        totalBlogs: myBlogs.length,
        totalLikes,
      });
    } catch (error) {
      console.error("Error getting total blog likes:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch total blog likes",
      });
    }
  };