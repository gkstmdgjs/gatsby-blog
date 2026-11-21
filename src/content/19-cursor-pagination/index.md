---
emoji: 🔖
title: '커서 페이지네이션 파헤치기'
date: '2026-11-21'
categories: Dev Frontend Backend DB
---

지난 [DB 파티셔닝 글](/18-db-partitioning/)에서 데이터가 쌓이면서 조회·추가·수정이 함께 느려졌다는 이야기를 했었죠.
테이블이 커질 때 가장 먼저 티가 나는 곳 중 하나가 바로 **목록 화면의 페이지네이션**입니다!

```sql
-- 어디서나 볼 수 있는 그 쿼리
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 100000;
```

첫 페이지는 눈 깜짝할 새에 나오는데, 뒤로 갈수록 점점 느려지는 목록... 한 번쯤 보셨을 거예요. 😅
게다가 무한 스크롤에서 **같은 글이 두 번 보이거나, 어떤 글은 아예 건너뛰는** 현상도 이 쿼리에서 시작되는 경우가 많습니다.

그래서 이번엔 마음먹었습니다! **"OFFSET 없이 페이지를 넘기는 방법을 제대로 정리해 보자!"** 💪

이번 글에서는 OFFSET이 왜 느리고 왜 어긋나는지, 커서(키셋) 페이지네이션이 그걸 어떻게 푸는지, 그리고 백엔드 API와 프론트엔드 무한 스크롤까지 한 번에 이어서 정리해 봤어요.
예시는 **MySQL 8(InnoDB) + NestJS + React(TanStack Query v5)** 기준이고, 테이블과 컬럼 이름은 설명을 위해 만든 예시입니다!

&nbsp;

## 🐌 OFFSET이 뒤로 갈수록 느린 이유

`OFFSET 100000`은 "100,000번째부터 보여줘"라는 뜻이지만, DB에는 **"100,000번째로 바로 점프하는 방법"이 없습니다.**
정렬 순서대로 앞에서부터 100,020개를 읽고, 그중 100,000개를 **버린 다음** 20개만 돌려줘요.

```sql
-- 이 쿼리가 실제로 하는 일
-- 1) created_at 인덱스를 역순으로 훑으며
-- 2) 100,020개의 행을 찾아서 (SELECT * 라면 행마다 클러스터드 인덱스까지 다녀온다)
-- 3) 앞의 100,000개는 버리고
-- 4) 20개만 반환
SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 100000;
```

여기서 특히 아픈 건 2번이에요!
InnoDB의 보조 인덱스에는 인덱스 컬럼과 PK만 들어 있어서, `SELECT *`이면 **버릴 행까지 전부** 본문을 읽으러 클러스터드 인덱스를 다녀옵니다.
그래서 페이지 번호가 커질수록 응답 시간도 거의 그대로 비례해서 늘어나요.

흔히 쓰는 완화책은 **지연 조인(deferred join)** 이에요.

```sql
-- ✅ 커버링 인덱스로 id만 먼저 고르고, 본문은 20개만 읽는다
SELECT p.*
FROM posts p
JOIN (
  SELECT id FROM posts
  ORDER BY created_at DESC, id DESC
  LIMIT 20 OFFSET 100000
) AS page USING (id)
ORDER BY p.created_at DESC, p.id DESC;
```

본문을 읽으러 가는 횟수는 20번으로 줄어서 꽤 빨라집니다!
그런데 곰곰이 보면 **인덱스를 100,020개 훑는 일 자체는 그대로**예요. 느려지는 속도를 늦췄을 뿐, 뒤로 갈수록 느려진다는 성질은 바뀌지 않습니다.

&nbsp;

## 👻 중복되고 사라지는 글

속도보다 더 골치 아픈 건 **정합성** 문제예요.

사용자가 1페이지(최신 20개)를 보고 있는 사이에 새 글 1개가 올라왔다고 해볼게요.
이제 전체 목록이 한 칸씩 밀렸기 때문에, 2페이지(`OFFSET 20`)의 첫 번째 글은 **방금 1페이지 마지막에서 본 글**이 됩니다.

```text
[1페이지 조회 시점]  A B C ... T   (20개)
[새 글 N 추가]      N A B C ... T U ...
[2페이지 OFFSET 20]               T U V ...   ← T가 또 나온다!
```

