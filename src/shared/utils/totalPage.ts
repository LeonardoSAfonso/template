export default function getTotalPage(totalOfObjects: number, offset = 0) {
  if (!offset) {
    return 0;
  }

  return totalOfObjects % offset === 0
    ? totalOfObjects / offset
    : Number.parseInt(`${totalOfObjects / offset}`, 10) + 1;
}
