import BoardItem from '../component/board/boardItem.js';
//import Header from '../component/header/header.js';
import { authCheck, getServerUrl, prependChild } from '../utils/function.js';
import { getPosts, searchPosts } from '../api/indexRequest.js';

const DEFAULT_PROFILE_IMAGE = '../public/image/profile/default.jpg';
const HTTP_NOT_AUTHORIZED = 401;
const SCROLL_THRESHOLD = 0.9;
const INITIAL_OFFSET = 5;
const ITEMS_PER_LOAD = 5;

// getBoardItem 함수
const getBoardItem = async (offset = 0, limit = 5) => {
    offset = Number.isInteger(offset) ? offset : parseInt(offset, 10);
    if (isNaN(offset)) offset = 0;
    limit = Number.isInteger(limit) ? limit : parseInt(limit, 10);
    if (isNaN(limit)) limit = 5;

    let url = `/posts?offset=${offset}&limit=${limit}`;

    console.log('Requesting URL:', url);

    const response = await getPosts(url);
    if (!response.ok) {
        throw new Error('Failed to load post list.');
    }

    const data = await response.json();
    return data.data;
};

const setBoardItem = boardData => {
    const boardList = document.querySelector('.boardList');
    if (boardList && boardData) {
        const itemsHtml = boardData
            .map(data =>
                BoardItem(
                    data.post_id,
                    data.created_at,
                    data.post_title,
                    data.hits,
                    data.profileImagePath === null ? null : data.profileImagePath,
                    data.nickname,
                    data.comment_count,
                    data.like,
                ),
            )
            .join('');
        boardList.innerHTML += ` ${itemsHtml}`;
    }
};

// 스크롤 이벤트 추가
const addInfinityScrollEvent = () => {
    let offset = INITIAL_OFFSET,
        isEnd = false,
        isProcessing = false;

    window.addEventListener('scroll', async () => {
        const hasScrolledToThreshold =
            window.scrollY + window.innerHeight >=
            document.documentElement.scrollHeight * SCROLL_THRESHOLD;
        if (hasScrolledToThreshold && !isProcessing && !isEnd) {
            isProcessing = true;

            try {
                const newItems = await getBoardItem(offset, ITEMS_PER_LOAD);
                if (newItems.length !== 0) {
                    isEnd = true;
                } else {
                    offset += ITEMS_PER_LOAD;
                    setBoardItem(newItems);
                }
            } catch (error) {
                console.error('Error fetching new items:', error);
                isEnd = true;
            } finally {
                isProcessing = false;
            }
        }
    });
};

const searchInput = async (offset = 0, limit = 5, query = '') => {
    offset = Number.isInteger(offset) ? offset : parseInt(offset, 10);
    if (isNaN(offset)) offset = 0;
    limit = Number.isInteger(limit) ? limit : parseInt(limit, 10);
    if (isNaN(limit)) limit = 5;

    let url = `/posts?offset=${offset}&limit=${limit}&query=${query}`;

    console.log('Requesting URL:', url);

    const response = await getPosts(url);
    if (!response.ok) {
        throw new Error('Failed to load post list.');
    }

    const data = await response.json();
    return data.data;
};

const init = async () => {
    try {
        const response = await authCheck();
        const data = await response.json();
        if (response.status === HTTP_NOT_AUTHORIZED) {
            window.location.href = '/html/login.html';
            return;
        }

        const profileImagePath =
        data.data.profileImagePath === null
            ? DEFAULT_PROFILE_IMAGE
            : `${getServerUrl()}${data.data.profileImagePath}`;
    
        const imgElement = document.querySelector('#headerProfileImage img');
        if (imgElement) {
            imgElement.src = profileImagePath;
        }

        const searchInputValue = document.getElementById('searchInput')?.value || '';
        console.log('Initial search input value:', searchInputValue);
        const boardList = await getBoardItem(0, 5);
        setBoardItem(boardList);
        console.log('boardList:', boardList);

        const profileName = document.getElementById('profileName');
        profileName.textContent = data.data.nickname;

        document.getElementById('searchButton').addEventListener('click', async () => {
            const query = document.getElementById('searchInput')?.value || '';
            const data = await searchInput(0, 5, query);
            document.querySelector('.boardList').innerHTML = '';
            setBoardItem(data);
        });

        addInfinityScrollEvent();
    } catch (error) {
        console.error('Initialization failed:', error);
    }
};

init();