반대로 그 사이에 글이 삭제되면 목록이 한 칸 당겨지면서 **글 하나를 건너뜁니다.**
게시판처럼 페이지 번호를 누르는 화면에선 잘 티가 안 나지만, 무한 스크롤에선 바로 보이는 문제예요.
프론트엔드에서 id로 중복을 걸러내는 코드가 들어가기 시작했다면, 원인은 대개 여기 있습니다. 🤔

결국 문제의 뿌리는 하나예요.

> **OFFSET은 "몇 번째"를 기억하고, 커서는 "어디까지 봤는지"를 기억한다.**

목록이 바뀌면 "몇 번째"는 의미가 달라지지만, "이 글 다음부터"는 그대로거든요!

&nbsp;

## 📌 커서(키셋) 페이지네이션이 하는 일

커서 페이지네이션은 **마지막으로 본 행의 정렬 키**를 기억해 두고, 다음 페이지를 "그 값보다 뒤에 있는 것"으로 조회하는 방식이에요.
키셋(keyset) 페이지네이션, seek 메서드라고도 부릅니다!

```sql
-- ❌ OFFSET: 앞에서부터 세어서 버린다
SELECT id, title, created_at FROM posts
ORDER BY id DESC
LIMIT 20 OFFSET 100000;

-- ✅ 커서: 마지막으로 본 id 다음부터 바로 찾아간다
SELECT id, title, created_at FROM posts
WHERE id < :lastId
ORDER BY id DESC
LIMIT 20;
```

`WHERE id < :lastId`는 인덱스에서 그 위치로 **바로 찾아가서** 20개만 읽고 끝납니다.
그래서 1페이지든 5,000페이지든 읽는 양이 거의 같아요. 이게 커서 방식의 가장 큰 장점입니다!
중간에 글이 추가되거나 삭제돼도 "이 id 다음"이라는 기준은 흔들리지 않으니 중복·누락도 사라지고요.

&nbsp;

### 🧷 정렬 키는 반드시 유일해야 한다

`id`처럼 유일한 컬럼 하나로 정렬한다면 위 쿼리로 끝이에요.
하지만 실무에서는 `created_at`, `price`, `score`처럼 **값이 겹칠 수 있는 컬럼**으로 정렬하는 경우가 훨씬 많죠.

```sql
-- ❌ created_at만으로 자르면, 같은 시각에 생긴 글이 페이지 경계에 걸릴 때 빠진다
WHERE created_at < :lastCreatedAt
```

같은 `created_at`을 가진 글이 3개인데 그중 1개만 이전 페이지에 들어갔다면, 나머지 2개는 `<` 조건에 걸려서 **영영 안 보입니다.**
그래서 정렬 키 끝에 **유일한 컬럼(보통 PK)을 꼭 붙여서** 순서를 완전히 고정해야 해요!

```sql
-- ✅ (created_at, id) 조합으로 순서를 고정한다
SELECT id, title, created_at FROM posts
WHERE created_at < :lastCreatedAt
   OR (created_at = :lastCreatedAt AND id < :lastId)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

`(created_at, id) < (:lastCreatedAt, :lastId)` 같은 행 생성자 비교로 쓸 수도 있어요. 훨씬 깔끔하죠!
MySQL 5.7부터는 이 형태도 범위 스캔을 쓸 수 있지만, 조건이 복잡해지면 기대한 대로 안 탈 때가 있으니 **`EXPLAIN`으로 꼭 확인**해 주세요.
위처럼 `OR`로 풀어 쓴 형태는 DB나 버전과 상관없이 의도가 명확해서 무난합니다.

&nbsp;

### 🗂️ 인덱스는 정렬 순서 그대로

커서 방식이 빠른 건 **인덱스를 정렬 순서대로 따라가기 때문**이에요. 인덱스가 정렬 키와 맞지 않으면 아무 의미가 없습니다!

```sql
-- 정렬 키 (created_at, id)에 맞춘 인덱스
CREATE INDEX idx_created_id ON posts (created_at, id);

