import type {
  Exercise,
  TrainingTemplate,
  WorkoutPlan,
  WorkoutSession,
} from "./types";

type CatalogGroup = {
  category: string;
  sections: {
    name: string;
    exercises: Array<string | { id: string; name: string }>;
  }[];
};

const catalogGroups: CatalogGroup[] = [
  {
    category: "胸部",
    sections: [
      {
        name: "杠铃类",
        exercises: [
          { id: "barbell-bench-press", name: "杠铃平板卧推" },
          "杠铃上斜卧推",
          "杠铃下斜卧推",
        ],
      },
      {
        name: "哑铃类",
        exercises: [
          "哑铃平板卧推",
          { id: "incline-dumbbell-press", name: "哑铃上斜卧推" },
          "哑铃下斜卧推",
          "哑铃平板飞鸟",
          "哑铃上斜飞鸟",
          "哑铃下斜飞鸟",
        ],
      },
      {
        name: "绳索类",
        exercises: [
          "高位绳索十字夹胸",
          "中位绳索夹胸",
          "低位绳索夹胸（上胸）",
        ],
      },
      {
        name: "固定器械类",
        exercises: [
          "坐姿器械推胸（平推/上斜推）",
          "蝴蝶机夹胸",
          "史密斯机卧推（平板/上斜）",
        ],
      },
      {
        name: "自重类",
        exercises: [
          "标准俯卧撑",
          "宽距俯卧撑",
          "钻石俯卧撑",
          "上斜/下斜俯卧撑",
          "胸部双杠臂屈伸（身体前倾）",
        ],
      },
    ],
  },
  {
    category: "肩部",
    sections: [
      {
        name: "推举类",
        exercises: [
          { id: "shoulder-press", name: "杠铃站姿推举" },
          "杠铃坐姿推举",
          "哑铃坐姿推举",
          "哑铃阿诺德推举",
          "史密斯机颈前推举",
          "器械坐姿推肩",
        ],
      },
      {
        name: "平举类",
        exercises: [
          "哑铃站姿侧平举",
          "单臂哑铃侧平举（扶墙或靠斜板）",
          "绳索侧平举",
          "蝴蝶机反向飞鸟（调整座椅也可练中束）",
          "哑铃肩部推举（中束主导）",
        ],
      },
      {
        name: "前平举类",
        exercises: ["哑铃前平举", "杠铃前平举", "绳索前平举", "健身球前平举"],
      },
      {
        name: "俯身飞鸟类",
        exercises: [
          "哑铃俯身飞鸟",
          "蝴蝶机反向飞鸟",
          "绳索面拉",
          "绳索俯身反向飞鸟",
          "T杠俯身提拉（宽握）",
        ],
      },
    ],
  },
  {
    category: "背部",
    sections: [
      {
        name: "垂直拉类",
        exercises: [
          "宽握引体向上",
          "窄握反手引体向上",
          { id: "lat-pulldown", name: "宽握高位下拉" },
          "反握高位下拉",
          "对握（V柄）高位下拉",
          "直臂下拉",
        ],
      },
      {
        name: "水平拉类",
        exercises: [
          "杠铃俯身划船",
          "单臂哑铃划船",
          "T杠划船（双手/单手）",
          { id: "seated-row", name: "坐姿绳索划船（窄握/宽握）" },
          "器械坐姿划船",
          "史密斯机俯身划船",
        ],
      },
      {
        name: "下背部",
        exercises: ["杠铃硬拉（传统硬拉/相扑硬拉）", "山羊挺身/罗马椅挺身", "早上好"],
      },
    ],
  },
  {
    category: "腿部",
    sections: [
      {
        name: "股四头肌",
        exercises: [
          { id: "barbell-squat", name: "杠铃深蹲（颈后高杠/低杠）" },
          "杠铃前蹲",
          "哑铃深蹲",
          "腿举（倒蹬机）（宽距/窄距）",
          "哈克深蹲",
          "腿屈伸",
          "保加利亚分腿蹲",
          "行走箭步蹲（杠铃/哑铃）",
          "史密斯机深蹲",
        ],
      },
      {
        name: "腘绳肌",
        exercises: [
          { id: "romanian-deadlift", name: "罗马尼亚硬拉（杠铃/哑铃）" },
          "直腿硬拉",
          "俯卧腿弯举",
          "坐姿腿弯举",
          "北欧腿弯举（自重）",
        ],
      },
      {
        name: "臀部",
        exercises: ["杠铃臀推", "哑铃臀推", "绳索髋外展", "蛙泵"],
      },
      {
        name: "小腿",
        exercises: ["站姿提踵（杠铃/哑铃/器械）", "坐姿提踵", "驴式提踵"],
      },
    ],
  },
  {
    category: "手臂",
    sections: [
      {
        name: "二头肌 · 杠铃类",
        exercises: ["杠铃弯举（直杆/曲杆）", "反握杠铃弯举（练肱肌）"],
      },
      {
        name: "二头肌 · 哑铃类",
        exercises: [
          "哑铃交替弯举",
          "哑铃锤式弯举",
          "哑铃集中弯举",
          "哑铃托臂弯举",
          "俯身哑铃集中弯举",
        ],
      },
      {
        name: "二头肌 · 绳索与器械类",
        exercises: [
          "绳索站姿弯举",
          "低位绳索弯举",
          "仰卧绳索弯举",
          "牧师椅弯举（杠铃/哑铃/EZ杆）",
          "器械托臂弯举",
        ],
      },
      {
        name: "三头肌 · 杠铃/哑铃类",
        exercises: ["仰卧臂屈伸", "哑铃颈后臂屈伸（双手/单手）", "窄距杠铃卧推", "窄距俯卧撑"],
      },
      {
        name: "三头肌 · 绳索类",
        exercises: ["绳索下压（直杆/V柄/绳索）", "绳索反握下压", "绳索颈后臂屈伸", "高位绳索臂屈伸"],
      },
      {
        name: "三头肌 · 自重与其他",
        exercises: ["三头肌双杠臂屈伸（身体直立）", "凳上反屈伸"],
      },
    ],
  },
  {
    category: "腹部",
    sections: [
      {
        name: "上腹部",
        exercises: ["卷腹", "绳索卷腹", "健身球卷腹", "反向卷腹"],
      },
      {
        name: "下腹部",
        exercises: ["悬垂举腿", "仰卧抬腿", "仰卧剪刀腿", "仰卧两头起"],
      },
      {
        name: "侧腹/腹斜肌",
        exercises: ["俄罗斯挺身", "侧卧卷腹", "绳索侧屈", "单侧平板支撑转体"],
      },
      {
        name: "核心深层",
        exercises: [{ id: "plank", name: "平板支撑" }, "侧支撑", "健腹轮", "死虫式"],
      },
    ],
  },
];

