"use client"

import ReviewList from "@/components/review-list";
import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface SiteGame {
    game_id: number;
    games: {
        id: number;
        name: string;
        icon: string;
    }[]; // <-- games가 배열로 반환되므로 수정
}

interface Review {
    id: number;
    site_nickname: string;
    comment: string;
    review_ratings: {
        rating: number;
    }[];
}

interface SiteInfoType {
    id: number;
    name: string;
    logo: string;
    banner: string;
    url: string;
    description: string;
    affiliate_code: string;
    support: string;
    first_deposit_bonus: string;
    slot_comp: string;
    lost_amount_bonus: string;
    recommend: number;
    disapproval: number;
    created_at: string;
    site_games: SiteGame[];
    reviews: Review[];
}

export default function SiteInfo() {

    const [reviewCriteria, setReviewCriteria] = useState<{id:number, name: string}[] | null>(null)

    const [siteInfo, setSiteInfo] = useState<SiteInfoType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const params = useParams();
    const siteSlug = params.sitename as string;

    const match = siteSlug.match(/-(\d+)$/);
    const siteId = match ? match[1] : null; // "5"

    const [totalAvg, setTotalAvg] = useState<number>(0);
    const [stars, setStars] = useState({ full: 0, decimal: 0, empty: 5 });


    useEffect(() => {
        const fetchSiteInfo = async () => {
            const supabase = createClient();
            
            


            const { data: criteriaData, error: criteriaError} = await supabase
                .from('review_criteria')
                .select('id, name')
            
            console.log(criteriaData)

            if(criteriaError) {

            } else {
                setReviewCriteria(criteriaData)
            }
            
            
            const { data, error } = await supabase
                .from('sites')
                .select(`
                    id,
                    name,
                    logo,
                    banner,
                    url,
                    description,
                    affiliate_code,
                    support,
                    first_deposit_bonus,
                    slot_comp,
                    lost_amount_bonus,
                    recommend,
                    disapproval,
                    created_at,
                    site_games (
                        game_id,
                        games (
                            id,
                            name,
                            icon
                        )
                    ),
                    reviews (
                        id,
                        site_nickname,
                        comment,
                        review_ratings (
                            rating
                        )
                    )
                `)
                .eq("id", siteId) // 특정 사이트 ID 필터링 (필요하면 수정)
                .single();
            
            if (error) {
                setError(error);
            } else {
                setSiteInfo(data);

                if (data?.reviews?.length > 0) {
                    // 1️⃣ 각 리뷰별 평균 평점 계산 (빈 배열 방지)
                    const reviewAverages = data.reviews.map((review) => {
                        if (!review.review_ratings || review.review_ratings.length === 0) {
                            return 0; // 평점이 없으면 0으로 처리
                        }
                        const totalRating = review.review_ratings.reduce((sum, rating) => sum + rating.rating, 0);
                        return totalRating / review.review_ratings.length;
                    });
    
                    // 2️⃣ 전체 리뷰 평균 평점 계산
                    const totalAvg = reviewAverages.length > 0 
                        ? reviewAverages.reduce((sum, avg) => sum + avg, 0) / reviewAverages.length
                        : 0; // 리뷰가 없으면 0으로 처리
    
                    setTotalAvg(parseFloat(totalAvg.toFixed(1)));

                    // 3️⃣ 별 개수 계산 (한 번에 상태 업데이트)
                    const fullStars = Math.floor(totalAvg);
                    const decimalPart = totalAvg % 1;
                    const emptyStars = 5 - fullStars - (decimalPart > 0 ? 1 : 0);

                    setStars({ full: fullStars, decimal: decimalPart, empty: emptyStars });
                }
                
            }
            setLoading(false);
        };

        fetchSiteInfo();
    }, [siteSlug]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    console.log(siteInfo)

    return (
        <>
            <div className="w-full mx-auto 2xl:px-0">
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
                    <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
                        <img className="w-full dark:hidden" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front.svg" alt="" />
                        <img className="w-full hidden dark:block" src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg" alt="" />
                    </div>

                    <div className="mt-6 sm:mt-8 lg:mt-0">
                        <h1
                            className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white"
                        >
                            {siteInfo?.name}
                        </h1>
                    <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
                        <p
                        className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white"
                        >
                        $1,249.99
                        </p>

                        <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: stars?.full }).map((_, index) => (
                                <svg
                                    key={`full-${index}`}
                                    className="w-4 h-4 text-yellow-300"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
                                </svg>
                            ))}

                            {/* 부분적으로 채워진 별 */}
                            {stars.decimal > 0 && (
                            <svg
                                key="partial"
                                className="w-4 h-4 text-yellow-300"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <defs>
                                <linearGradient id="partialStarGradient">
                                    <stop offset={`${stars.decimal * 100}%`} stopColor="currentColor"/>
                                    <stop offset={`${stars.decimal * 100}%`} stopColor="#cbcfd5"/>
                                </linearGradient>
                                </defs>
                                <path fill="url(#partialStarGradient)" d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
                            </svg>
                            )}

                            {/* 빈 별 */}
                            {Array.from({ length: stars.empty }).map((_, index) => (
                            <svg
                                key={`empty-${index}`}
                                className="w-4 h-4 text-gray-300"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
                            </svg>
                            ))}
                        </div>
                        <p className="text-sm font-medium leading-none text-gray-500">
                            ({totalAvg})
                        </p>
                        <a
                            href="#"
                            className="text-sm font-medium leading-none text-gray-900 hover:no-underline dark:text-white"
                        >
                            {siteInfo?.reviews.length}
                        </a>
                        </div>
                    </div>

                    <div className="mt-6 sm:gap-4 sm:items-center sm:flex sm:mt-8">
                        <a
                        href="#"
                        title=""
                        className="flex items-center justify-center py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                        role="button"
                        >
                        <svg
                            className="w-5 h-5 -ms-2 me-2"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                            />
                        </svg>
                        Add to favorites
                        </a>

                        <a
                        href="#"
                        title=""
                        className="text-white mt-4 sm:mt-0 bg-blue-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800 flex items-center justify-center"
                        role="button"
                        >
                        <svg
                            className="w-5 h-5 -ms-2 me-2"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 4h1.5L8 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm.75-3H7.5M11 7H6.312M17 4v6m-3-3h6"
                            />
                        </svg>

                        Add to cart
                        </a>
                    </div>

                    <hr className="my-6 md:my-8 border-gray-200 dark:border-gray-800" />

                    <p className="mb-6 text-gray-500 dark:text-gray-400">
                        {siteInfo?.description}
                    </p>
                    </div>
                </div>
            </div>

            <section className="bg-white dark:bg-gray-900">
                <div className="max-w-screen-xl px-4 py-8 mx-auto text-center lg:py-16 lg:px-6">
                    <dl className="grid max-w-screen-md gap-8 mx-auto text-gray-900 sm:grid-cols-3 dark:text-white">
                        <div className="flex flex-col items-center justify-center">
                            <dt className="mb-2 text-3xl md:text-4xl font-extrabold">73M+</dt>
                            <dd className="font-light text-gray-500 dark:text-gray-400">developers</dd>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <dt className="mb-2 text-3xl md:text-4xl font-extrabold">1B+</dt>
                            <dd className="font-light text-gray-500 dark:text-gray-400">contributors</dd>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <dt className="mb-2 text-3xl md:text-4xl font-extrabold">4M+</dt>
                            <dd className="font-light text-gray-500 dark:text-gray-400">organizations</dd>
                        </div>
                    </dl>
                </div>
            </section>

            {/* siteid, sitename 프랍스로 줘야함 그래야 insert문 가능 */}
            <ReviewList siteId={siteInfo?.id} siteName={siteInfo?.name} reviewCriteria={reviewCriteria}/>
        </>
    )
}