-- 특정 사용자의 글 목록이라면, 필터 컬럼을 앞에 둔다
CREATE INDEX idx_author_created_id ON posts (author_id, created_at, id);
```

사실 InnoDB의 보조 인덱스에는 PK가 자동으로 붙어 있어서 `(created_at)`만 만들어도 내부적으로는 `(created_at, id)` 순서예요.
그래도 정렬 의도가 드러나도록 명시해 두는 편이 나중에 읽는 사람에게 친절합니다.

`ORDER BY price ASC, id DESC`처럼 **방향이 섞인 정렬**은 행 생성자 비교를 못 쓰고, `OR`로 풀어 쓰면서 방향마다 부등호를 따로 맞춰야 해요.
인덱스도 MySQL 8.0의 내림차순 인덱스(`(price ASC, id DESC)`)로 맞춰주면 정렬 없이 따라갈 수 있습니다!

&nbsp;

## 🤔 그럼 OFFSET은 버려야 할까?

그렇지는 않아요! 둘은 잘하는 게 다릅니다.

| 기준 | OFFSET | 커서(키셋) |
| --- | --- | --- |
| 깊은 페이지 성능 | 뒤로 갈수록 느려진다 | 어디서나 거의 일정하다 |
| 데이터 변경 중 정합성 | 중복·누락이 생긴다 | 흔들리지 않는다 |
| 특정 페이지로 점프 (`37페이지`) | 바로 된다 | 안 된다 |
| 전체 페이지 수 표시 | `COUNT(*)`와 함께 자연스럽다 | 보통 표시하지 않는다 |
| 정렬 기준 변경 | 자유롭다 | 정렬 키마다 인덱스·커서 설계가 필요하다 |
| 잘 맞는 화면 | 관리자 표, 페이지 번호 게시판 | 피드, 무한 스크롤, 알림, 대량 배치 처리 |

관리자 화면처럼 데이터가 아주 많지 않고 "37페이지로 이동"이 필요한 곳이라면 OFFSET이 여전히 편하고 좋습니다.
반대로 **계속 쌓이는 데이터 + 무한 스크롤**이라면 커서가 딱 맞아요!

하나 덧붙이면, 배치 작업에서 큰 테이블을 순회할 때도 커서 방식이 정답이에요.
`OFFSET`으로 10만 건씩 끊어 읽는 배치는 뒤로 갈수록 느려지지만, `WHERE id > :lastId ORDER BY id LIMIT 1000`은 끝까지 일정한 속도로 돌거든요!

&nbsp;

## 🛠️ 백엔드 API 설계

### 🔐 커서는 불투명한 문자열로

클라이언트에게 `lastCreatedAt`, `lastId`를 따로 받으면 API가 정렬 방식에 묶여버려요.
그래서 보통 정렬 키를 묶어서 **하나의 불투명한(opaque) 문자열**로 내려줍니다.
클라이언트는 그 값을 해석하지 않고 다음 요청에 그대로 돌려주기만 하면 돼요!

```typescript
// 커서 = 정렬 키를 묶어서 base64url로 감싼 문자열 (예시)
type PostCursor = { createdAt: string; id: string };

export function encodeCursor(c: PostCursor): string {
  return Buffer.from(JSON.stringify(c)).toString('base64url');
}

