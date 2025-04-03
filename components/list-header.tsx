'use client';

import { useState } from 'react';

export default function ListHeader() {

    const [isDropdownOpen, setDropdownOpen] = useState(false);
    

    return (
        <div className="mb-4 flex items-end justify-between space-y-4 sm:space-y-0 md:mb-8">
                <div>
                    <h2 className="mt-3 text-xl font-semibold text-gray-900 sm:text-2xl">Sites</h2>
                </div>

                {/* Filters & Sort Buttons */}
                <div className="flex items-center space-x-4">
                    {/* Filters Button */}
                    <button type="button" className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 sm:w-auto">
                        <svg className="-ms-0.5 me-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z" />
                        </svg>
                        Filters
                    </button>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 sm:w-auto"
                            onClick={() => setDropdownOpen(!isDropdownOpen)}
                        >
                            <svg className="-ms-0.5 me-2 h-4 w-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M7 4l3 3M7 4 4 7m9-3h6l-6 6h6m-6.5 10 3.5-7 3.5 7M14 18h4" />
                            </svg>
                            Sort
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 z-50 mt-2 w-40 divide-y divide-gray-100 rounded-lg bg-white shadow-lg">
                                <ul className="p-2 text-sm font-medium text-gray-500">
                                    {["The most popular", "Newest", "Increasing price", "Decreasing price", "No. reviews", "Discount %"].map((option) => (
                                        <li key={option}>
                                            <a href="#" className="group inline-flex w-full items-center rounded-md px-3 py-2 hover:bg-gray-100 hover:text-gray-900">
                                                {option}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
    )
}