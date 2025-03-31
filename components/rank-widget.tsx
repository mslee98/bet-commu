'use client'

import Image from "next/image";
import { useState } from "react";

const tabs = [
    { id: "firstInput", label: "첫충" },
    { id: "comp", label: "콤프" },
    { id: "rolling", label: "롤링" },
  ];

const highlights: any = {
    firstInput: [
    {
      id: 1,
      title: "다저스는 어떤 플레이로 10월 가을야구 진출을 확정했을까",
      author: "구시아",
      views: "26만 회",
      time: "4시간 전",
      image: "https://images.unsplash.com/photo-1521747116042-5a810fda9664",
    },
    {
      id: 2,
      title: "61홈런 페이스라는 저지, 대체 얼마나 잘하고 있는 걸까?",
      author: "댕댕",
      views: "25만",
      time: "8시간 전",
      image: "https://images.unsplash.com/photo-1521747116042-5a810fda9664",
    },
    {
      id: 3,
      title: "0의 균형을 먼저 깨트리는 야구 천재 KT 강백호",
      author: "움댕",
      views: "24만",
      time: "8시간 전",
      image: "https://images.unsplash.com/photo-1521747116042-5a810fda9664",
    },
    {
      id: 4,
      title: "리그 페이즈 2차전 중 가장 ‘치열했던 경기’",
      author: "거리",
      views: "25만",
      time: "8시간 전",
      image: "https://images.unsplash.com/photo-1521747116042-5a810fda9664",
    },
  ],
  comp: [],
  rolling: [],
};

export default function HighlightTabs() {
  const [activeTab, setActiveTab] = useState("firstInput");

  return (
    <div className="mx-auto w-full bg-white dark:bg-gray-900 p-5 rounded-xl shadow-lg dark:shadow-gray-800">
      {/* 탭 메뉴 */}
      <div className="flex border-b border-gray-300 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex-1 py-2 text-center text-lg font-semibold ${
              activeTab === tab.id
                ? "text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <div className="mt-4">
        {highlights[activeTab]?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1등 아이템 */}
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

            {/* 2~4등 아이템 */}
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
        )}
      </div>

      {/* 더보기 버튼 */}
      <div className="text-center mt-4">
        <button className="text-purple-600 dark:text-purple-400 font-semibold">더보기 &gt;</button>
      </div>
    </div>
  );
}
