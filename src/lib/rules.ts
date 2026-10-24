export function totalScore(
  tx: number | null,
  final: number | null,
  weight: number,
) {
  if (tx === null || final === null) return null;
  return (
    Math.round(tx * weight + final * (100 - weight) + Number.EPSILON) / 100
  );
}
export function letterScore(total: number | null) {
  if (total === null) return { letter: "—", points: null };
  return total >= 8.5
    ? { letter: "A", points: 4 }
    : total >= 7
      ? { letter: "B", points: 3 }
      : total >= 5.5
        ? { letter: "C", points: 2 }
        : total >= 4
          ? { letter: "D", points: 1 }
          : { letter: "F", points: 0 };
}
export function hasCycle(
  edges: { monHocId: number; monTienQuyetId: number }[],
) {
  const visiting = new Set<number>(),
    done = new Set<number>();
  const walk = (id: number): boolean => {
    if (visiting.has(id)) return true;
    if (done.has(id)) return false;
    visiting.add(id);
    if (
      edges.filter((e) => e.monHocId === id).some((e) => walk(e.monTienQuyetId))
    )
      return true;
    visiting.delete(id);
    done.add(id);
    return false;
  };
  return edges.some((e) => walk(e.monHocId));
}
