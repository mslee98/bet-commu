'use client'

import Image from "next/image";
import { useState } from 'react';
import Link from "next/link";

const tabs = [
    { id: "firstCharge", label: "첫충전" },
    { id: "comp", label: "콤프" },
    { id: "DeathAccount", label: "죽장" },
    { id: "rolling", label: "롤링" },
  ];

interface RankData {
    id: number;
    name: string;
    logo: string;
    banner: string;
    url: string;
    description: string;
    summary: string;
    affiliate_code: string | null;
    support: string | null;
    first_deposit_bonus: string | null;
    slot_comp: number;
    lost_amount_bonus: number | null;
    created_at: string;
    site_games: object[]; // or more specific type if you have data structure for this
    reviews: object[]; // or more specific type if you have data structure for this
}

interface RankWidgetProps {
    rankData: RankData[]; // An array of RankData
}

export default function RankWidget({rankData}: RankWidgetProps) {

  const [activeTab, setActiveTab] = useState('firstCharge');
  const [sortedRankData, setSortedRankData] = useState(rankData);

  // 소트 기준에 따라 rankData 정렬하는 함수
  const sortData = (criteria: string) => {
    const sorted = [...rankData].sort((a, b) => {
      switch (criteria) {
        case 'firstCharge':
          return (a.first_deposit_bonus || '').localeCompare(b.first_deposit_bonus || '');
        case 'comp':
          return b.slot_comp - a.slot_comp;  // 콤프가 큰 순서로 정렬
        case 'DeathAccount':
          return (a.lost_amount_bonus || 0) - (b.lost_amount_bonus || 0);  // 잃은 금액 보너스 기준
        case 'rolling':
          return (a.created_at > b.created_at) ? 1 : -1; // 생성일 기준
        default:
          return 0;
      }
    });


    setSortedRankData(sorted);
  };

  // 탭 클릭 시 소트 업데이트
  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    sortData(tabId);
  };

  return (
    <div className="mx-auto w-full bg-white dark:bg-gray-900 p-5 rounded-xl shadow-lg dark:shadow-gray-800">
      
      {/* 탭 메뉴 */}
      <div className="flex border-b border-gray-300 dark:border-gray-700">
        {tabs && tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 py-2 text-center text-lg font-semibold ${
              activeTab === tab.id
                ? "text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="mt-4">
        {sortedRankData && sortedRankData.length > 0 ? (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">

                        <Image
                            src={sortedRankData[0]?.banner ? sortedRankData[0].banner : "https://images.unsplash.com/photo-1521747116042-5a810fda9664"}
                            alt={`${sortedRankData[0]?.name} 배너 이미지`}
                            width={500}
                            height={300}
                            className="w-full h-48 md:h-64 rounded-lg object-cover"
                        />
                        <div className="flex justify-between items-align">
                            <h3 className="text-sm text-gray-700 dark:text-gray-200 font-semibold mt-2">
                                {sortedRankData[0].name}
                            </h3>
                            <div className="mt-2 flex items-center gap-2 sm:mt-0">
                                <div className="flex items-center gap-0.5">
                                    <svg className="h-4 w-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                    </svg>
                                    <svg className="h-4 w-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                    </svg>
                                    <svg className="h-4 w-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                    </svg>
                                    <svg className="h-4 w-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                    </svg>
                                    <svg className="h-4 w-4 text-yellow-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400">(4.6)</p>
                                <Link href="#" className="text-sm font-medium leading-none text-gray-900 dark:text-white">{sortedRankData[0].reviews.length} </Link>
                            </div>
                        </div>
                            
                        <div className="flex flex-wrap gap-2">
                          {sortedRankData[0]?.site_games.map((game: any, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full"
                            >
                              {game?.games.name}
                            </span>
                          ))}
                        </div>

                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {sortedRankData[0]?.summary}
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {sortedRankData.slice(1, 4).map((item: any, index: number) => (
                        <div key={index} className="flex gap-4">
                          <Image
                            src={item.banner}
                            alt={item.name}
                            width={100}
                            height={100}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                          <div className="flex flex-col flex-1"> {/* 변경: flex-1 적용 */}
                            
                            <div className="flex items-center">
                              <h3 className="text-sm text-gray-700 dark:text-gray-200 font-semibold mr-2">{item.name}</h3>
                              
                              <div className="flex flex-wrap gap-2">
                              {item.site_games.map((games:any, index:number) => (

                                <span
                                  key={index}
                                  className="px-1 py-0.5 bg-gray-500 text-white text-xs rounded-full"
                                >
                                  {games.games.name}
                                </span>
                              ))}
                              
                              </div>
                            
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex-1"> {/* 변경: flex-1 적용 */}
                              {item.summary}
                            </p>
                            <div className="mt-auto flex items-center gap-2"> {/* 변경: mt-auto 추가 */}
                              <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className="h-4 w-4 text-yellow-300"
                                    aria-hidden="true"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M13.849 4.22c-.684-1.626-3.014-1.626-3.698 0L8.397 8.387l-4.552.361c-1.775.14-2.495 2.331-1.142 3.477l3.468 2.937-1.06 4.392c-.413 1.713 1.472 3.067 2.992 2.149L12 19.35l3.897 2.354c1.52.918 3.405-.436 2.992-2.15l-1.06-4.39 3.468-2.938c1.353-1.146.633-3.336-1.142-3.477l-4.552-.36-1.754-4.17Z" />
                                  </svg>
                                ))}
                              </div>
                              <p className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400">(4.6)</p>
                              <a href="#" className="text-sm font-medium leading-none text-gray-900 dark:text-white">
                                {rankData[0].reviews.length}
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                
                </div>
                
            </>

            )
            
            : null}
        {/* {highlights[activeTab]?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="md:col-span-2">
              <Image
                src={highlights[activeTab][0].image}
                alt={highlights[activeTab][0].title}
                width={500}
                height={300}
                className="w-full h-48 md:h-64 rounded-lg object-cover"
              />
              <h3 className="text-sm text-gray-700 dark:text-gray-200 font-semibold mt-2">
                {highlights[activeTab][0].title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {highlights[activeTab][0].author} · 조회수 {highlights[activeTab][0].views} · {highlights[activeTab][0].time}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {highlights[activeTab].slice(1, 4).map((highlight: any) => (
                <div key={highlight.id} className="flex gap-4">
                  <Image
                    src={highlight.image}
                    alt={highlight.title}
                    width={100}
                    height={100}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-sm text-gray-700 dark:text-gray-200 font-semibold">{highlight.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {highlight.author} · 조회수 {highlight.views} · {highlight.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">데이터가 없습니다.</p>
        )} */}
      </div>

      {/* 더보기 버튼 */}
      <div className="text-center mt-4">
        <Link className="text-purple-600 dark:text-purple-400 font-semibold" href={"/sites"}>더보기 &gt;</Link>
      </div>
    </div>
  );
}
