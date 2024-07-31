const Post = require('../models/postModel');
const User = require('../models/userModel');
const path = require('path');
const fs = require('fs');
const { v4: uuid } = require('uuid');
const HttpError = require('../models/errorModel');
const { error } = require('console');

// ==================================== CREATE A POST ===========================
//POST : api/posts
//protected
const createPost = async (req, res, next) => {
    try {
      let { title, category, description } = req.body;
      if (!title || !category || !description || !req.files || !req.files.thumbnail) {
        return next(new HttpError("Fill in all fields and choose thumbnail", 422));
      }
  
      const { thumbnail } = req.files;
      // Check the file size
      if (thumbnail.size > 2000000) {
        return next(new HttpError("Thumbnail is too big. File should be less than 2MB", 422));
      }
  
      let fileName = thumbnail.name;
      let splittedFileName = fileName.split('.');
      let newFileName = splittedFileName[0] + uuid() + "." + splittedFileName[splittedFileName.length - 1];
  
      thumbnail.mv(path.join(__dirname, '..', '/uploads', newFileName), async (err) => {
        if (err) {
          return next(new HttpError(err.message, 500));
        } else {
          const newPost = await Post.create({ title, category, description, thumbnail: newFileName, creator: req.user.id });
          if (!newPost) {
            return next(new HttpError("Post couldn't be created", 422));
          }
  
          // Find user and increment post count by 1
          const currentUser = await User.findById(req.user.id);
          if (currentUser) {
            const userPostCount = currentUser.posts + 1;
            await User.findByIdAndUpdate(req.user.id, { posts: userPostCount });
          }
  
          res.status(200).json(newPost);
        }
      });
    } catch (err) {
      return next(new HttpError(err.message, 500));
    }
  };
  

// ==================================== GET ALL POSTS ===========================
//get : api/posts
//protected
const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ updatedAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

// ==================================== Get Single post ===========================
//get : api/posts/:id
//unprotected
const getPost = async (req, res, next) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return next(new HttpError("Post not found", 404));
        }
        res.status(200).json(post);
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

// ==================================== Get posts by category ===========================
//POST : api/posts/categories/:category
//unprotected
const getCatPosts = async (req, res, next) => {
    try {
        const { category } = req.params;
        const catPosts = await Post.find({ category }).sort({ createdAt: -1 });
        res.status(200).json(catPosts);
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

// ==================================== Get User/Author by POST ===========================
//POST : api/posts/users/:id
//protected
const getUserPosts = async (req, res, next) => {
    try {
        const {id} =req.params;
        const posts = await Post.find({creator : id}).sort({createdAt : -1})
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

// ==================================== Edit post ===========================
//PATCH : api/posts/:id
//protected
const editPost = async (req, res, next) => {
    try {
        let fileName;
        let newFileName;
        let updatedPost;
        const postId = req.params.id;
        let { title, category, description } = req.body;

        // ReactQuill has a paragraph opening and closing tag with a break tag in between so there 11 characters in there already
        if (!title || !category || description.length < 12) {
            return next(new HttpError("Fill in all the fields", 422));
        }

        if (!req.files) {
            updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description }, { new: true });
        } else {
            // get old post from database
            const oldPost = await Post.findById(postId);
            if(req.user.id == oldPost.creator){
            if (!oldPost) {
                return next(new HttpError("Post not found", 404));
            }

            // delete the old thumbnail from upload
            await fs.promises.unlink(path.join(__dirname, '..', 'uploads', oldPost.thumbnail)).catch(error => {
                if (error && error.code !== 'ENOENT') {
                    return next(new HttpError(error.message, 500));
                }
            });

            // upload new thumbnail
            const { thumbnail } = req.files;

            // check file size
            if (thumbnail.size > 2000000) {
                return next(new HttpError("Thumbnail size is too big. It should be less than 2MB", 422));
            }

            fileName = thumbnail.name;
            let splittedFileName = fileName.split('.');
            newFileName = splittedFileName[0] + uuid() + '.' + splittedFileName[splittedFileName.length - 1];

            await thumbnail.mv(path.join(__dirname, '..', 'uploads', newFileName));

            updatedPost = await Post.findByIdAndUpdate(postId, { title, category, description, thumbnail: newFileName }, { new: true });
        }
    }

        if (!updatedPost) {
            return next(new HttpError("Could not update the post", 400));
        }

        res.status(200).json(updatedPost);

    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};


// ==================================== Delete post ===========================
//delete: api/posts/:id
//protected
const deletePost = async (req, res, next) => {
    try {
        const postId =req.params.id;
        if(!postId){
            return next(new HttpError("post unavailable",400))
        }
        const post = await Post.findById(postId)
        const fileName = post.thumbnail
        if(req.user.id ==post.creator){
        //delete thumbnail from uploads folder
        fs.unlink(path.join(__dirname,'..','uploads',fileName), async (err) =>{
            if(err){
                return next(new HttpError(err))
            }else{
                await Post.findByIdAndDelete(postId);
                // find the user and reduce the post count
                const currentUser = await User.findById(req.user.id);
                const userPostCount =currentUser?.posts -1;
                await User.findByIdAndUpdate(req.user.id , {posts : userPostCount})
                res.json( `Post ${postId} deleted successfuly.`)
            }
        }) 
    }else{
        return next(new HttpError("Post could'nt deleted",403))
    }
    } catch (error) {
        return next(new HttpError(error.message, 500));
    }
};

module.exports = { createPost, getPosts, getPost, getCatPosts, getUserPosts, editPost, deletePost };
