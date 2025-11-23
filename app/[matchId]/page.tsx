import MatchStatisticsClient from './MatchStatisticsClient';

export async function generateStaticParams() {
  return [{ matchId: '1' }];
}

export default function Page({ params }: { params: Promise<{ matchId: string }> }) {
  return <MatchStatisticsClient params={params} />;
}