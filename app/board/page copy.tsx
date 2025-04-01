// app/board/page.tsx (SSR 방식, Server Component)

import { createClient } from "@/utils/supabase/server"; // 서버 측 Supabase 클라이언트
import Link from "next/link";

// 카테고리 타입
interface Category {
    id: string;
    name: string;
}

// 게시글 타입
interface Article {
    id: string;
    title: string;
    content: string;
    category_id: string | null;
    created_at: string;
    updated_at: string;
    category: { id: string; name: string } | null;
}

// 서버 측에서 데이터를 받아오기 위한 함수
const fetchBoardData = async () => {
    const supabase = await createClient();

    // 카테고리 가져오기
    const { data: categoryData, error: categoryError } = await supabase.from("categories").select();
    if (categoryError) throw new Error(categoryError.message);

    // 게시글 가져오기 (카테고리 포함)
    const { data: postData, error: postError } = await supabase
        .from("articles")
        .select(`
            id, title, content, category_id, created_at, updated_at,
            category:categories ( id, name )
        `);

    if (postError) throw new Error(postError.message);

    return { posts: postData, categories: categoryData };
};

// 서버 측에서 데이터를 받아와서 반환 (Server Component)
export default async function Board() {
    const { posts, categories } = await fetchBoardData(); // 서버에서 데이터 가져오기

    return (
        <div className="container mx-auto px-4 py-8 w-full">
            <h2 className="text-2xl font-bold mb-6">게시판</h2>

            {/* 카테고리 탭 */}
            <div className="flex gap-4 mb-6 overflow-x-auto">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className="px-4 py-2 rounded-full text-sm font-medium transition bg-gray-200"
                    >
                        {category.name}
                    </button>
                ))}
            </div>

            {/* 게시글 목록 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <Link key={post.id} href={`/post/${post.id}`} className="block">
                        <div className="bg-white shadow-lg rounded-xl overflow-hidden transition hover:scale-105 hover:shadow-xl">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
                                <p className="mt-2 text-gray-600 line-clamp-2">{post.content}</p>
                                <div className="mt-3 flex justify-between text-xs text-gray-500">
                                    <span>{new Date(post.updated_at).toLocaleDateString()}</span>
                                    {/* <span className="bg-gray-100 px-3 py-1 rounded-full">{post.category?.name || "미분류"}</span> */}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
