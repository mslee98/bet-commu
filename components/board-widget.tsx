const samplePosts = [
  { id: 1, title: "Next.js로 SEO 최적화하기", date: "03-30", category: "SEO" },
  { id: 2, title: "Tailwind CSS를 이용한 빠른 스타일링", date: "03-29", category: "CSS" },
  { id: 3, title: "React 18의 새로운 기능", date: "03-28", category: "React" },
  { id: 4, title: "JavaScript ES2025 신기능", date: "03-27", category: "JavaScript" },
  { id: 5, title: "TypeScript로 안전한 코딩하기", date: "03-26", category: "TypeScript" },
  { id: 6, title: "GraphQL과 REST 비교", date: "03-25", category: "API" },
  { id: 7, title: "Node.js 서버 최적화 팁", date: "03-24", category: "Node.js" },
  { id: 8, title: "Python으로 데이터 분석 시작하기", date: "03-23", category: "Python" },
  { id: 9, title: "Go 언어의 장점", date: "03-22", category: "Go" },
  { id: 10, title: "SQL vs NoSQL, 언제 선택해야 할까?", date: "03-21", category: "Database" },
];

export default function BoardWidget() {
  return (
    <div className="container mx-auto px-4 py-6 w-full">
      <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">📌 게시판</h2>
      <div className="bg-white shadow-lg rounded-lg p-4 dark:bg-gray-800 dark:shadow-gray-900">
        <ul className="divide-y divide-gray-200 dark:divide-gray-600">
          {samplePosts.map((post) => (
            <li key={post.id} className="py-2 flex justify-between items-center">
              <a 
                href={`/post/${post.id}`} 
                className="text-sm text-gray-800 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 truncate w-3/4"
              >
                {post.title}
              </a>
              <span className="text-xs text-gray-500 dark:text-gray-400">{post.date}</span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md dark:bg-gray-700 dark:text-gray-300">
                {post.category}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
