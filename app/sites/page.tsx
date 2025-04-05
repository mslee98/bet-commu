import ListContent from "@/components/list-content";
import ListHeader from "@/components/list-header";

import { createClient } from "@/utils/supabase/server";


export default async function SiteList() {

    const supabase = await createClient();

    const { data: rankData, error } = await supabase
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
        `);

    return (
        <div className="w-full 2xl:px-0">
            <ListHeader/>

            <div className="mb-4 grid grid-cols-1 gap-2 md:mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {rankData?.map((item) => (
                    <ListContent key={item.id} item={item} />
                ))}
            </div>


        </div>
    );
}
