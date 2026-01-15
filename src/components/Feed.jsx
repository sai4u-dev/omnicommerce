import axios from "axios";
import PostCard from "./PostCard";
import { useEffect, useState } from "react";


export default function Feed() {
    const [posts, setPosts] = useState([]);

    const API_URL = "http://localhost:8000/api/post";
    const getAllPosts = async () => {
        const res = await axios.get(API_URL, {
            withCredentials: true,
        });

        return res.data.data;
    };

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const data = await getAllPosts();
                setPosts(data);
            } catch (err) {
                console.error("Error fetching posts:", err);
            }
        };

        fetchPosts();
    }, []);

    console.log(posts)
    return (
        <div className="space-y-6">

            {
                posts.map((post) => (
                    <><PostCard
                        name="Siri"
                        subtitle={post.caption}
                        content={post.content}
                        isReferral
                        videoURL="https://youtu.be/yZ9BRA6chQo?list=RDGMEMPipJmhsMq3GHGrfqf4WIqA"
                    />
                        <PostCard
                            name="Siri"
                            subtitle={post.caption}
                            content={post.content}
                            isReferral
                            videoURL="https://youtu.be/yZ9BRA6chQo?list=RDGMEMPipJmhsMq3GHGrfqf4WIqA"
                        />
                        <PostCard
                            name="Siri"
                            subtitle={post.caption}
                            content={post.content}
                            isReferral
                            videoURL="https://youtu.be/yZ9BRA6chQo?list=RDGMEMPipJmhsMq3GHGrfqf4WIqA"
                        /></>
                ))
            }
        </div>
    );
}
