import { getAssessments } from "@/actions/interview";
import StatsCards from "./-components/stats-cards";
import PerformanceChart from "./-components/performance-chart";
import QuizList from "./-components/quiz-list";


const InterviewPage = async() => {
  const assessments = await getAssessments();

  return (
    <div>
      <h1 className="text-6xl font-bold gradient-title mb-5">
         Interview Preparation
      </h1>

      <div className="space-y-6">
        <StatsCards assessments={assessments} />
        <PerformanceChart assessments={assessments} />
        <QuizList assessments={assessments} />
      </div>

    </div>
  );
};

export default InterviewPage