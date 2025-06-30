import { getServerUrl, getCookie } from '../utils/function.js';

export const getPosts = (offset, limit) => {
    const result = fetch(
        `${getServerUrl()}/posts?offset=${offset}&limit=${limit}`,
        {
            headers: {
                session: getCookie('session'),
                userId: getCookie('userId'),
            },
            noCORS: true,
        },
    );
    return result;
};

export const searchPosts = (offset, limit, query) => {
    const result = fetch(
        `${getServerUrl()}/searchPosts?offset=${offset}&limit=${limit}&query=${query}`,
        {
            headers: {
                session: getCookie('session'),
                userId: getCookie('userId'),
            },
            noCORS: true,
        },
    );
    return result;
};