export const mockExercises: Exercise[] = catalogGroups.flatMap((group) =>
  group.sections.flatMap((section) =>
    section.exercises.map((exercise) => {
      const normalized =
        typeof exercise === "string"
          ? { id: createExerciseId(group.category, section.name, exercise), name: exercise }
          : exercise;

      return {
        id: normalized.id,
        name: normalized.name,
        category: group.category,
        equipment: section.name,
        source: "built-in",
        targetMuscles: [section.name],
      };
    }),
  ),
);

function createExerciseId(category: string, section: string, name: string) {
  const source = `${category}-${section}-${name}`;
  let hash = 0;

  Array.from(source).forEach((char) => {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  });

  return `exercise-${hash.toString(36)}`;
}

function getExerciseIdByName(name: string) {
  const exercise = mockExercises.find((item) => item.name === name);

  if (!exercise) {
    throw new Error(`Missing exercise in mock catalog: ${name}`);
  }

  return exercise.id;
}

export const trainingTemplates: TrainingTemplate[] = [
  {
    id: "template-chest-shoulder-triceps",
    name: "胸肩三头",
    focus: "胸部、肩部、肱三头",
    exercises: [
      { exerciseId: getExerciseIdByName("杠铃平板卧推"), targetReps: 8 },
      { exerciseId: getExerciseIdByName("哑铃上斜卧推"), targetReps: 10 },
      { exerciseId: getExerciseIdByName("杠铃站姿推举"), targetReps: 8 },
      { exerciseId: getExerciseIdByName("哑铃站姿侧平举"), targetReps: 12 },
      { exerciseId: getExerciseIdByName("绳索下压（直杆/V柄/绳索）"), targetReps: 12 },
      { exerciseId: getExerciseIdByName("仰卧臂屈伸"), targetReps: 10 },
    ],
  },
  {
    id: "template-back-biceps",
    name: "背部二头",
    focus: "背部宽度、背部厚度、肱二头",
    exercises: [
      { exerciseId: getExerciseIdByName("宽握高位下拉"), targetReps: 10 },
      { exerciseId: getExerciseIdByName("坐姿绳索划船（窄握/宽握）"), targetReps: 10 },
      { exerciseId: getExerciseIdByName("杠铃俯身划船"), targetReps: 8 },
      { exerciseId: getExerciseIdByName("直臂下拉"), targetReps: 12 },
      { exerciseId: getExerciseIdByName("杠铃弯举（直杆/曲杆）"), targetReps: 10 },
      { exerciseId: getExerciseIdByName("哑铃锤式弯举"), targetReps: 12 },
    ],
  },
  {
    id: "template-leg-day",
    name: "腿部训练",
    focus: "股四头肌、腘绳肌、臀部、小腿",
    exercises: [
      { exerciseId: getExerciseIdByName("杠铃深蹲（颈后高杠/低杠）"), targetReps: 8 },
      { exerciseId: getExerciseIdByName("腿举（倒蹬机）（宽距/窄距）"), targetReps: 10 },
      { exerciseId: getExerciseIdByName("罗马尼亚硬拉（杠铃/哑铃）"), targetReps: 8 },
      { exerciseId: getExerciseIdByName("腿屈伸"), targetReps: 12 },
      { exerciseId: getExerciseIdByName("俯卧腿弯举"), targetReps: 12 },
      { exerciseId: getExerciseIdByName("站姿提踵（杠铃/哑铃/器械）"), targetReps: 15 },
    ],
  },
  {
    id: "template-shoulder-arms",
    name: "肩臂训练",
    focus: "肩部中后束、肱二头、肱三头",
    exercises: [
      { exerciseId: getExerciseIdByName("哑铃坐姿推举"), targetReps: 8 },
      { exerciseId: getExerciseIdByName("哑铃站姿侧平举"), targetReps: 12 },
      { exerciseId: getExerciseIdByName("绳索面拉"), targetReps: 12 },
      { exerciseId: getExerciseIdByName("杠铃弯举（直杆/曲杆）"), targetReps: 10 },
      { exerciseId: getExerciseIdByName("哑铃锤式弯举"), targetReps: 12 },
      { exerciseId: getExerciseIdByName("绳索下压（直杆/V柄/绳索）"), targetReps: 12 },
    ],
  },
];

