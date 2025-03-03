import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { MessageCircle, Calendar, User, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  image_url: string;
  image_alt: string;
  created_at: string;
  users: {
    full_name: string;
    role: string;
  };
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  users: {
    full_name: string;
    role: string;
  };
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    image_url: '',
    image_alt: '' 
  });
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          users (
            full_name,
            role
          ),
          comments: blog_comments (
            id,
            content,
            created_at,
            users (
              full_name,
              role
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      toast.error('Error loading blog posts');
    } finally {
      setLoading(false);
    }
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to create a post');
      return;
    }

    try {
      const { error } = await supabase
        .from('blogs')
        .insert([
          {
            title: newPost.title,
            content: newPost.content,
            image_url: newPost.image_url || 'https://source.unsplash.com/800x400/?technology',
            image_alt: newPost.image_alt || newPost.title,
            author_id: user.id,
          },
        ]);

      if (error) throw error;

      toast.success('Blog post created successfully!');
      setNewPost({ title: '', content: '', image_url: '', image_alt: '' });
      setShowNewPost(false);
      fetchPosts();
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast.error('Error creating blog post');
    }
  }

  async function addComment(blogId: string) {
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }

    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert([
          {
            blog_id: blogId,
            content: newComment[blogId],
            author_id: user.id,
          },
        ]);

      if (error) throw error;

      toast.success('Comment added successfully!');
      setNewComment({ ...newComment, [blogId]: '' });
      fetchPosts();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error adding comment');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Technical Blog</h1>
        {user && (
          <button
            onClick={() => setShowNewPost(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Write a Post
          </button>
        )}
      </div>

      {/* Informative Content for New Users */}
      {!user && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="p-4 border border-gray-300 rounded-md bg-white shadow-md">
            <h2 className="text-xl font-semibold mb-2">Welcome to the Technical Blog!</h2>
            <p className="text-gray-700">
              This platform allows you to share your knowledge and insights on various technical topics. 
              Engage with the community by exploring existing posts and contributing your own.
            </p>
          </div>
          <div className="p-4 border border-gray-300 rounded-md bg-white shadow-md">
            <h2 className="text-xl font-semibold mb-2">How to Write a Post</h2>
            <p className="text-gray-700">
              Click on the "Write a Post" button to create a new blog entry. You can add a title, content, 
              and an optional image. Ensure your content is informative and relevant to the technical community.
            </p>
          </div>
          <div className="p-4 border border-gray-300 rounded-md bg-white shadow-md">
            <h2 className="text-xl font-semibold mb-2">Benefits of Participating</h2>
            <p className="text-gray-700">
              By sharing your knowledge, you help others learn and grow. Engaging with the community can also 
              enhance your own understanding of technical topics and provide valuable networking opportunities.
            </p>
          </div>
          <div className="p-4 border border-gray-300 rounded-md bg-white shadow-md">
            <h2 className="text-xl font-semibold mb-2">Commenting Guidelines</h2>
            <p className="text-gray-700">
              We encourage constructive feedback and discussions. Please be respectful and avoid spam or 
              inappropriate content. Your comments help foster a positive community!
            </p>
          </div>
          <div className="p-4 border border-gray-300 rounded-md bg-white shadow-md">
            <h2 className="text-xl font-semibold mb-2">Engage with the Community</h2>
            <p className="text-gray-700">
              Join discussions, ask questions, and connect with like-minded individuals in the tech community. 
              Your participation enriches the experience for everyone.
            </p>
          </div>
          <div className="p-4 border border-gray-300 rounded-md bg-white shadow-md">
            <h2 className="text-xl font-semibold mb-2">Stay Updated</h2>
            <p className="text-gray-700">
              Follow the latest trends and technologies by reading posts from other community members. 
              Stay informed and enhance your skills through shared knowledge.
            </p>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full transition-transform transform scale-100 hover:scale-105">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New Post</h2>
              <button onClick={() => setShowNewPost(false)} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={createPost} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  id="image_url"
                  value={newPost.image_url}
                  onChange={(e) => setNewPost({ ...newPost, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty for a random technology-related image
                </p>
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <textarea
                  id="content"
                  rows={6}
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewPost(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Full Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full my-8">
            <div className="relative">
              <img
                src={selectedPost.image_url || 'https://source.unsplash.com/800x400/?technology'}
                alt={selectedPost.image_alt || selectedPost.title}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-lg"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedPost.title}</h2>
              <div className="flex items-center text-gray-500 text-sm mb-6">
                <User  className="h-4 w-4 mr-1" />
                <span>{selectedPost.users?.full_name || 'Anonymous'}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-4 w-4 mr-1" />
                <span>{format(new Date(selectedPost.created_at), 'MMM d, yyyy')}</span>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-600 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[500px] transition-transform transform hover:scale-105">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={post.image_url || 'https://source.unsplash.com/800x400/?technology'}
                alt={post.image_alt || post.title}
                className="object-cover w-full h-full cursor-pointer"
                onClick={() => setSelectedPost(post)}
              />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h2 
                className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600"
                onClick={() => setSelectedPost(post)}
              >
                {post.title}
              </h2>
              <div className="flex items-center text-gray-500 text-sm mb-4">
                <User  className="h-4 w-4 mr-1" />
                <span>{post.users?.full_name || 'Anonymous'}</span>
                <span className="mx-2">•</span>
                <Calendar className="h-4 w-4 mr-1" />
                <span>{format(new Date(post.created_at), 'MMM d, yyyy')}</span>
              </div>
              <p className="text-gray-600 mb-6 line-clamp-3">{post.content}</p>
              
              <div className="mt-auto">
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      <span>{post.comments?.length || 0} Comments</span>
                    </div>
                    <button
                      onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {expandedComments === post.id ? 'Hide Discussion' : 'View Discussion'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section - Only shown when expanded */}
            {expandedComments === post.id && (
              <div className="bg-gray-50 p-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Comments</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {post.comments?.map((comment) => (
                    <div key={comment.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <User  className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{comment.users.full_name}</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-500 text-sm">
                          {format(new Date(comment.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <p className="text-gray-600">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {user && (
                  <div className="mt-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                        placeholder="Write a comment..."
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => addComment(post.id)}
                        disabled={!newComment[post.id]}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}