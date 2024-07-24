import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({feedType, username, userId}) => {

	const getPostEndpoint = () => { 
		// return the endpoint based on the feedType
		switch (feedType) {
			case 'forYou':
				return '/api/posts/get-posts';
			case 'following':
				return '/api/posts/following-posts';
			case "posts":
				return `/api/posts/user-posts/${username}`;
			case "likes":
				return `/api/posts/liked-posts/${userId}`;
			default:
				return '/api/posts/get-posts';
	}
};

	const POST_ENDPOINT = getPostEndpoint();

	const {data:POSTS, isLoading, refetch, isRefetching} = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			// eslint-disable-next-line no-useless-catch
			try {
				const res = await fetch(POST_ENDPOINT);
				const data = await res.json();
				
				return data;
			} catch (error) {
				throw error;
			}
		},
	});

	useEffect(() => {
		refetch();
	}, [feedType, refetch, username]);

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{(!isLoading && !isRefetching && POSTS?.length === 0) && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && !isRefetching && POSTS && (
				<div>
					{POSTS.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;