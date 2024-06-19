import { Navigate } from "react-router-dom";
import HomePage from "../../pages/Home";
import AuthPage from "../../pages/Authentication";
import UserPage from "../../pages/user";
import PostPage from "../../pages/Post";
import UpdateProfilePage from "../../pages/profileUpdate";
import ChatPage from "../../pages/Chat";
import CreatePost from "../../components/createPost";

export const paths = [
    {
        path: '/',
        AuthElement: () =>  <HomePage />,
        UnAuthElement: () => <Navigate to={'/auth'} />
    },
    {
        path: '/auth',
        AuthElement: () => <Navigate to='/' />,
        UnAuthElement: () => <AuthPage />
    },
    {
        path: '/update',
        AuthElement: () => <UpdateProfilePage />,
        UnAuthElement: () => <Navigate to='/auth' />
    },
    {
        path: '/:username',
        AuthElement: () => (
            <>
                <UserPage />
                <CreatePost />
            </>),
        UnAuthElement: () => <UserPage />
    },
    {
        path: '/:username/post/:pid',
        AuthElement: () => <PostPage />,
        UnAuthElement: () => <PostPage />
    },
    {
        path: '/chat',
        AuthElement: () => <ChatPage />,
        UnAuthElement: () => <Navigate to='/auth' />
    },
]