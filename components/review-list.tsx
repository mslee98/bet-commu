'use client'

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from "@/utils/supabase/client";
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import StarRating from './review-star';

interface ReviewListProps {
    siteId?: number;
    siteName?: string;
    reviewCriteria?: { id: number; name: string }[] | null;
    reviewData?: any;
    onReviewSubmitted: Function
  }


  const getStarCounts = (ratings: any[] = []) => {
    if (ratings.length === 0) {
      return { full: 0, decimal: 0, empty: 5 };
    }
  
    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    const avg = total / ratings.length;
    const roundedAvg = parseFloat(avg.toFixed(1));
  
    const full = Math.floor(roundedAvg);
    const decimal = roundedAvg % 1;
    const empty = 5 - full - (decimal > 0 ? 1 : 0);
  
    return { full, decimal, empty };
  };

  const StarIcons = ({ full, decimal, empty }: { full: number, decimal: number, empty: number }) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, index) => (
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
                <stop offset={`${decimal * 100}%`} stopColor="currentColor"/>
                <stop offset={`${decimal * 100}%`} stopColor="#cbcfd5"/>
            </linearGradient>
            </defs>
            <path fill="url(#partialStarGradient)" d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z"/>
        </svg>
        {Array.from({ length: empty }).map((_, index) => (
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
  );

export default function ReviewList({siteId, siteName, reviewCriteria, reviewData, onReviewSubmitted}: ReviewListProps) { 


    

    return (
        <>
            
                   

                    {/* <div className="my-6 gap-8 sm:flex sm:items-start md:my-8">
                        <div className="shrink-0 space-y-4">
                            <p className="text-2xl font-semibold leading-none text-gray-900 dark:text-white">4.65 / 5</p>
                            <button onClick={() => setIsWriteModalOpen(true)} type="button" data-modal-target="review-modal" data-modal-toggle="review-modal" className="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">리뷰 작성하기</button>
                        </div>

                        <div className="mt-6 min-w-0 flex-1 space-y-3 sm:mt-0">
                            <div className="flex items-center gap-2">
                            <p className="w-2 shrink-0 text-start text-sm font-medium leading-none text-gray-900 dark:text-white">5</p>
                            <svg className="h-4 w-4 shrink-0 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                            </svg>
                            <div className="h-1.5 w-full sm:w-80 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div className="h-1.5 rounded-full bg-yellow-300" style={{width: "20%"}}></div>
                            </div>
                            <a href="#" className="w-8 shrink-0 text-right text-sm font-medium leading-none text-primary-700 hover:underline dark:text-primary-500 sm:w-auto sm:text-left">239 <span className="hidden sm:inline">reviews</span></a>
                            </div>

                            <div className="flex items-center gap-2">
                            <p className="w-2 shrink-0 text-start text-sm font-medium leading-none text-gray-900 dark:text-white">4</p>
                                <svg className="h-4 w-4 shrink-0 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                </svg>
                            <div className="h-1.5 w-full sm:w-80 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div className="h-1.5 rounded-full bg-yellow-300" style={{width: "60%"}}></div>
                            </div>
                            <a href="#" className="w-8 shrink-0 text-right text-sm font-medium leading-none text-primary-700 hover:underline dark:text-primary-500 sm:w-auto sm:text-left">432 <span className="hidden sm:inline">reviews</span></a>
                            </div>

                            <div className="flex items-center gap-2">
                            <p className="w-2 shrink-0 text-start text-sm font-medium leading-none text-gray-900 dark:text-white">3</p>
                            <svg className="h-4 w-4 shrink-0 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                            </svg>
                            <div className="h-1.5 w-full sm:w-80 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div className="h-1.5 rounded-full bg-yellow-300" style={{width: "15%"}}></div>
                            </div>
                            <a href="#" className="w-8 shrink-0 text-right text-sm font-medium leading-none text-primary-700 hover:underline dark:text-primary-500 sm:w-auto sm:text-left">53 <span className="hidden sm:inline">reviews</span></a>
                            </div>

                            <div className="flex items-center gap-2">
                            <p className="w-2 shrink-0 text-start text-sm font-medium leading-none text-gray-900 dark:text-white">2</p>
                            <svg className="h-4 w-4 shrink-0 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                            </svg>
                            <div className="h-1.5 w-full sm:w-80 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div className="h-1.5 rounded-full bg-yellow-300" style={{width: "5%"}}></div>
                            </div>
                            <a href="#" className="w-8 shrink-0 text-right text-sm font-medium leading-none text-primary-700 hover:underline dark:text-primary-500 sm:w-auto sm:text-left">32 <span className="hidden sm:inline">reviews</span></a>
                            </div>

                            <div className="flex items-center gap-2">
                            <p className="w-2 shrink-0 text-start text-sm font-medium leading-none text-gray-900 dark:text-white">1</p>
                            <svg className="h-4 w-4 shrink-0 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                            </svg>
                            <div className="h-1.5 w-full sm:w-80 rounded-full bg-gray-200 dark:bg-gray-700">
                                <div className="h-1.5 rounded-full bg-yellow-300" style={{width: "0%"}}></div>
                            </div>
                            <a href="#" className="w-8 shrink-0 text-right text-sm font-medium leading-none text-primary-700 hover:underline dark:text-primary-500 sm:w-auto sm:text-left">13 <span className="hidden sm:inline">reviews</span></a>
                            </div>
                        </div>
                    </div> */}

                    <div className="mt-6 divide-y divide-gray-200 dark:divide-gray-700">

                        {reviewData && reviewData.map((review:any) => {

                            return (
                                <div key={review.id} className="gap-3 pb-6 sm:flex sm:items-start">
                                    <div className="shrink-0 space-y-2 sm:w-48 md:w-72">
                                        {/* <StarIcons full={full} decimal={decimal} empty={empty} /> */}
                                        <StarRating ratings={review.review_ratings}/>

                                        <div className="space-y-0.5">
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">{review.site_nickname}</p>
                                            <p className="text-sm font-normal text-gray-500 dark:text-gray-400">{dayjs(review.created_at).format('YYYY-MM-DD HH:mm')}</p>
                                        </div>

                                        <div className="inline-flex items-center gap-1">
                                            <svg className="h-5 w-5 text-primary-700 dark:text-primary-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                            <path
                                                fillRule="evenodd"
                                                d="M12 2c-.791 0-1.55.314-2.11.874l-.893.893a.985.985 0 0 1-.696.288H7.04A2.984 2.984 0 0 0 4.055 7.04v1.262a.986.986 0 0 1-.288.696l-.893.893a2.984 2.984 0 0 0 0 4.22l.893.893a.985.985 0 0 1 .288.696v1.262a2.984 2.984 0 0 0 2.984 2.984h1.262c.261 0 .512.104.696.288l.893.893a2.984 2.984 0 0 0 4.22 0l.893-.893a.985.985 0 0 1 .696-.288h1.262a2.984 2.984 0 0 0 2.984-2.984V15.7c0-.261.104-.512.288-.696l.893-.893a2.984 2.984 0 0 0 0-4.22l-.893-.893a.985.985 0 0 1-.288-.696V7.04a2.984 2.984 0 0 0-2.984-2.984h-1.262a.985.985 0 0 1-.696-.288l-.893-.893A2.984 2.984 0 0 0 12 2Zm3.683 7.73a1 1 0 1 0-1.414-1.413l-4.253 4.253-1.277-1.277a1 1 0 0 0-1.415 1.414l1.985 1.984a1 1 0 0 0 1.414 0l4.96-4.96Z"
                                                clipRule="evenodd"
                                            />
                                            </svg>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">Verified purchase</p>
                                        </div>
                                    </div>

                                        <div className="mt-4 min-w-0 flex-1 space-y-4 sm:mt-0">
                                            <p className="text-base font-normal text-gray-500 dark:text-gray-400">{review.comment}</p>

                                            <div className="flex items-center gap-4">
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Was it helpful to you?</p>
                                                <div className="flex items-center">
                                                    <input id="reviews-radio-1" type="radio" value="" name="reviews-radio" className="h-4 w-4 border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600" />
                                                    <label htmlFor="reviews-radio-1" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"> Yes: 3 </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input id="reviews-radio-2" type="radio" value="" name="reviews-radio" className="h-4 w-4 border-gray-300 bg-gray-100 text-primary-600 focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-primary-600" />
                                                    <label htmlFor="reviews-radio-2" className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">No: 0 </label>
                                                </div>
                                            </div>
                                            
                                        </div>
                                </div>

                            )

                        })}

                    </div>

                    <div className="mt-6 text-center">
                        <button type="button" className="mb-2 me-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700">View more reviews</button>
                    </div>

                
                
                
        </>
    )
}