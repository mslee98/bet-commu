import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

import { createClient } from "@/utils/supabase/server";

import BoardWidget from "@/components/board-widget";
import RankWidget from "@/components/rank-widget";

interface RankData {
  id: number;
  name: string;
  logo: string;
  banner: string;
  url: string;
  description: string;
  affiliate_code: string | null;
  support: string | null;
  first_deposit_bonus: string | null;
  slot_comp: number;
  lost_amount_bonus: number | null;
  created_at: string;
  site_games: object[]; // or more specific type if you have data structure for this
  reviews: object[]; // or more specific type if you have data structure for this
}

export default async function Home() {

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
  
  if (error) {
    return <div>Error loading data</div>;
  }

  return (
    <>
      <RankWidget rankData={rankData}/>
      <div className="flex">
        <BoardWidget/>
        <BoardWidget/>
      </div>
      {/* <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Next steps</h2>
        {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
      </main> */}
    </>
  );
}
