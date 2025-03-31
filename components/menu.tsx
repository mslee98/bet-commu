
import Link from "next/link";

export default function Menu() {
    return (
        <div className="w-full border-b border-gray-200 dark:border-b-foreground/10">
            <nav className="max-w-5xl mx-auto p-4">
                <ul className="flex gap-6">
                    <li>
                        <Link href="/" className="text-gray-900 dark:text-white hover:underline">홈</Link>
                    </li>
                    <li>
                        <Link href="/ranking" className="text-gray-900 dark:text-white hover:underline">랭킹</Link>
                    </li>
                    <li>
                        <Link href="/board" className="text-gray-900 dark:text-white hover:underline">게시판</Link>
                    </li>
                    <li>
                        <Link href="/about" className="text-gray-900 dark:text-white hover:underline">소개</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}