export const mockPlans: WorkoutPlan[] = [
  {
    id: "push-day",
    name: "推力训练",
    focus: "胸、肩、肱三头",
    scheduledDays: [1, 4],
    exercises: [
      {
        exerciseId: "barbell-bench-press",
        targetSets: 4,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseId: "incline-dumbbell-press",
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseId: "shoulder-press",
        targetSets: 3,
        targetReps: 8,
        restSeconds: 120,
      },
    ],
  },
  {
    id: "pull-day",
    name: "拉力训练",
    focus: "背、肱二头",
    scheduledDays: [2, 5],
    exercises: [
      {
        exerciseId: "lat-pulldown",
        targetSets: 4,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseId: "seated-row",
        targetSets: 4,
        targetReps: 10,
        restSeconds: 90,
      },
    ],
  },
  {
    id: "leg-day",
    name: "下肢训练",
    focus: "腿、臀、核心",
    scheduledDays: [3, 6],
    exercises: [
      {
        exerciseId: "barbell-squat",
        targetSets: 5,
        targetReps: 5,
        restSeconds: 150,
      },
      {
        exerciseId: "romanian-deadlift",
        targetSets: 3,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseId: "plank",
        targetSets: 3,
        targetReps: 45,
        restSeconds: 60,
      },
    ],
  },
];

