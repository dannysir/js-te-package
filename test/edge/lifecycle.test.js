describe('[edge-lifecycle] 중첩 describe의 beforeEach 스코프 복원', () => {
  let log;

  beforeEach(() => {
    log = [];
  });

  describe('outer', () => {
    beforeEach(() => {
      log.push('outer');
    });

    describe('inner', () => {
      beforeEach(() => {
        log.push('inner');
      });

      test('inner test — outer → inner 순서로 실행', () => {
        expect(log).toEqual(['outer', 'inner']);
      });
    });

    test('outer test — inner hook은 실행되지 않음', () => {
      expect(log).toEqual(['outer']);
    });
  });

  test('최상위 test — 내부 describe의 hook 영향 없음', () => {
    expect(log).toEqual([]);
  });
});

describe('[edge-lifecycle] 같은 describe 내 다수 beforeEach 등록 순서대로 실행', () => {
  let order;

  beforeEach(() => {
    order = [];
  });

  beforeEach(() => {
    order.push(1);
  });

  beforeEach(() => {
    order.push(2);
  });

  test('등록 순서대로 누적', () => {
    expect(order).toEqual([1, 2]);
  });
});
