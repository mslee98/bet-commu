import Hero from "@/components/hero";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

import { createClient } from "@/utils/supabase/server";

import BoardWidget from "@/components/board-widget";
import RankWidget from "@/components/rank-widget";

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
            summary,
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
      <div className="flex flex-col md:flex-row">
        <BoardWidget/>
        <BoardWidget/>
      </div>
      <div className="hidden md:flex h-screen w-full flex-col items-center justify-center rounded-lg p-6 dark:bg-slate-900">
        <div className="grid h-full w-full grid-cols-3 grid-rows-6 gap-4">
          <div className="col-span-2 row-span-3 rounded-3xl bg-orange-400"></div>
          <div className="row-span-4 rounded-3xl bg-orange-400"></div>
          <div className="row-span-3 rounded-3xl bg-orange-400"></div>
          <div className="row-span-3 rounded-3xl bg-orange-400"></div>
          <div className="row-span-2 rounded-3xl bg-orange-400"></div>
        </div>
      </div>



      {/* <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Next steps</h2>
        {hasEnvVars ? <SignUpUserSteps /> : <ConnectSupabaseSteps />}
      </main> */}
    </>
  );
}
