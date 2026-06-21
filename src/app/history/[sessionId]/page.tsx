import { WorkoutDetailPage } from "@/features/fitness/pages/workout-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  return <WorkoutDetailPage sessionId={decodeURIComponent(sessionId)} />;
}
