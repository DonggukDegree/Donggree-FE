/**
 * [울타리치기] 판 발급·표시 상태·되돌리기·힌트·완성 처리
 * 판은 메모리에만 두고 화면을 나가면 사라진다. 서버는 판을 저장하지 않고 암호화된 토큰만 돌려준다.
 * 회원은 완성 시 서버가 정답·시간을 확인해 통계와 하루 1회 10P를 쌓고, 비회원은 화면에서만 완성을 보여준다.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { postFenceCompletion, postFenceHint, postFencePuzzle } from '@/apis/fence/fence';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import useFenceMember from '@/hooks/fence/useFenceMember';
import { useAuthStore } from '@/stores/authStore';
import { type IFenceResultContent, useModalStore } from '@/stores/modalStore';
import type { TFenceEdgeState, TFenceHintKind, TFencePuzzle, TFenceSize } from '@/types/fence/TFence';
import { trackEvent, trackOncePerVisit } from '@/utils/analytics/analytics';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { getMemberIdFromAccessToken } from '@/utils/auth/authRole';
import { analyzeFence, EMPTY, emptyState, FENCE, nextEdgeState, serializeState } from '@/utils/fence/fenceGrid';
import { acknowledgePointReward } from '@/utils/point/pointReward';

// 완성 연출(안쪽 그라데이션)이 끝난 뒤 결과 창을 띄운다.
const CELEBRATION_MS = 1300;
const SIZE_KEY = 'fence:size';
const HISTORY_LIMIT = 300;

type TFenceGame = {
  puzzle: TFencePuzzle;
  state: TFenceEdgeState[];
  history: TFenceEdgeState[][];
  startedAt: number;
  solvedAt: number | null;
  hintsUsed: number;
};

export type TFenceHintMark = { edge: number; kind: TFenceHintKind; key: number };

// 마지막으로 고른 크기는 이 브라우저에서만 기억한다(저장소가 막혀도 기본 크기로 시작).
const readSize = (): TFenceSize => {
  try {
    const saved = Number(localStorage.getItem(SIZE_KEY));
    return saved === 7 || saved === 10 ? saved : 5;
  } catch {
    return 5;
  }
};
const saveSize = (size: TFenceSize) => {
  try {
    localStorage.setItem(SIZE_KEY, String(size));
  } catch {
    // 저장 실패는 무시한다.
  }
};

// 지원 기기에서만 아주 짧게 진동한다(iOS 웹은 지원하지 않는다).
const tick = () => {
  try {
    navigator.vibrate?.(8);
  } catch {
    // 진동 실패는 무시한다.
  }
};

const HINT_MESSAGES: Record<TFenceHintKind, string> = {
  WRONG: '틀린 표시를 지웠어요.',
  FENCE: '여기에 울타리가 들어가요.',
  CROSS: '여기에는 울타리가 없어요.',
};

export default function useFenceGame() {
  const client = useQueryClient();
  const { memberId, isMember, isChecking } = useFenceMember();
  const openResult = useModalStore((s) => s.openFenceResult);
  const [size, setSize] = useState<TFenceSize>(readSize);
  const [game, setGame] = useState<TFenceGame | null>(null);
  const [hintMark, setHintMark] = useState<TFenceHintMark | null>(null);
  // 첫 판은 마운트 효과에서 요청하므로, StrictMode 재마운트에도 풀리도록 요청 중 상태를 직접 관리한다.
  const [issuing, setIssuing] = useState(true);
  const [issueFailed, setIssueFailed] = useState(false);
  const gameRef = useRef<TFenceGame | null>(null);
  const stroke = useRef<TFenceEdgeState | null>(null);
  const resultTimer = useRef<number | undefined>(undefined);
  const started = useRef(false);
  const hintSeq = useRef(0);
  // 결과 창보다 서버 확인이 먼저 도착해도 잃지 않도록 보관했다가 창을 열 때 합친다.
  const confirmation = useRef<Partial<IFenceResultContent> | null>(null);
  const confirm = (patch: Partial<IFenceResultContent>) => {
    confirmation.current = patch;
    useModalStore.getState().updateFenceResult(patch);
  };

  const commit = (next: TFenceGame | null) => {
    gameRef.current = next;
    setGame(next);
  };

  const issue = useCoreMutation(postFencePuzzle, {
    retry: false,
    onMutate: () => {
      setIssuing(true);
      setIssueFailed(false);
    },
    onSettled: () => setIssuing(false),
    onSuccess: (puzzle) => {
      window.clearTimeout(resultTimer.current);
      setHintMark(null);
      commit({
        puzzle,
        state: emptyState(puzzle.size),
        history: [],
        startedAt: Date.now(),
        solvedAt: null,
        hintsUsed: 0,
      });
      trackEvent('fence_started', { fence_size: puzzle.size });
    },
    onError: (error) => {
      setIssueFailed(true);
      toast.error(error.response?.data?.message ?? '판을 만들지 못했어요. 잠시 후 다시 시도해주세요.');
      trackErrorShown('fence', error);
    },
  });

  const completion = useCoreMutation(postFenceCompletion, {
    retry: false,
    onSuccess: (result) => {
      // 응답을 기다리는 사이 계정이 바뀌었으면 다른 회원 화면에 반영하지 않는다.
      if (getMemberIdFromAccessToken(useAuthStore.getState().accessToken) !== memberId) return;
      client.setQueryData(QUERY_KEYS.FENCE_STATISTICS(memberId), result.statistics);
      confirm({ elapsedSeconds: result.elapsedSeconds, newRecord: result.newRecord, confirmed: true });
      const targetId = Number(result.solvedDate.replaceAll('-', ''));
      void acknowledgePointReward({ reason: 'FENCE_SOLVED', targetId }).then((amount) => {
        if (getMemberIdFromAccessToken(useAuthStore.getState().accessToken) !== memberId || amount !== 10) return;
        void client.invalidateQueries({ queryKey: QUERY_KEYS.GET_POINT_SUMMARY });
        void client.invalidateQueries({ queryKey: QUERY_KEYS.GET_POINT_HISTORIES });
        toast.success('오늘의 울타리를 완성해 10P가 적립됐어요!', { id: `fence-reward:${memberId}:${targetId}` });
      });
    },
    onError: (error) => {
      confirm({ confirmed: false });
      toast.error(error.response?.data?.message ?? '기록을 저장하지 못했어요. 잠시 후 다시 시도해주세요.');
      trackErrorShown('fence', error);
    },
  });

  const start = (next: TFenceSize) => {
    if (issuing) return;
    setSize(next);
    saveSize(next);
    useModalStore.getState().closeFenceResult();
    issue.mutate(next);
  };

  // 처음 들어오면 마지막으로 고른 크기로 바로 시작한다. (StrictMode 이중 실행에도 한 판만 요청)
  useEffect(() => {
    trackOncePerVisit('fence_viewed');
    if (started.current) return;
    started.current = true;
    issue.mutate(readSize());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(resultTimer.current);
      useModalStore.getState().closeFenceResult();
    },
    [],
  );

  const finish = (solved: TFenceGame) => {
    const done = { ...solved, solvedAt: Date.now() };
    commit(done);
    confirmation.current = null;
    setHintMark(null);
    const seconds = Math.max(1, Math.round((done.solvedAt - done.startedAt) / 1000));
    trackEvent('fence_completed', {
      fence_size: done.puzzle.size,
      fence_seconds: seconds,
      fence_hints: done.hintsUsed,
      fence_member: isMember,
    });
    if (isMember) completion.mutate({ token: done.puzzle.token, state: serializeState(done.state) });
    resultTimer.current = window.setTimeout(
      () =>
        openResult({
          size: done.puzzle.size,
          elapsedSeconds: seconds,
          hintsUsed: done.hintsUsed,
          newRecord: false,
          // 회원은 서버 확인 전까지 기록을 '확인 중'으로 둔다.
          confirmed: isMember ? null : false,
          onNewGame: () => start(done.puzzle.size),
          ...confirmation.current,
        }),
      CELEBRATION_MS,
    );
  };

  /** 변 상태를 바꾸고, 완성되면 연출과 기록을 시작한다. */
  const apply = (updates: [number, TFenceEdgeState][], pushHistory: boolean) => {
    const current = gameRef.current;
    if (!current || current.solvedAt) return false;
    const state = [...current.state];
    let changed = false;
    for (const [edge, value] of updates) {
      if (state[edge] === value) continue;
      state[edge] = value;
      changed = true;
    }
    if (!changed) return false;
    const history = pushHistory ? [...current.history, current.state].slice(-HISTORY_LIMIT) : current.history;
    const next = { ...current, state, history };
    commit(next);
    if (analyzeFence(next.puzzle.size, next.puzzle.clues, state).solved) finish(next);
    return true;
  };

  const hint = useCoreMutation(postFenceHint, {
    retry: false,
    onSuccess: (result) => {
      const current = gameRef.current;
      if (!current || current.solvedAt) return;
      const value = result.kind === 'WRONG' ? EMPTY : result.kind === 'FENCE' ? FENCE : 2;
      commit({ ...current, hintsUsed: result.hintsUsed });
      hintSeq.current += 1;
      setHintMark({ edge: result.edge, kind: result.kind, key: hintSeq.current });
      apply([[result.edge, value as TFenceEdgeState]], true);
      trackEvent('fence_hint_used', { fence_size: current.puzzle.size, fence_hints: result.hintsUsed });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? '힌트를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
      trackErrorShown('fence', error);
    },
  });

  // 누른 변은 다음 상태로 바꾸고, 그대로 끌면 지나가는 변을 같은 상태로 칠한다(한 번의 되돌리기 단위).
  const beginStroke = (edge: number) => {
    const current = gameRef.current;
    if (!current || current.solvedAt || hint.isPending) return;
    const value = nextEdgeState(current.state[edge] ?? EMPTY);
    stroke.current = value;
    if (apply([[edge, value]], true)) tick();
  };
  const continueStroke = (edge: number) => {
    if (stroke.current === null) return;
    if (apply([[edge, stroke.current]], false)) tick();
  };
  const endStroke = () => {
    stroke.current = null;
  };

  const undo = () => {
    const current = gameRef.current;
    const previous = current?.history.at(-1);
    if (!current || current.solvedAt || !previous) return;
    commit({ ...current, state: previous, history: current.history.slice(0, -1) });
    setHintMark(null);
  };

  const requestHint = () => {
    const current = gameRef.current;
    if (!current || current.solvedAt || hint.isPending || current.hintsUsed >= current.puzzle.maxHints) return;
    hint.mutate({ token: current.puzzle.token, state: serializeState(current.state) });
  };

  const showStatistics = () => openResult(null);

  const analysis = game ? analyzeFence(game.puzzle.size, game.puzzle.clues, game.state) : null;
  return {
    size,
    game,
    analysis,
    hintMark,
    hintMessage: hintMark ? HINT_MESSAGES[hintMark.kind] : null,
    hintsRemaining: game ? game.puzzle.maxHints - game.hintsUsed : 0,
    isIssuing: issuing,
    issueFailed: issueFailed && !game,
    isHinting: hint.isPending,
    isMember,
    isChecking,
    memberId,
    start,
    retry: () => issue.mutate(size),
    beginStroke,
    continueStroke,
    endStroke,
    undo,
    requestHint,
    showStatistics,
  };
}