export function decodeCursor(raw?: string): PostCursor | null {
  if (!raw) return null;
  try {
    const c = JSON.parse(Buffer.from(raw, 'base64url').toString());
    // ✅ 디코드한 값은 사용자 입력이다 — 형식을 반드시 검증한다
    if (typeof c?.createdAt !== 'string' || !/^\d+$/.test(c?.id)) return null;
    return c;
  } catch {
    return null;
  }
}
```

base64는 **암호화가 아니라 포장**일 뿐이에요! 누구나 풀어서 고칠 수 있습니다.
커서는 "어디부터 읽을지"라는 위치 정보일 뿐이니, 권한 체크 같은 조건은 커서와 상관없이 **항상 서버 쿼리에 따로** 걸어야 해요.

&nbsp;

### 📦 limit + 1로 다음 페이지 확인하기

"다음 페이지가 있나?"를 알려고 `COUNT(*)`를 같이 돌리는 경우가 많은데, InnoDB는 테이블 행 수를 따로 저장하지 않아서 `COUNT(*)`도 결국 인덱스를 전부 훑습니다.
대신 **요청한 개수보다 하나 더** 가져오면 공짜로 알 수 있어요!

```typescript
// NestJS 서비스 예시 (DataSource.query 사용)
async findPosts(rawCursor?: string, limit = 20) {
  const take = Math.min(Math.max(limit, 1), 100); // ✅ 상한을 꼭 둔다
  const cursor = decodeCursor(rawCursor);

  const params: unknown[] = [];
  let where = '';
  if (cursor) {
    where = `WHERE created_at < ? OR (created_at = ? AND id < ?)`;
    params.push(cursor.createdAt, cursor.createdAt, cursor.id);
  }

  const rows = await this.dataSource.query(
    `SELECT id, title, created_at AS createdAt
       FROM posts
       ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT ?`,
    [...params, take + 1], // ✅ 하나 더 가져온다
  );

  const hasNext = rows.length > take;
  const items = hasNext ? rows.slice(0, take) : rows;
  const last = items[items.length - 1];

  return {
    items,
    nextCursor: hasNext ? encodeCursor({ createdAt: last.createdAt, id: String(last.id) }) : null,
  };
}
```

응답은 `{ items, nextCursor }` 모양이 가장 단순해요.
`nextCursor`가 `null`이면 마지막 페이지라는 뜻이라, 프론트엔드가 따로 계산할 게 없습니다!
GraphQL을 쓴다면 같은 생각을 규격으로 만든 Relay의 Connection 스펙(`edges`, `pageInfo.endCursor`, `hasNextPage`)을 따르면 돼요.

&nbsp;

### ⏱️ 커서에 담긴 시각은 정밀도까지 그대로

여기 정말 잘 걸리는 함정이 하나 있어요!
`created_at`이 `DATETIME(6)`(마이크로초)인데, 드라이버가 이 값을 JavaScript `Date`로 바꾸면 **밀리초까지만** 남습니다.

```text
DB 값         2026-11-21 10:00:00.123456
Date로 변환    2026-11-21T10:00:00.123Z     ← 456 마이크로초가 사라짐
```

이 값을 커서에 담아 다시 비교하면 `created_at < '...00.123'` 조건이 실제 마지막 행과 어긋나요.
그 결과 **경계에 있던 행이 빠지거나 다시 나오는**, 원래 커서로 막으려던 바로 그 버그가 돌아옵니다. 😱

- 커서용 시각은 DB에서 **문자열 그대로** 꺼내서 담거나
- 정렬 키를 아예 **단조 증가하는 PK 하나**로 단순화하는 방법이 있어요

`AUTO_INCREMENT` PK가 생성 순서와 사실상 같다면, 최신순 목록은 `ORDER BY id DESC` 하나로 충분한 경우가 많습니다. 제일 단순한 게 제일 덜 깨지더라고요!

&nbsp;

## ⚛️ 프론트엔드 무한 스크롤 연결

백엔드가 `nextCursor`를 내려주면 프론트엔드 쪽은 아주 편해집니다!
TanStack Query v5의 `useInfiniteQuery`가 이 모양을 그대로 받아줘요.

```tsx
const PAGE_SIZE = 20;

