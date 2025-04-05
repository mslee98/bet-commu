"use client"

import ReviewList from "@/components/review-list";
import StarRating from "@/components/review-star";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

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
    // const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const params = useParams();
    const siteSlug = params.sitename as string;

    const match = siteSlug.match(/-(\d+)$/);
    const siteId = match ? match[1] : null; // "5"

    const [totalAvg, setTotalAvg] = useState<number>(0);
    const [stars, setStars] = useState({ full: 0, decimal: 0, empty: 5 });

    const [ratingCounts, setRatingCounts] = useState<{ star: number; count: number, percentage: number }[]>([]); // 별점별 개수



    const fetchSiteInfo = useCallback(async () => {
        const supabase = createClient();
      
        // setLoading(true); // 데이터 새로 불러올 때 로딩 표시 (선택)
        setError(null);
      
        const { data: criteriaData, error: criteriaError } = await supabase
          .from('review_criteria')
          .select('id, name');
      
        if (criteriaError) {
          setError(criteriaError);
        } else {
          setReviewCriteria(criteriaData);
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
              created_at,
              review_ratings (
                rating
              )
            )
          `)
          .eq("id", siteId)
          .single();
      
        if (error) {
          setError(error);
        } else {
          setSiteInfo(data);
      
          // 리뷰 평균 계산
          if (data?.reviews?.length > 0) {
            const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            const reviewAverages = data.reviews.map((review) => {

              if (!review.review_ratings || review.review_ratings.length === 0) {
                return 0;
              }

              review.review_ratings.forEach((node) => {
                const rating = Math.round(node.rating); // 1~5 중 하나라고 가정

                if (rating >= 1 && rating <= 5) {
                  ratingMap[rating] += 1;
                }
              });


              const totalRating = review.review_ratings.reduce((sum, rating) => sum + rating.rating, 0);
              return totalRating / review.review_ratings.length;
            });
      
            const totalAvg = reviewAverages.length > 0 
              ? reviewAverages.reduce((sum, avg) => sum + avg, 0) / reviewAverages.length
              : 0;
      
            setTotalAvg(parseFloat(totalAvg.toFixed(1)));
      
            const fullStars = Math.floor(totalAvg);
            const decimalPart = totalAvg % 1;
            const emptyStars = 5 - fullStars - (decimalPart > 0 ? 1 : 0);
      
            setStars({ full: fullStars, decimal: decimalPart, empty: emptyStars });

             // ✅ 전체 개수 계산
            const totalCount = Object.values(ratingMap).reduce((sum, count) => sum + count, 0);

            // ✅ 별점 + 비율 함께 계산
            const ratingCountsArray = Object.entries(ratingMap)
                .map(([star, count]) => ({
                star: parseInt(star),
                count,
                percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
                }))
                .sort((a, b) => b.star - a.star); // 5 ~ 1 정렬

            setRatingCounts(ratingCountsArray);
            
            console.log(ratingCounts)
           
          }
        }
      
        // setLoading(false);
      }, []);

      useEffect(() => {
        fetchSiteInfo()
      }, [])

      const [ratings, setRatings] = useState<{ [key: number]: number }>({});
    const [reviewText, setReviewText] = useState("");

    const handleRatingChange = (criteriaId: number, rating: number) => {
        setRatings((prev) => ({ ...prev, [criteriaId]: rating }));
      };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!reviewText.trim()) {
            alert("리뷰 내용을 입력해야 합니다.");
            return;
        }

        try {

            const supabase = createClient();

            // 현재 로그인한 사용자 정보 가져오기
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                alert("로그인이 필요합니다.");
                return;
            }

            // 1. 리뷰 테이블 (reviews)에 데이터 삽입
            const { data: reviewData, error: reviewError } = await supabase
            .from("reviews")
            .insert([
                {
                    site_id: siteId,
                    user_id: user.id,
                    comment: reviewText,
                    site_nickname: user.user_metadata.nickname
                },
            ])
            .select("id")
            .single(); // 삽입 후 review_id 가져오기

            if (reviewError) {
                throw reviewError;
            }

            const reviewId = reviewData.id;

            // 2. 개별 평가 항목 (review_ratings) 저장
            const ratingEntries = Object.entries(ratings).map(([criteriaId, rating]) => ({
                review_id: reviewId,
                criteria_id: parseInt(criteriaId),
                rating: rating,
            }));

            const { error: ratingError } = await supabase
                .from("review_ratings")
                .insert(ratingEntries);

            if (ratingError) {
                throw ratingError;
            }

            toast.success("리뷰가 성공적으로 등록되었습니다!");
            setIsWriteModalOpen(false);
            fetchSiteInfo();

        } catch (error) {
            console.error("리뷰 작성 오류:", error);
            alert("리뷰 작성 중 오류가 발생했습니다.");
        }
    };

    // useEffect(() => {
    //     const fetchSiteInfo = async () => {
    //         const supabase = createClient();
            

    //         const { data: criteriaData, error: criteriaError} = await supabase
    //             .from('review_criteria')
    //             .select('id, name')

    //         if(criteriaError) {

    //         } else {
    //             setReviewCriteria(criteriaData)
    //         }
            
            
    //         const { data, error } = await supabase
    //             .from('sites')
    //             .select(`
    //                 id,
    //                 name,
    //                 logo,
    //                 banner,
    //                 url,
    //                 description,
    //                 affiliate_code,
    //                 support,
    //                 first_deposit_bonus,
    //                 slot_comp,
    //                 lost_amount_bonus,
    //                 recommend,
    //                 disapproval,
    //                 created_at,
    //                 site_games (
    //                     game_id,
    //                     games (
    //                         id,
    //                         name,
    //                         icon
    //                     )
    //                 ),
    //                 reviews (
    //                     id,
    //                     site_nickname,
    //                     comment,
    //                     created_at,
    //                     review_ratings (
    //                         rating
    //                     )
    //                 )
    //             `)
    //             .eq("id", siteId) // 특정 사이트 ID 필터링 (필요하면 수정)
    //             .single();
            
    //         if (error) {
    //             setError(error);
    //         } else {
    //             setSiteInfo(data);

    //             if (data?.reviews?.length > 0) {
    //                 // 1️⃣ 각 리뷰별 평균 평점 계산 (빈 배열 방지)
    //                 const reviewAverages = data.reviews.map((review) => {
    //                     if (!review.review_ratings || review.review_ratings.length === 0) {
    //                         return 0; // 평점이 없으면 0으로 처리
    //                     }
    //                     const totalRating = review.review_ratings.reduce((sum, rating) => sum + rating.rating, 0);
    //                     return totalRating / review.review_ratings.length;
    //                 });
    
    //                 // 2️⃣ 전체 리뷰 평균 평점 계산
    //                 const totalAvg = reviewAverages.length > 0 
    //                     ? reviewAverages.reduce((sum, avg) => sum + avg, 0) / reviewAverages.length
    //                     : 0; // 리뷰가 없으면 0으로 처리
    
    //                 setTotalAvg(parseFloat(totalAvg.toFixed(1)));

    //                 // 3️⃣ 별 개수 계산 (한 번에 상태 업데이트)
    //                 const fullStars = Math.floor(totalAvg);
    //                 const decimalPart = totalAvg % 1;
    //                 const emptyStars = 5 - fullStars - (decimalPart > 0 ? 1 : 0);

    //                 setStars({ full: fullStars, decimal: decimalPart, empty: emptyStars });
    //             }
                
    //         }
    //         setLoading(false);
    //     };

    //     fetchSiteInfo();
    // }, [siteSlug]);

    const [isWriteModalOpen, setIsWriteModalOpen ] = useState(false);

    // if (loading) return <p>Loading...</p>;
    if (!siteInfo) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>;


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
            <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
                <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
                    <div className="flex flex-col  gap-2">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Reviews</h2>

                        <div className="mt-2 flex items-center gap-2 sm:mt-0">
                            <div className="flex items-center gap-0.5">
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
                            <p className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400">({totalAvg})</p>
                            <a href="#" className="text-sm font-medium leading-none text-gray-900 underline hover:no-underline dark:text-white"> {siteInfo.reviews.length} Reviews </a>
                        </div>

                        <div className="my-6 gap-8 sm:flex sm:items-start md:my-8">
                            <div className="shrink-0 space-y-4">
                                <p className="text-2xl font-semibold leading-none text-gray-900 dark:text-white">{totalAvg} / 5</p>
                                <button onClick={() => setIsWriteModalOpen(true)} type="button" data-modal-target="review-modal" data-modal-toggle="review-modal" className="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">리뷰 작성하기</button>
                            </div>

                            <div className="mt-6 min-w-0 flex-1 space-y-3 sm:mt-0">
                                <div className="flex items-center gap-2">
                                <p className="w-2 shrink-0 text-start text-sm font-medium leading-none text-gray-900 dark:text-white">5</p>
                                <svg className="h-4 w-4 shrink-0 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                </svg>
                                <div className="h-1.5 w-full sm:w-80 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div className="h-1.5 rounded-full bg-yellow-300" style={{width: `${ratingCounts[0]?.percentage}%`}}></div>
                                </div>
                                <a href="#" className="w-8 shrink-0 text-right text-sm font-medium leading-none text-primary-700 hover:underline dark:text-primary-500 sm:w-auto sm:text-left">{ratingCounts[0].count} <span className="hidden sm:inline">reviews</span></a>
                                </div>

                                <div className="flex items-center gap-2">
                                <p className="w-2 shrink-0 text-start text-sm font-medium leading-none text-gray-900 dark:text-white">4</p>
                                    <svg className="h-4 w-4 shrink-0 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                    </svg>
                                <div className="h-1.5 w-full sm:w-80 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div className="h-1.5 rounded-full bg-yellow-300" style={{width:`${ratingCounts[1]?.percentage}%`}}></div>
                                </div>
                                <a href="#" className="w-8 shrink-0 text-right text-sm font-medium leading-none text-primary-700 hover:underline dark:text-primary-500 sm:w-auto sm:text-left">{ratingCounts[1].count} <span className="hidden sm:inline">reviews</span></a>
                                </div>

                                <div className="flex items-center gap-2">
                                <p className="w-2 shrink-0 text-start text-sm font-medium leading-none text-gray-900 dark:text-white">3</p>
                                <svg className="h-4 w-4 shrink-0 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                </svg>
                                <div className="h-1.5 w-full sm:w-80 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div className="h-1.5 rounded-full bg-yellow-300" style={{width: `${ratingCounts[2]?.percentage}%`}}></div>
                                </div>
                                <a href="#" className="w-8 shrink-0 text-right text-sm font-medium leading-none text-primary-700 hover:underline dark:text-primary-500 sm:w-auto sm:text-left">{ratingCounts[2].count} <span className="hidden sm:inline">reviews</span></a>
                                </div>

                                <div className="flex items-center gap-2">
                                <p className="w-2 shrink-0 text-start text-sm font-medium leading-none text-gray-900 dark:text-white">2</p>
                                <svg className="h-4 w-4 shrink-0 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                </svg>
                                <div className="h-1.5 w-full sm:w-80 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div className="h-1.5 rounded-full bg-yellow-300" style={{width: `${ratingCounts[3]?.percentage}%`}}></div>
                                </div>
                                <a href="#" className="w-8 shrink-0 text-right text-sm font-medium leading-none text-primary-700 hover:underline dark:text-primary-500 sm:w-auto sm:text-left">{ratingCounts[3].count} <span className="hidden sm:inline">reviews</span></a>
                                </div>

                                <div className="flex items-center gap-2">
                                <p className="w-2 shrink-0 text-start text-sm font-medium leading-none text-gray-900 dark:text-white">1</p>
                                <svg className="h-4 w-4 shrink-0 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                </svg>
                                <div className="h-1.5 w-full sm:w-80 rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div className="h-1.5 rounded-full bg-yellow-300" style={{width: `${ratingCounts[4]?.percentage}%`}}></div>
                                </div>
                                <a href="#" className="w-8 shrink-0 text-right text-sm font-medium leading-none text-primary-700 hover:underline dark:text-primary-500 sm:w-auto sm:text-left">{ratingCounts[4].count} <span className="hidden sm:inline">reviews</span></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <ReviewList onReviewSubmitted={fetchSiteInfo} siteId={siteInfo?.id} siteName={siteInfo?.name} reviewCriteria={reviewCriteria} reviewData={siteInfo?.reviews}/>

            </section>
            {
                    isWriteModalOpen &&
                    <div id="review-modal" tabIndex={-1} aria-hidden="true" className="fixed left-0 right-0 top-0 z-50 h-[calc(100%-1rem)] max-h-full w-full flex items-center justify-center overflow-y-auto overflow-x-hidden md:inset-0 antialiased">
                        <div className="relative max-h-full w-full max-w-2xl p-4">
                            {/* <!-- Modal content --> */}
                            <div className="relative rounded-lg bg-white shadow dark:bg-gray-800">
                            {/* <!-- Modal header --> */}
                            <div className="flex items-center justify-between rounded-t border-b border-gray-200 p-4 dark:border-gray-700 md:p-5">
                                <div>
                                <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">리뷰 작성</h3>
                                <Link href="#" className="font-medium text-primary-700 hover:underline dark:text-primary-500">{siteInfo?.name}</Link>
                                </div>
                                
                                
                                <button onClick={() => setIsWriteModalOpen(false)} type="button" className="absolute right-5 top-5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="review-modal">
                                    <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                    <span className="sr-only">닫기</span>
                                </button>



                            </div>
                            {/* <!-- Modal body --> */}
                            <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                                <div className="mb-4 grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <div className="flex items-center">
                                    <div className="grid grid-cols-2 gap-4">
                                        {reviewCriteria?.map((criteria) => (
                                            <div key={criteria.id} className="col-span-2">
                                            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                                {criteria.name}
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div className="grid grid-cols-5 gap-2">
                                                {Array.from({ length: 5 }, (_, index) => (
                                                    <svg
                                                    key={index}
                                                    onClick={() => handleRatingChange(criteria.id, index + 1)}
                                                    className={`h-6 w-6 cursor-pointer ${
                                                        index < (ratings[criteria.id] || 0) ? "text-yellow-300" : "text-gray-300 dark:text-gray-500"
                                                    }`}
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="currentColor"
                                                    viewBox="0 0 22 20"
                                                    >
                                                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                                    </svg>
                                                ))}
                                                </div>
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                                {ratings[criteria.id] || 0}
                                                </span>
                                            </div>
                                            </div>
                                        ))}
                                        </div>

                                    {/* {Array.from({ length: 5 }, (_, index) => (
                                        <svg
                                        key={index}
                                        onClick={() => setRating(index + 1)} // 클릭하면 해당 인덱스까지 별 채우기
                                        className={`h-6 w-6 cursor-pointer ${
                                            index < rating ? "text-yellow-300" : "text-gray-300 dark:text-gray-500"
                                        }`}
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 22 20"
                                        >
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                                        </svg>
                                    ))} */}
                                    {/* <span className="ms-2 text-lg font-bold text-gray-900 dark:text-white">{rating} out of 5</span> */}
                                    
                                    </div>
                                </div>

                                {/* <div className="col-span-2">
                                    <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Review title</label>
                                    <input type="text" name="title" id="title" className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" required={true} />
                                </div> */}
                                
                                <div className="col-span-2">
                                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">리뷰 내용</label>
                                    <textarea id="description" rows={6} onChange={(e) => setReviewText(e.target.value)} className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-primary-500 dark:focus:ring-primary-500" required={true}></textarea>
                                    <p className="ms-auto text-xs text-gray-500 dark:text-gray-400">Problems with the product or delivery? <a href="#" className="text-primary-600 hover:underline dark:text-primary-500">Send a report</a>.</p>
                                </div>

                                {/* <div className="col-span-2">
                                    <p className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">Add real photos of the product to help other customers <span className="text-gray-500 dark:text-gray-400">(Optional)</span></p>
                                    <div className="flex w-full items-center justify-center">
                                    <label htmlFor="dropzone-file" className="dark:hover:bg-bray-800 flex h-52 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                        <svg className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                        </div>
                                        <input id="dropzone-file" type="file" className="hidden" />
                                    </label>
                                    </div>
                                </div> */}

                                <div className="col-span-2">
                                    <div className="flex items-center">
                                    <input id="review-checkbox" type="checkbox" value="" className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600" />
                                    <label htmlFor="review-checkbox" className="ms-2 text-sm font-medium text-gray-500 dark:text-gray-400">이 리뷰를 게시함으로써 귀하는 이용 약관에 동의하게 됩니다.</label>
                                    </div>
                                </div>
                                </div>
                                <div className="border-t border-gray-200 pt-4 dark:border-gray-700 md:pt-5">
                                    <button type="submit" className="me-2 inline-flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">리뷰 작성</button>
                                    <button onClick={() => setIsWriteModalOpen(false)} type="button" data-modal-toggle="review-modal" className="me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">취소</button>
                                </div>
                            </form>
                            </div>
                        </div>
                    </div>
                }
        </>
    )
}