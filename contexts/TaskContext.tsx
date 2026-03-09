/**
 * TaskContext — 앱 전역 상태 관리
 * - 오늘의 할일, 스트릭, 프리미엄 상태
 */
import React, { createContext, useContext, ReactNode } from 'react';
import { useDatabaseReady } from '@/hooks/use-database';
import { useTodayTask } from '@/hooks/use-today-task';
import { useStreak } from '@/hooks/use-streak';
import { usePremium } from '@/hooks/use-premium';

type TaskContextType = {
  // DB
  dbReady: boolean;
  // 오늘 할일
  task: ReturnType<typeof useTodayTask>['task'];
  taskLoading: boolean;
  updateTitle: ReturnType<typeof useTodayTask>['updateTitle'];
  updateNote: ReturnType<typeof useTodayTask>['updateNote'];
  toggleComplete: ReturnType<typeof useTodayTask>['toggleComplete'];
  reloadTask: ReturnType<typeof useTodayTask>['reload'];
  // 스트릭
  streak: number;
  // 프리미엄
  isPremium: boolean;
  plan: ReturnType<typeof usePremium>['plan'];
  activatePremium: ReturnType<typeof usePremium>['activate'];
  deactivatePremium: ReturnType<typeof usePremium>['deactivate'];
};

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const dbReady = useDatabaseReady();
  const {
    task,
    loading: taskLoading,
    updateTitle,
    updateNote,
    toggleComplete,
    reload: reloadTask,
  } = useTodayTask(dbReady);

  const todayCompleted = task?.completed === 1;
  const streak = useStreak(dbReady, todayCompleted);

  const {
    isPremium,
    plan,
    activate: activatePremium,
    deactivate: deactivatePremium,
  } = usePremium();

  return (
    <TaskContext.Provider
      value={{
        dbReady,
        task,
        taskLoading,
        updateTitle,
        updateNote,
        toggleComplete,
        reloadTask,
        streak,
        isPremium,
        plan,
        activatePremium,
        deactivatePremium,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTaskContext(): TaskContextType {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext는 TaskProvider 내부에서만 사용 가능합니다');
  return ctx;
}
