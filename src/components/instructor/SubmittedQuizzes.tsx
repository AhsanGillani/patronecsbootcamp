import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Attempt = { id: string; created_at: string; quiz_id: string; student_id: string; score: number | null; passed: boolean | null };
type ProfileRow = { user_id: string; full_name: string };
type QuizRow = { id: string; title: string; lesson_id: string };
type LessonRow = { id: string; title: string; course_id: string };
type CourseRow = { id: string; title: string };

type AttemptWithStudent = Attempt & { studentName: string };
type Tree = Record<string, Record<string, Record<string, AttemptWithStudent[]>>>;

type AnswerRow = {
  id: string;
  question_id: string;
  answer_text: string | null;
  selected_index: number | null;
  is_correct: boolean | null;
  requires_review: boolean | null;
};

type QuestionRow = {
  id: string;
  question: string;
  options: string[];
};

type AnswerWithQuestion = AnswerRow & { question?: QuestionRow };

type QuizFull = { id: string; title: string; passing_score: number };

export function SubmittedQuizzes() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [studentNameById, setStudentNameById] = useState<Record<string, string>>({});
  const [quizById, setQuizById] = useState<Record<string, { title: string; lesson_id: string }>>({});
  const [lessonById, setLessonById] = useState<Record<string, { title: string; course_id: string }>>({});
  const [courseById, setCourseById] = useState<Record<string, { title: string }>>({});
  const [openAttemptId, setOpenAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerWithQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [gradeOpen, setGradeOpen] = useState(false);
  const [gradingAttempt, setGradingAttempt] = useState<Attempt | null>(null);
  const [quizMeta, setQuizMeta] = useState<QuizFull | null>(null);
  const [qaMarks, setQaMarks] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // 1) attempts
        const { data: atts } = await supabase
          .from('quiz_attempts')
          .select('id, created_at, quiz_id, student_id, score, passed')
          .order('created_at', { ascending: false })
          .limit(100);
        const a = (atts as Attempt[]) || [];
        setAttempts(a);

        // 2) lookups
        const studentIds: string[] = Array.from(new Set(a.map(x => x.student_id)));
        const quizIds: string[] = Array.from(new Set(a.map(x => x.quiz_id)));
        const { data: profsData } = studentIds.length
          ? await supabase.from('profiles').select('user_id, full_name').in('user_id', studentIds)
          : { data: [] as ProfileRow[] };
        const { data: quizzesData } = quizIds.length
          ? await supabase.from('quizzes').select('id, title, lesson_id').in('id', quizIds)
          : { data: [] as QuizRow[] };
        const lessonIds: string[] = Array.from(new Set((quizzesData || []).map((q) => (q as QuizRow).lesson_id)));
        const { data: lessonsData } = lessonIds.length
          ? await supabase.from('lessons').select('id, title, course_id').in('id', lessonIds)
          : { data: [] as LessonRow[] };
        const courseIds: string[] = Array.from(new Set((lessonsData || []).map((l) => (l as LessonRow).course_id)));
        const { data: coursesData } = courseIds.length
          ? await supabase.from('courses').select('id, title').in('id', courseIds)
          : { data: [] as CourseRow[] };

        const nameMap: Record<string, string> = {};
        ((profsData || []) as ProfileRow[]).forEach((p) => { nameMap[p.user_id] = p.full_name; });
        setStudentNameById(nameMap);

        const quizMap: Record<string, { title: string; lesson_id: string }> = {};
        ((quizzesData || []) as QuizRow[]).forEach((q) => { quizMap[q.id] = { title: q.title, lesson_id: q.lesson_id }; });
        setQuizById(quizMap);

        const lessonMap: Record<string, { title: string; course_id: string }> = {};
        ((lessonsData || []) as LessonRow[]).forEach((l) => { lessonMap[l.id] = { title: l.title, course_id: l.course_id }; });
        setLessonById(lessonMap);

        const courseMap: Record<string, { title: string }> = {};
        ((coursesData || []) as CourseRow[]).forEach((c) => { courseMap[c.id] = { title: c.title }; });
        setCourseById(courseMap);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadAnswers = async (attemptId: string) => {
    // answers table may not be in generated types; use a minimal typed facade with unknown payloads
    const { data: answersUnknown } = await (supabase as unknown as {
      from: (t: string) => {
        select: (sel: string) => {
          eq: (col: string, v: string) => Promise<{ data: unknown }>
        }
      }
    })
      .from('quiz_attempt_answers')
      .select('id, question_id, answer_text, selected_index, is_correct, requires_review')
      .eq('quiz_attempt_id', attemptId);

    const typedAnswers: AnswerRow[] = (answersUnknown as AnswerRow[] | null) || [];
    const questionIds: string[] = Array.from(new Set(typedAnswers.map((a) => a.question_id)));
    if (questionIds.length === 0) {
      setAnswers([]);
      return;
    }

    const { data: questionsData, error: qErr } = await supabase
      .from('quiz_questions')
      .select('id, question, options')
      .in('id', questionIds);
    if (qErr) {
      setAnswers(typedAnswers);
      return;
    }

    const parsedQuestions: QuestionRow[] = ((questionsData as unknown[]) || []).map((qUnknown) => {
      const base = qUnknown as { id: string; question: string; options: unknown };
      let opts: unknown = base.options;
      if (!Array.isArray(opts)) {
        try { opts = JSON.parse(opts as string); } catch { opts = []; }
      }
      const optionsArray: string[] = Array.isArray(opts) ? (opts as string[]) : [];
      return {
        id: base.id,
        question: base.question,
        options: optionsArray,
      };
    });

    const qMap = new Map<string, QuestionRow>();
    parsedQuestions.forEach((q) => qMap.set(q.id, q));
    const enriched: AnswerWithQuestion[] = typedAnswers.map((a) => ({ ...a, question: qMap.get(a.question_id) }));
    setAnswers(enriched);
  };

  const fetchQuizMeta = async (quizId: string) => {
    const { data } = await supabase
      .from('quizzes')
      .select('id, title, passing_score')
      .eq('id', quizId)
      .single();
    setQuizMeta((data as QuizFull) || null);
  };

  const openGradeDialog = async (att: Attempt) => {
    setGradingAttempt(att);
    await loadAnswers(att.id);
    await fetchQuizMeta(att.quiz_id);
    const init: Record<string, boolean> = {};
    (answers || []).forEach(a => { if (a.answer_text !== null && a.answer_text !== undefined) init[a.id] = false; });
    setQaMarks(init);
    setGradeOpen(true);
  };

  const totalQuestions = useMemo(() => answers.length, [answers]);
  const autoCorrect = useMemo(() => answers.filter(a => a.answer_text === null && a.is_correct).length, [answers]);
  const qaDecisions = useMemo(() => Object.values(qaMarks).filter(Boolean).length, [qaMarks]);
  const computedScore = useMemo(() => {
    const correct = autoCorrect + qaDecisions;
    if (totalQuestions === 0) return 0;
    return Math.round((correct / totalQuestions) * 100);
  }, [autoCorrect, qaDecisions, totalQuestions]);

  const handleToggleQa = (answerId: string) => {
    setQaMarks(prev => ({ ...prev, [answerId]: !prev[answerId] }));
  };

  const finalizeGrade = async () => {
    if (!gradingAttempt || !quizMeta) return;
    setSaving(true);
    try {
      const passed = computedScore >= quizMeta.passing_score;
      await supabase
        .from('quiz_attempts')
        .update({ score: computedScore, passed })
        .eq('id', gradingAttempt.id);

      const lessonId = quizById[gradingAttempt.quiz_id]?.lesson_id;
      if (passed && lessonId) {
        // Note: onConflict typed field not in generated types; cast to unknown then specific minimal shape
        await (supabase.from('lesson_progress') as unknown as {
          upsert: (val: { lesson_id: string; student_id: string; is_completed: boolean }, opts: { onConflict: string }) => Promise<unknown>
        }).upsert({ lesson_id: lessonId, student_id: gradingAttempt.student_id, is_completed: true }, { onConflict: 'lesson_id,student_id' });
      }

      const courseId = lessonId ? lessonById[lessonId]?.course_id : undefined;
      const path = courseId ? `/course-learning/${courseId}` : '/student?tab=learning';
      await (supabase.from('notifications') as unknown as {
        insert: (val: { user_id: string; title: string; type: string; message: string }) => Promise<unknown>
      }).insert({
        user_id: gradingAttempt.student_id,
        title: 'Quiz graded',
        type: 'quiz_graded',
        message: JSON.stringify({ text: `Your quiz "${quizMeta.title}" has been graded. Score: ${computedScore}%`, path })
      });

      setGradeOpen(false);
      setGradingAttempt(null);
      setAnswers([]);
      setQuizMeta(null);

      const { data: atts } = await supabase
        .from('quiz_attempts')
        .select('id, created_at, quiz_id, student_id, score, passed')
        .order('created_at', { ascending: false })
        .limit(100);
      setAttempts((atts as Attempt[]) || []);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading submissions...</div>;

  // Group by course > lesson > quiz > student
  const tree: Tree = {};
  attempts.forEach((att) => {
    const quiz = quizById[att.quiz_id];
    const lesson = quiz ? lessonById[quiz.lesson_id] : undefined;
    const course = lesson ? courseById[lesson.course_id] : undefined;
    const courseKey = course?.title || 'Unknown Course';
    const lessonKey = lesson?.title || 'Unknown Lesson';
    const quizKey = quiz?.title || 'Quiz';
    const studentName = studentNameById[att.student_id] || 'Student';
    tree[courseKey] = tree[courseKey] || {};
    tree[courseKey][lessonKey] = tree[courseKey][lessonKey] || {};
    tree[courseKey][lessonKey][quizKey] = tree[courseKey][lessonKey][quizKey] || [];
    tree[courseKey][lessonKey][quizKey].push({ ...att, studentName });
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Submitted Quizzes</h2>
      {Object.keys(tree).length === 0 ? (
        <div className="text-muted-foreground">No submissions yet.</div>
      ) : (
        Object.entries(tree).map(([courseTitle, lessons]) => (
          <details key={courseTitle} open className="border rounded">
            <summary className="p-3 font-semibold flex items-center gap-2">
              <Badge variant="secondary">Course</Badge>
              <span>{courseTitle}</span>
            </summary>
            <div className="p-3 space-y-2">
              {Object.entries(lessons).map(([lessonTitle, quizzes]) => (
                <details key={lessonTitle} className="border rounded">
                  <summary className="p-2 flex items-center gap-2">
                    <Badge variant="outline">Lesson</Badge>
                    <span>{lessonTitle}</span>
                  </summary>
                  <div className="p-3 space-y-2">
                    {Object.entries(quizzes).map(([quizTitle, atts]) => (
                      <details key={quizTitle} className="border rounded">
                        <summary className="p-2">{quizTitle}</summary>
                        <div className="p-3 space-y-2">
                          {atts.map((s) => (
                            <Card key={s.id}>
                              <CardHeader className="flex items-center justify-between">
                                <CardTitle className="text-base">
                                  {s.studentName}
                                </CardTitle>
                                <Badge variant={s.passed ? 'default' : 'outline'}>
                                  {s.passed ? 'passed/graded' : 'pending/failed'}
                                </Badge>
                              </CardHeader>
                              <CardContent className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">Submitted on {new Date(s.created_at).toLocaleString()}</div>
                                <Button size="sm" onClick={async () => { setOpenAttemptId(s.id === openAttemptId ? null : s.id); if (s.id !== openAttemptId) await loadAnswers(s.id); }}>
                                  {openAttemptId === s.id ? 'Close' : 'Review'}
                                </Button>
                              </CardContent>
                              {openAttemptId === s.id && (
                                <div className="p-4 border-t text-sm space-y-2">
                                  {answers.length === 0 ? (
                                    <div className="text-muted-foreground">No saved answers to review.</div>
                                  ) : (
                                    answers.map((ans) => {
                                      const q = ans.question;
                                      const isQa = ans.answer_text !== null && ans.answer_text !== undefined;
                                      const selectedText = (q && ans.selected_index !== null && ans.selected_index !== undefined && q.options[ans.selected_index])
                                        ? q.options[ans.selected_index]
                                        : undefined;
                                      return (
                                        <div key={ans.id} className="p-3 rounded border">
                                          <div className="font-medium">{q?.question || `Question ${ans.question_id}`}</div>
                                          {isQa ? (
                                            <div className="mt-1 space-y-2">
                                              <Label className="text-xs">Student Answer</Label>
                                              <Textarea value={ans.answer_text || ''} readOnly />
                                            </div>
                                          ) : (
                                            <div className="mt-1">
                                              <div>Selected: {selectedText ?? (ans.selected_index ?? '-')}</div>
                                              <div className="text-xs text-muted-foreground">{ans.is_correct ? 'Correct' : 'Incorrect'}</div>
                                            </div>
                                          )}
                                          {ans.requires_review ? (
                                            <div className="flex items-center justify-between mt-2">
                                              <div className="text-xs text-amber-600">Requires Review</div>
                                              {isQa && (
                                                <Button type="button" variant={qaMarks[ans.id] ? 'default' : 'outline'} size="sm" onClick={() => handleToggleQa(ans.id)}>
                                                  {qaMarks[ans.id] ? 'Marked Correct' : 'Mark Correct'}
                                                </Button>
                                              )}
                                            </div>
                                          ) : null}
                                        </div>
                                      );
                                    })
                                  )}
                                </div>
                              )}
                            </Card>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </details>
        ))
      )}

      <Dialog open={gradeOpen} onOpenChange={setGradeOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Grade Quiz{quizMeta ? ` • ${quizMeta.title}` : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {answers.length === 0 ? (
              <div className="text-muted-foreground">No answers found.</div>
            ) : (
              <div className="space-y-3">
                {answers.map(a => {
                  const q = a.question;
                  const isQa = a.answer_text !== null && a.answer_text !== undefined;
                  return (
                    <div key={a.id} className="p-3 rounded border">
                      <div className="font-medium">{q?.question || 'Question'}</div>
                      {isQa ? (
                        <div className="mt-1 space-y-2">
                          <Label className="text-xs">Student Answer</Label>
                          <Textarea value={a.answer_text || ''} readOnly />
                          <div className="flex items-center gap-2">
                            <Button type="button" variant={qaMarks[a.id] ? 'default' : 'outline'} size="sm" onClick={() => handleToggleQa(a.id)}>
                              {qaMarks[a.id] ? 'Mark as Correct' : 'Mark Correct'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <div>Selected: {q && a.selected_index !== null && a.selected_index !== undefined ? q.options[a.selected_index] : a.selected_index ?? '-'}</div>
                          <div className="text-xs text-muted-foreground">{a.is_correct ? 'Correct' : 'Incorrect'}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3">
              <div className="text-sm text-muted-foreground">Computed Score: <span className="font-medium">{computedScore}%</span>{quizMeta ? ` • Passing: ${quizMeta.passing_score}%` : ''}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setGradeOpen(false)} disabled={saving}>Cancel</Button>
                <Button onClick={finalizeGrade} disabled={saving || !gradingAttempt}>Save Grade</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SubmittedQuizzes;