export const mockSessions: WorkoutSession[] = [
  {
    id: "session-20260610",
    planId: "push-day",
    planName: "推力训练",
    note: "胸部主练，卧推动作稳定，最后一组速度略慢。",
    date: "2026-06-10",
    startedAt: "2026-06-10T10:00:00.000Z",
    completedAt: "2026-06-10T11:05:00.000Z",
    status: "completed",
    totalSets: 6,
    totalVolumeKg: 3240,
    entries: [
      {
        exerciseId: "barbell-bench-press",
        sets: [
          { setNumber: 1, weightKg: 70, reps: 8, note: "热身后第一组", completed: true },
          { setNumber: 2, weightKg: 75, reps: 8, note: "", completed: true },
          { setNumber: 3, weightKg: 77.5, reps: 6, note: "最后一次略慢", completed: true },
        ],
      },
      {
        exerciseId: "incline-dumbbell-press",
        sets: [
          { setNumber: 1, weightKg: 24, reps: 10, note: "", completed: true },
          { setNumber: 2, weightKg: 26, reps: 8, note: "", completed: true },
          { setNumber: 3, weightKg: 26, reps: 8, note: "稳定", completed: true },
        ],
      },
    ],
  },
  {
    id: "session-20260613",
    planId: "push-day",
    planName: "推力训练",
    note: "状态不错，肩推核心保持更好。",
    date: "2026-06-13",
    startedAt: "2026-06-13T09:30:00.000Z",
    completedAt: "2026-06-13T10:36:00.000Z",
    status: "completed",
    totalSets: 6,
    totalVolumeKg: 3457.5,
    entries: [
      {
        exerciseId: "barbell-bench-press",
        sets: [
          { setNumber: 1, weightKg: 72.5, reps: 8, note: "", completed: true },
          { setNumber: 2, weightKg: 77.5, reps: 8, note: "状态不错", completed: true },
          { setNumber: 3, weightKg: 80, reps: 5, note: "", completed: true },
        ],
      },
      {
        exerciseId: "shoulder-press",
        sets: [
          { setNumber: 1, weightKg: 42.5, reps: 8, note: "", completed: true },
          { setNumber: 2, weightKg: 45, reps: 6, note: "", completed: true },
          { setNumber: 3, weightKg: 45, reps: 6, note: "核心收紧", completed: true },
        ],
      },
    ],
  },
  {
    id: "session-20260615",
    planId: "pull-day",
    planName: "拉力训练",
    note: "背部发力清楚，划船控制节奏。",
    date: "2026-06-15",
    startedAt: "2026-06-15T12:00:00.000Z",
    completedAt: "2026-06-15T12:55:00.000Z",
    status: "completed",
    totalSets: 4,
    totalVolumeKg: 2900,
    entries: [
      {
        exerciseId: "lat-pulldown",
        sets: [
          { setNumber: 1, weightKg: 55, reps: 10, note: "", completed: true },
          { setNumber: 2, weightKg: 60, reps: 9, note: "", completed: true },
        ],
      },
      {
        exerciseId: "seated-row",
        sets: [
          { setNumber: 1, weightKg: 65, reps: 10, note: "", completed: true },
          { setNumber: 2, weightKg: 70, reps: 8, note: "动作控制好", completed: true },
        ],
      },
    ],
  },
];

export const initialFitnessState = {
  exercises: mockExercises,
  plans: mockPlans,
  sessions: mockSessions,
};
