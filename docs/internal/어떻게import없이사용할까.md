# 어떻게 import 없이 사용할까?

## 문제

#### 현재 js-te 코드 

```javascript
import { describe, test, expect } from 'js-te';

describe('Math', () => {
  test('works', () => {
    expect(1).toBe(1);
  });
});
```

#### Jest는 import 없이 사용 가능

```javascript
describe('Math', () => {
  test('works', () => {
    expect(1).toBe(1);
  });
});
```

## 원리

Jest는 테스트 실행 전에 함수들을 **전역(global)** 에 미리 등록함:

```javascript
global.describe = describe;
global.test = test;
global.expect = expect;
```

## 해결 방법

### 수동 등록

각각의 메서드를 node의 전역 위치에 직접 등록하는 방식.

#### 문제점

유지 보수가 어려움.

```javascript
import * as jsTe from '../index.js';

global.describe = jsTe.describe;
global.test = jsTe.test;
global.expect = jsTe.expect;
```

### 순회를 통해 공개된 API 등록

```javascript
import * as jsTe from '../index.js';

Object.keys(jsTe).forEach(key => {
  global[key] = jsTe[key];
});
```

## 결과

사용자는 두 방식 모두 사용 가능:

```javascript
// 1. import 없이 (Jest 스타일)
describe('Math', () => { ... });

// 2. 명시적 import (Vitest 스타일)
import { describe, test, expect } from 'js-te';
```