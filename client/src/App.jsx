import React, { useCallback, useEffect, useState } from 'react';
import {
  Link,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { formatDate, jsonRequest, request, truncate } from './api.js';

const categories = [
  'Technology',
  'Life-Experiences',
  'Trending',
  'Daily Life',
  'Love',
  'Other',
];

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const result = await request('/users/session');
    setUser(result.data.user);
    return result.data.user;
  }, []);

  useEffect(() => {
    refreshUser()
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, [refreshUser]);

  if (authLoading) {
    return <div className="page-status">Welcome to TranquilTales...</div>;
  }

  return (
    <div className="app-shell">
      <Navbar user={user} onLogout={() => setUser(null)} />
      <main>
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route
            path="/login"
            element={<AuthPage mode="login" onAuthenticated={setUser} />}
          />
          <Route
            path="/register"
            element={<AuthPage mode="register" onAuthenticated={setUser} />}
          />
          <Route
            path="/posts/new"
            element={
              <Protected user={user}>
                <PostEditor />
              </Protected>
            }
          />
          <Route path="/posts/:id" element={<PostPage user={user} />} />
          <Route
            path="/posts/:id/edit"
            element={
              <Protected user={user}>
                <PostEditor />
              </Protected>
            }
          />
          <Route
            path="/profile"
            element={
              <Protected user={user}>
                <ProfilePage />
              </Protected>
            }
          />
          <Route
            path="/settings/profile"
            element={
              <Protected user={user}>
                <ProfileSettings onUpdated={setUser} />
              </Protected>
            }
          />
          <Route
            path="/settings/password"
            element={
              <Protected user={user}>
                <PasswordSettings />
              </Protected>
            }
          />
          <Route
            path="/settings/:imageType"
            element={
              <Protected user={user}>
                <ImageSettings onUpdated={setUser} />
              </Protected>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const logout = async () => {
    try {
      await request('/users/logout', { method: 'POST' });
      onLogout();
      navigate('/');
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand" aria-label="TranquilTales home">
        <img src="/images/logo.png" alt="" />
        <span>TranquilTales</span>
      </Link>
      <button
        className="menu-toggle"
        type="button"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(open => !open)}
      >
        ☰
      </button>
      <div className={`nav-links${menuOpen ? ' nav-open' : ''}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        {user ? (
          <>
            <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
            <Link to="/posts/new" onClick={() => setMenuOpen(false)}>Write</Link>
            <button type="button" className="nav-logout" onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="nav-cta" onClick={() => setMenuOpen(false)}>Join us</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div>
        <Link to="/" className="footer-brand">TranquilTales</Link>
        <p>Thoughtful stories, shared by you.</p>
      </div>
      <a href="mailto:hello@tranquiltales.com">Get in touch</a>
    </footer>
  );
}

function Protected({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function HomePage({ user }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    request('/posts')
      .then(result => setPosts(result.data.posts))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <p className="eyebrow">A space for stories</p>
          <h1>You write.<br />We read.</h1>
          <p className="hero-copy">
            Change begins within; be the catalyst of positive transformation.
          </p>
          <Link className="button button-light" to={user ? '/posts/new' : '/register'}>
            Share your story <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Fresh perspectives</p>
            <h2>Latest stories</h2>
          </div>
          <span>{posts.length} {posts.length === 1 ? 'story' : 'stories'}</span>
        </div>
        {loading ? <p className="page-status">Loading stories...</p> : null}
        {error ? <p className="notice notice-error">{error}</p> : null}
        {!loading && !error && posts.length === 0 ? (
          <div className="empty-state">
            <h3>Your next favorite story starts here.</h3>
            <p>Be the first to share something with the community.</p>
            <Link className="button button-primary" to={user ? '/posts/new' : '/register'}>
              Create a post
            </Link>
          </div>
        ) : null}
        <div className="post-grid">
          {posts.map(post => <PostCard key={post._id} post={post} />)}
        </div>
      </section>
    </>
  );
}

function PostCard({ post }) {
  return (
    <article className="post-card">
      <Link to={`/posts/${post._id}`} className="post-card-image">
        <img src={post.image} alt="" loading="lazy" />
        <span>{post.category}</span>
      </Link>
      <div className="post-card-content">
        <p className="post-meta">
          <span>{post.user?.fullname || 'TranquilTales writer'}</span>
          <span>{formatDate(post.createdAt)}</span>
        </p>
        <h3><Link to={`/posts/${post._id}`}>{post.title}</Link></h3>
        <p className="post-excerpt">{truncate(post.description)}</p>
        <Link className="read-link" to={`/posts/${post._id}`}>Read story <span>→</span></Link>
      </div>
    </article>
  );
}

function AuthPage({ mode, onAuthenticated }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setError('');
    setBusy(true);
    const form = new FormData(event.currentTarget);
    const data = Object.fromEntries(form.entries());
    try {
      const result = await request(`/users/${mode}`, jsonRequest('POST', data));
      onAuthenticated(result.data.user);
      navigate('/profile');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="form-page">
      <form className="form-card" onSubmit={submit}>
        <p className="eyebrow">{isRegister ? 'Start sharing' : 'Welcome back'}</p>
        <h1>{isRegister ? 'Create your account' : 'Sign in to your account'}</h1>
        {error ? <p className="notice notice-error">{error}</p> : null}
        {isRegister ? (
          <Field label="Full name" name="fullname" autoComplete="name" required />
        ) : null}
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          required
        />
        <button className="button button-primary button-wide" disabled={busy}>
          {busy ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}
        </button>
        <p className="form-switch">
          {isRegister ? 'Already a member?' : 'New to TranquilTales?'}{' '}
          <Link to={isRegister ? '/login' : '/register'}>
            {isRegister ? 'Login' : 'Create an account'}
          </Link>
        </p>
      </form>
    </section>
  );
}

function PostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    request(`/posts/${id}`)
      .then(result => setPost(result.data.post))
      .catch(err => setError(err.message));
  }, [editing, id]);

  const submit = async event => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = new FormData(event.currentTarget);
      const result = await request(
        editing ? `/posts/${id}` : '/posts',
        { method: editing ? 'PUT' : 'POST', body }
      );
      navigate(`/posts/${result.data.post._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (editing && !post && !error) {
    return <p className="page-status">Loading post...</p>;
  }

  return (
    <section className="form-page">
      <form className="form-card form-card-wide" onSubmit={submit}>
        <p className="eyebrow">{editing ? 'Polish your story' : 'Put it into words'}</p>
        <h1>{editing ? 'Edit your post' : 'Create a new post'}</h1>
        {error ? <p className="notice notice-error">{error}</p> : null}
        <Field label="Title" name="title" defaultValue={post?.title} required />
        <label className="field">
          <span>Category</span>
          <select name="category" defaultValue={post?.category || ''} required>
            <option value="" disabled>Select a category</option>
            {categories.map(category => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Your story</span>
          <textarea name="description" rows="9" defaultValue={post?.description} required />
        </label>
        <label className="field">
          <span>{editing ? 'Replace cover image (optional)' : 'Cover image'}</span>
          <input type="file" name="file" accept="image/png,image/jpeg" required={!editing} />
        </label>
        {post?.image ? <img className="image-preview" src={post.image} alt="Current post cover" /> : null}
        <button className="button button-primary" disabled={busy}>
          {busy ? 'Saving...' : editing ? 'Save changes' : 'Publish story'}
        </button>
      </form>
    </section>
  );
}

function PostPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadPost = useCallback(() => {
    request(`/posts/${id}`)
      .then(result => {
        setPost(result.data.post);
        setError('');
      })
      .catch(err => setError(err.message));
  }, [id]);

  useEffect(() => { loadPost(); }, [loadPost]);

  const deletePost = async () => {
    if (!window.confirm('Delete this story and its comments?')) return;
    try {
      await request(`/posts/${id}`, { method: 'DELETE' });
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const addComment = async event => {
    event.preventDefault();
    setError('');
    try {
      await request(`/comments/${id}`, jsonRequest('POST', { message }));
      setMessage('');
      loadPost();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!post && !error) return <p className="page-status">Loading story...</p>;
  if (!post) return <div className="content-section"><p className="notice notice-error">{error}</p><Link to="/">Back home</Link></div>;

  const isAuthor = user && post.user?._id === user._id;
  return (
    <section className="article-layout">
      <article className="article">
        {error ? <p className="notice notice-error">{error}</p> : null}
        <p className="eyebrow">{post.category}</p>
        <h1>{post.title}</h1>
        <p className="post-meta">
          <span>By {post.user?.fullname || 'TranquilTales writer'}</span>
          <span>{formatDate(post.createdAt)}</span>
        </p>
        <img className="article-cover" src={post.image} alt="" />
        {isAuthor ? (
          <div className="article-actions">
            <Link className="button button-quiet" to={`/posts/${id}/edit`}>Edit story</Link>
            <button className="button button-danger" onClick={deletePost}>Delete story</button>
          </div>
        ) : null}
        <div className="article-body">{post.description}</div>
        <section className="comments-section">
          <h2>Conversation <span>({post.comments?.length || 0})</span></h2>
          {user ? (
            <form className="comment-form" onSubmit={addComment}>
              <label className="field">
                <span>Leave a thoughtful comment</span>
                <textarea
                  rows="3"
                  value={message}
                  onChange={event => setMessage(event.target.value)}
                  required
                />
              </label>
              <button className="button button-primary">Post comment</button>
            </form>
          ) : <p><Link to="/login">Sign in</Link> to join the conversation.</p>}
          <div className="comment-list">
            {post.comments?.map(comment => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUser={user}
                onChanged={loadPost}
              />
            ))}
            {!post.comments?.length ? <p className="muted">No comments yet. Start the conversation.</p> : null}
          </div>
        </section>
      </article>
      <aside className="author-card">
        <p className="eyebrow">The author</p>
        <Avatar image={post.user?.profileImage} name={post.user?.fullname} />
        <h2>{post.user?.fullname}</h2>
        <p>{post.user?.bio}</p>
      </aside>
    </section>
  );
}

function CommentItem({ comment, currentUser, onChanged }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(comment.message);
  const [error, setError] = useState('');
  const ownsComment = currentUser && comment.user?._id === currentUser._id;

  const save = async event => {
    event.preventDefault();
    try {
      await request(`/comments/${comment._id}`, jsonRequest('PUT', { message }));
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await request(`/comments/${comment._id}`, { method: 'DELETE' });
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <article className="comment">
      <Avatar image={comment.user?.profileImage} name={comment.user?.fullname} small />
      <div className="comment-content">
        <div className="comment-header">
          <strong>{comment.user?.fullname || 'Community member'}</strong>
          <time>{formatDate(comment.createdAt)}</time>
        </div>
        {editing ? (
          <form onSubmit={save} className="inline-edit">
            <textarea value={message} onChange={event => setMessage(event.target.value)} required />
            <button className="button button-primary button-small">Save</button>
            <button type="button" className="text-button" onClick={() => setEditing(false)}>Cancel</button>
          </form>
        ) : <p>{comment.message}</p>}
        {error ? <p className="notice notice-error">{error}</p> : null}
        {ownsComment && !editing ? (
          <div className="comment-actions">
            <button className="text-button" onClick={() => setEditing(true)}>Edit</button>
            <button className="text-button text-danger" onClick={remove}>Delete</button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    request('/users/profile-page')
      .then(result => setProfile(result.data.user))
      .catch(err => setError(err.message));
  }, []);

  if (error) return <section className="content-section"><p className="notice notice-error">{error}</p></section>;
  if (!profile) return <p className="page-status">Loading your profile...</p>;

  return (
    <section className="profile-page">
      <div
        className="profile-cover"
        style={profile.coverImage ? { backgroundImage: `linear-gradient(90deg, #172c2db3, #172c2d25), url("${profile.coverImage}")` } : undefined}
      >
        <div className="profile-top">
          <Avatar image={profile.profileImage} name={profile.fullname} />
          <div>
            <p className="eyebrow">Your corner of the community</p>
            <h1>{profile.fullname}</h1>
            <p>{profile.email}</p>
          </div>
        </div>
        <div className="profile-links">
          <Link to="/settings/profile">Edit details</Link>
          <Link to="/settings/password">Password</Link>
          <Link to="/settings/profile-photo">Profile photo</Link>
          <Link to="/settings/cover-photo">Cover photo</Link>
        </div>
      </div>
      <div className="content-section">
        <div className="section-heading">
          <div><p className="eyebrow">Your words</p><h2>Your stories</h2></div>
          <Link className="button button-primary" to="/posts/new">Write a story</Link>
        </div>
        {profile.posts?.length ? (
          <div className="post-grid">
            {profile.posts.map(post => <PostCard key={post._id} post={post} />)}
          </div>
        ) : (
          <div className="empty-state"><h3>Your first story is waiting.</h3><Link to="/posts/new">Start writing</Link></div>
        )}
      </div>
    </section>
  );
}

function ProfileSettings({ onUpdated }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    request('/users/session').then(result => setUser(result.data.user)).catch(err => setError(err.message));
  }, []);

  const submit = async event => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      const form = new FormData(event.currentTarget);
      const result = await request('/users/update', jsonRequest('PUT', Object.fromEntries(form.entries())));
      onUpdated(result.data.user);
      setUser(result.data.user);
      setNotice('Your profile has been updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SettingsForm title="Update your details" error={error} notice={notice} onSubmit={submit} loading={!user}>
      <Field label="Full name" name="fullname" defaultValue={user?.fullname} required />
      <Field label="Email" name="email" type="email" defaultValue={user?.email} required />
      <button className="button button-primary">Save details</button>
    </SettingsForm>
  );
}

function PasswordSettings() {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const submit = async event => {
    event.preventDefault();
    setError('');
    setNotice('');
    const formElement = event.currentTarget;
    try {
      const form = new FormData(formElement);
      await request('/users/update-password', jsonRequest('PUT', Object.fromEntries(form.entries())));
      formElement.reset();
      setNotice('Your password has been updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SettingsForm title="Change your password" error={error} notice={notice} onSubmit={submit}>
      <Field label="New password" name="password" type="password" autoComplete="new-password" required />
      <button className="button button-primary">Update password</button>
    </SettingsForm>
  );
}

function ImageSettings({ onUpdated }) {
  const { imageType } = useParams();
  const isCover = imageType === 'cover-photo';
  const endpoint = isCover ? '/users/cover-photo-upload' : '/users/profile-photo-upload';
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (!isCover && imageType !== 'profile-photo') return <NotFound />;

  const submit = async event => {
    event.preventDefault();
    setError('');
    setNotice('');
    try {
      const form = new FormData(event.currentTarget);
      const result = await request(endpoint, { method: 'PUT', body: form });
      onUpdated(result.data.user);
      setNotice('Your image has been updated.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SettingsForm
      title={`Upload ${isCover ? 'cover' : 'profile'} photo`}
      error={error}
      notice={notice}
      onSubmit={submit}
    >
      <label className="field">
        <span>Select an image</span>
        <input type="file" name="profile" accept="image/png,image/jpeg" required />
      </label>
      <button className="button button-primary">Upload image</button>
    </SettingsForm>
  );
}

function SettingsForm({ title, error, notice, onSubmit, children, loading = false }) {
  return (
    <section className="form-page">
      {loading ? <p className="page-status">Loading settings...</p> : (
        <form className="form-card" onSubmit={onSubmit}>
          <p className="eyebrow">Account settings</p>
          <h1>{title}</h1>
          {error ? <p className="notice notice-error">{error}</p> : null}
          {notice ? <p className="notice notice-success">{notice}</p> : null}
          {children}
        </form>
      )}
    </section>
  );
}

function Field({ label, name, type = 'text', ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input name={name} type={type} {...props} />
    </label>
  );
}

function Avatar({ image, name = 'TranquilTales member', small = false }) {
  return (
    <span className={`avatar${small ? ' avatar-small' : ''}`}>
      {image ? <img src={image} alt="" /> : <span aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>}
    </span>
  );
}

function NotFound() {
  return (
    <section className="empty-state not-found">
      <p className="eyebrow">404</p>
      <h1>This story wandered off.</h1>
      <Link className="button button-primary" to="/">Return home</Link>
    </section>
  );
}

export default App;