function usePosts(filters: PostFilters) {
  return useInfiniteQuery({
    // ✅ 필터가 바뀌면 키가 바뀌고, 목록이 처음부터 다시 시작된다
    queryKey: ['posts', filters],
    queryFn: ({ pageParam }) => fetchPosts({ ...filters, cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: undefined as string | undefined, // v5에서는 필수
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined, // undefined면 hasNextPage = false
  });
}

function PostList({ filters }: { filters: PostFilters }) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePosts(filters);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(([entry]) => {
      // ✅ 이미 불러오는 중이면 또 부르지 않는다
      if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      {data?.pages.flatMap((page) => page.items).map((post) => <PostItem key={post.id} post={post} />)}
      <div ref={sentinelRef} />
    </>
  );
}
```

여기서 중요한 포인트는 **커서가 필터·정렬 조건에 종속된다**는 점이에요!
`latest` 정렬에서 받은 커서를 `popular` 정렬 요청에 그대로 보내면 엉뚱한 위치부터 읽게 됩니다.
그래서 필터와 정렬은 반드시 `queryKey`에 넣어서, 조건이 바뀌면 커서도 처음부터 다시 시작하게 만들어야 해요.

서버 쪽도 같은 이유로, 정렬 방식이 여러 개라면 커서 안에 **어떤 정렬의 커서인지**도 함께 담아두고 맞지 않으면 거절하는 게 안전합니다.

&nbsp;

## ⚠️ 커서로 바꾸고 나서 알게 되는 것들

커서 방식이 성능과 정합성을 깔끔하게 풀어주지만, 대신 내려놓아야 하는 것도 있어요!

&nbsp;

### 🔢 페이지 번호와 전체 개수는 포기하거나 따로

커서 방식은 "37페이지"라는 개념이 없어요. 앞에서부터 차례로 넘겨야만 그 위치에 갈 수 있습니다.
기획에서 페이지 번호 UI가 꼭 필요하다면, 그 화면만 OFFSET을 쓰거나 검색 조건으로 범위를 좁히게 하는 쪽이 현실적이에요.

전체 개수도 마찬가지예요. 정확한 개수가 꼭 필요하지 않다면 **"1,000+"처럼 상한까지만 세거나**, 주기적으로 집계한 값을 보여주는 방식으로 타협하는 경우가 많습니다.

&nbsp;

### 🔄 바뀌는 값으로 정렬하면 여전히 흔들린다

좋아요 수, 조회수, 수정 시각처럼 **계속 바뀌는 값**으로 정렬하면 커서도 완벽하지 않아요.
내가 2페이지를 보는 사이에 **아직 안 본** 아래쪽 글의 좋아요 수가 늘어서 1페이지 쪽으로 올라가면, 그 글은 이번 스크롤에선 볼 수 없습니다.
반대로 이미 본 글의 값이 줄어서 아래로 내려가면 한 번 더 보이기도 하고요.

이건 커서의 문제라기보다 **"움직이는 목록을 나눠 보는 것"** 자체의 한계예요.
정합성이 정말 중요하다면 정렬 결과를 일정 시점 기준으로 고정(스냅샷)해 두는 설계가 필요하고, 대부분의 피드는 이 정도 흔들림을 허용하는 쪽을 택합니다.

&nbsp;

### ⬅️ 이전 페이지는 방향을 뒤집어서

양방향 이동(위로 스크롤해서 이전 내용 불러오기)이 필요하면, 부등호와 정렬 방향을 **둘 다** 뒤집어서 조회한 뒤 결과를 다시 뒤집어야 해요.

```sql
-- 이전 페이지: 첫 번째 행보다 "앞"에 있는 것을 가까운 순서로 가져온 뒤
SELECT id, title, created_at FROM posts
WHERE created_at > :firstCreatedAt
   OR (created_at = :firstCreatedAt AND id > :firstId)
ORDER BY created_at ASC, id ASC
LIMIT 20;
-- 애플리케이션에서 결과를 reverse() 해서 원래 순서(DESC)로 돌린다
```

`ORDER BY ... DESC`를 그대로 두고 부등호만 뒤집으면 **가장 오래된 쪽**부터 20개를 가져와서 엉뚱한 페이지가 나와요. 처음 짤 때 정말 자주 하는 실수입니다! 😂

&nbsp;

## 🎬 마무리

정리하고 보니 페이지네이션을 보는 관점이 꽤 달라졌어요!
처음엔 OFFSET의 문제를 **"깊은 페이지가 느리다"** 는 성능 문제로만 봤는데, 실제로는 **"위치를 숫자로 기억한다"** 는 설계 자체의 문제에 더 가깝더라고요.

- ✅ OFFSET은 앞의 행을 전부 읽고 버리기 때문에 뒤로 갈수록 느려지고, 목록이 바뀌면 중복·누락이 생깁니다
- ✅ 커서는 **유일한 정렬 키 조합 + 그 순서와 같은 인덱스**가 있어야 제대로 동작합니다
- ✅ 커서는 불투명한 문자열로 내려주고, 필터·정렬이 바뀌면 처음부터 다시 시작해야 합니다

계속 쌓이는 테이블의 목록 API를 만들고 계신다면, 처음부터 **"이 화면에 페이지 번호가 꼭 필요한가?"** 를 먼저 물어보세요.
답이 "아니요"라면 커서 페이지네이션이 훨씬 오래 버텨주는 선택이 될 거예요! 🚀✨

```toc
```
