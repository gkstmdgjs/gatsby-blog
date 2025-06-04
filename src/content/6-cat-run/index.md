---
emoji: 🐱
title: 'Cat Run 게임 개발기'
date: '2025-05-13'
categories: featured-Make Dev
---

게임을 좋아하는 저는 개발자가 되었을 때부터 **꼭 한번 게임을 개발** 해보고 싶다는 뜨거운 생각을 가지고 있었습니다.
하지만 바쁜 일상을 핑계로 계속 미루다가, 어느 날 갑자기 결심하게 되었습니다! **"일단 해보자!"** 💪

처음에는 제가 정말 게임 개발을 할 수 있을까 하는 걱정이 앞섰습니다.
게임을 만들고 싶어 했지만 어떤 게임을 만들어야 하고 그 게임을 어떤 언어로 개발해야 할지 많은 고민이 들었어요.🤔

하지만 막상 시작해보니 생각보다 재미있고 수월하게 진행되었습니다! 
물론 많은 시행착오가 있었습니다. 캔버스 API를 활용한 애니메이션 처리, 웹소켓을 통한 실시간 통신, 게임 성능 최적화 등 여러 기술적 도전이 있었죠.

하지만 이런 문제들을 하나씩 해결해 나가면서 많은 것을 배우고 성장할 수 있었습니다. 
이 과정을 통해 저는 **"생각만 하기보다는 행동으로 옮기는 것이 중요하다"** 는 값진 교훈을 얻었습니다. 
아이디어를 행동으로 옮기는 그 순간, 비로소 진정한 성장이 시작된다는 것을 깨달았습니다.🌟

이 블로그 글을 통해 제가 개발한 Cat Run 게임의 프론트엔드와 백엔드 구현 과정, 그리고 그 과정에서 배운 기술적 포인트들을 공유하고자 합니다.

## 📌 프로젝트 소개

![](cat-run.png)

**Cat Run**은 귀여운 픽셀 아트 스타일의 고양이 달리기 게임입니다. 장애물을 피해 최대한 멀리 달리는 것이 목표인 **무한 러닝 게임**이에요!🐱
크롬의 공룡게임인 다이노를 모티브로 하여 게임을 개발했으며 웹소켓 통신을 활용한 실시간 랭킹 시스템을 구현하여 경쟁 요소를 추가했습니다.
또한 라이트/다크 모드가 전환되는 시각적 효과를 더했습니다!

## 🛠️ 사용 기술

### 프론트엔드
- **TypeScript** - 타입 안전성 확보
- **HTML5 Canvas API** - 게임 그래픽 구현
- **SCSS** - 스타일링
- **SockJS & StompJS** - 웹소켓 통신
- **Vite** - 빌드 및 개발 환경

### 백엔드
- **Java 21**
- **Spring Boot 3.4.4**
- **Spring Data JPA** - 데이터 접근 추상화
- **QueryDSL** - 타입 안전한 쿼리 구성
- **WebSocket** - 실시간 게임 상호작용
- **Redis** - 랭킹 데이터 캐싱
- **MySQL** - 주요 데이터 저장소

## ✨ 주요 기능

### 🎮 게임 메커니즘

Cat Run의 핵심은 간단하면서도 중독성 있는 게임입니다! 🐾 🎮
플레이어는 귀여운 픽셀 아트 고양이 캐릭터를 조작하여 끝없이 펼쳐지는 세상을 달려나갑니다. 🏃‍♂️
조작법은 스페이스바나 위쪽 화살표 키를 누르거나 게임 영역을 클릭하면 고양이가 점프하며 장애물을 뛰어넘어요!

게임이 진행될수록 다양한 형태의 장애물들이 등장하여 긴장감을 더해줍니다. 
생존 시간이 길어질수록 점수 및 게임 속도가 계속 증가하여 더욱 스릴 넘치는 경험을 선사합니다! 
게임 도중에 특정 구간에 도달하면 라이트 모드에서 다크 모드로 자연스럽게 전환되는 시각적 변화를 경험할 수 있습니다. 🌅🌙

### 📊 실시간 랭킹 시스템

혼자 플레이하는 게임도 재미있지만, 다른 플레이어들과 함께 경쟁할 때 진짜 재미가 시작됩니다! 💪 
Cat Run은 WebSocket 기술을 활용한 실시간 랭킹 시스템을 구현하여 전 세계 플레이어들과 순위를 경쟁할 수 있도록 했습니다.

전체 랭킹에서는 모든 플레이어들 중 상위 5명의 점수들을 실시간으로 확인할 수 있어요! 🏆 
동시에 개인 랭킹 시스템을 통해 자신만의 베스트 스코어 5개를 실시간으로 확인하여 개인 기록 갱신의 즐거움도 느낄 수 있습니다. 
게임을 플레이하는 동안 랭킹 정보가 실시간으로 업데이트되어, 새로운 기록이 달성되거나 순위가 변동될 때마다 즉시 반영됩니다! ⚡

성능 최적화를 위해 자주 조회되는 랭킹 데이터는 Redis를 활용하여 캐싱했기 때문에, 빠른 응답 속도로 끊김 없는 게임 경험을 제공합니다. 📈

### 🎨 시각적 요소

Cat Run의 매력적인 비주얼은 게임의 핵심 요소 중 하나입니다! 
전체 게임은 레트로한 픽셀 아트 스타일로 디자인되어 마치 90년대 고전 게임을 플레이하는 듯한 향수를 불러일으킵니다.
이러한 픽셀 아트는 단순해 보이지만 세심한 디테일이 담겨 있어 시각적 만족감을 제공합니다.

고양이 캐릭터의 애니메이션은 특히 볼거리입니다! 왜냐하면 고양이가 굉장히 귀엽거든요. 🐱
캔버스 API를 통해 선 하나하나를 이어 그린 고양이 캐릭터이기에 깊은 애정이 생겼어요. ~~집에서 키우고 있는 반려묘보다 더 애정이 들어요~~
달리기, 점프, 착지 등 모든 동작을 구현했고, requestAnimationFrame을 활용한 애니메이션으로 자연스러운 움직임을 표현했습니다.

무엇보다 특별한 것은 색상 전환 시스템입니다! 🌈 
게임이 진행되면서 특정 점수에 도달하면 화면의 색상 테마가 부드럽게 변화하는데, 이는 단순한 색상 변경이 아닌 정교한 색상 보간 기법을 통해 
자연스럽고 아름다운 그라데이션 효과를 만들어냅니다. 밝은 낮에서 신비로운 밤으로 변해가는 과정을 지켜보는 것만으로도 충분히 매혹적이에요! ✨
저는 특히 다크 모드가 정말 매혹적이라고 생각해요.🌙

## 💻 프론트엔드 기술적 포인트

### Canvas API를 활용한 게임 엔진 구현

게임의 핵심은 HTML5 Canvas API를 활용한 자체 게임 엔진입니다. 모든 게임 요소는 Canvas에 그려지며, requestAnimationFrame을 사용해 프레임마다 업데이트됩니다.

```typescript
private update(): void {
  const currentTime = Date.now();
  
  if (this.isGameOver) return this.drawGameOver();
  if (this.changeColor) this.updateColor(currentTime);
  
  // 화면 지우기
  this.ctx.fillStyle = this.color.black100;
  this.ctx.fillRect(0, 0, this.width, this.height);
  
  // 게임 요소 업데이트 및 그리기
  this.sky.update(currentTime);
  this.sky.draw(this.ctx);
  this.floor.update(currentTime);
  this.floor.draw(this.ctx);
  this.cat.update(currentTime);
  this.cat.draw(this.ctx);
  
  // 게임 로직 처리
  if (this.isGameStart) {
    this.obstacle.update(currentTime);
    this.obstacle.draw(this.ctx);
    this.updateGameState(currentTime);
    this.checkGameOver();
  }
  
  // 랭킹 그리기
  this.ranking.draw(this.ctx);
  
  requestAnimationFrame(() => this.update());
}
```

### 고양이 캐릭터 직접 그리기

가장 정성스럽게 만든 부분 중 하나는 바로 고양이 캐릭터입니다! 🐱 
외부 이미지 파일을 사용하지 않고 **Canvas API의 선과 도형만으로** 픽셀 하나하나 직접 그려서 만들었어요.

```typescript
export function drawCat(ctx: CanvasRenderingContext2D, x: number, y: number, color: T.CatColor): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(C.SCALE, C.SCALE);
  
  // 고양이 몸통 외곽선을 Path2D로 정교하게 그리기
  ctx.fillStyle = color.body;
  ctx.beginPath();
  
  // 귀부터 시작해서 시계방향으로 외곽선 그리기 (30여개의 좌표점)
  ctx.moveTo(18, -13);  // 왼쪽 귀 끝
  ctx.lineTo(18, -3);   // 귀에서 머리 측면
  ctx.lineTo(15, -3);   // 머리 위쪽
  ctx.lineTo(15, 11);   // 목 부분
  ctx.lineTo(12, 11);   // 가슴
  ctx.lineTo(12, 26);   // 앞다리
  ctx.lineTo(28, 26);   // 배
  ctx.lineTo(28, 23);   // 뒷다리 시작
  ctx.lineTo(40, 23);   // 뒷다리
  ctx.lineTo(40, 26);   // 뒷발
  ctx.lineTo(56, 26);   // 꼬리 시작
  ctx.lineTo(56, 8);    // 꼬리 끝
  ctx.lineTo(53, 8);    // 꼬리 안쪽
  ctx.lineTo(53, -3);   // 등
  ctx.lineTo(50, -3);   // 머리 뒤
  ctx.lineTo(50, -13);  // 오른쪽 귀
  ctx.lineTo(18, -13);  // 시작점으로 돌아와서 닫기
  
  ctx.fill(); // 몸통 채우기

  // 눈 그리기 (정확한 픽셀 위치로 표정 만들기)
  ctx.fillStyle = color.eye;
  ctx.fillRect(24, 3, 3, 4);  // 왼쪽 눈
  ctx.fillRect(35, 3, 3, 4);  // 오른쪽 눈
  
  // 얼굴과 몸의 디테일 선 그리기 (각 부위별 정밀한 선 표현)
  ctx.fillStyle = color.line;
  ctx.fillRect(21, -3, 1, 11);   // 왼쪽 얼굴선
  ctx.fillRect(28, 8, 1, 15);    // 앞다리 구분선
  ctx.fillRect(40, 8, 1, 15);    // 뒷다리 구분선
  ctx.fillRect(46, -3, 1, 11);   // 오른쪽 얼굴선
  
  ctx.restore();
}
```

모든 그래픽 요소를 이런 식으로 **좌표 하나하나 계산해서** 그렸기 때문에 정말 애정이 많이 들어간 게임이에요! ✨

디테일한 부분을 말하자면 끝이 없지만 특히 다크모드에서 나타나는 달은 **세 가지 모양**으로 변화합니다!
처음엔 오른쪽 초승달로 시작해서 → 보름달 → 왼쪽 초승달 순서로 바뀌어요.
이런 작은 디테일들이 게임에 생동감과 퀄리티를 더해주는 것 같아요! 😊

### 다크모드 전환 애니메이션

게임 진행 중 특정 점수에 도달하면 **700ms 동안** 부드럽게 밝은 낮에서 어두운 밤으로 전환되는 시스템을 구현했습니다! 🌅🌙

```typescript
private updateColor(currentTime: number): void {
  if (!this.transitionStartTime) {
    this.transitionStartTime = currentTime;
  }

  const elapsed = currentTime - this.transitionStartTime;
  const progress = Math.min(elapsed / 700, 1);  // 0~1 진행률 계산
  
  // 시작 색상과 목표 색상 정의
  const startColor = this.mode === 'light' ? COLOR.light : COLOR.dark;
  const endColor = this.mode === 'light' ? COLOR.dark : COLOR.light;

  // 모든 게임 요소의 색상을 점진적으로 변경
  (Object.keys(this.color) as Array<keyof T.Color>).forEach((key) => {
    this.color[key] = colorTransition(startColor[key], endColor[key], progress);
  });

  // 전환 완료 시 모드 변경
  if (progress === 1) {
    this.changeColor = false;
    this.mode = this.mode === 'light' ? 'dark' : 'light';
    this.sky.mode = this.mode;
  }
}

// RGB 색상 보간 함수
function colorTransition(start: string, end: string, progress: number): string {
  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);
  
  const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * progress);
  const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * progress);
  const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * progress);
  
  return `rgb(${r}, ${g}, ${b})`;
}
```

### WebSocket 실시간 양방향 통신 구현

정말 많은 고민과 시행착오를 거쳐 완성한 실시간 랭킹 시스템입니다! 💫

**STOMP + SockJS로 안정적인 연결**

```typescript
export class WebSocketClient {
  private client: Client;

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws`),
      reconnectDelay: 5000,        // 연결 끊어졌을 때 5초 후 재연결
      heartbeatIncoming: 5000,     // 서버에서 클라이언트로 하트비트
      heartbeatOutgoing: 3000,     // 클라이언트에서 서버로 하트비트
    });
  }

  connect(callback: (data: T.WSCatData) => void) {
    this.client.onConnect = () => {
      // 연결 성공 시 초기 메시지 전송
      this.sendMessage({ message: 'WebSocket Start' });

      // 전체 브로드캐스트 메시지 구독 (모든 사용자가 받음)
      this.client.subscribe('/topic/cat', (message: Message) => {
        const data = JSON.parse(message.body);
        callback(data);
      });

      // 개인 전용 메시지 구독 (세션별로 받음)
      this.client.subscribe('/cat/queue/private', (message: Message) => {
        const data = JSON.parse(message.body);
        callback(data);
      });
    };

    this.client.activate();
  }

  sendMessage(payload: Record<string, unknown>) {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/cat',           // 서버의 @MessageMapping("/cat")으로 전송
        body: JSON.stringify(payload),
      });
    }
  }
}
```

**게임 엔진에서의 WebSocket 활용**

게임 엔진에서는 WebSocket을 통해 받은 데이터를 실시간으로 게임에 반영합니다! 🎮

```typescript
export class Engine {
  private wsClient!: WebSocketClient;
  private catInfo!: T.CatData;
  private allRankings!: T.RankData;
  private myRankings!: T.RankData;

  constructor(canvasId: string) {
    // WebSocket 연결 및 메시지 처리
    this.wsClient = new WebSocketClient();
    this.wsClient.connect((data) => {
      switch (data.code) {
        case "NOT_CAT":
          // 고양이가 없는 경우 - 전체 랭킹만 받음
          this.allRankings = data.top5GamePlayHistory;
          this.start();
          break;
          
        case "CREATE_CAT":
          // 고양이 생성 성공 시 세션에 고양이 정보 저장
          this.catInfo = data.cat;
          break;
          
        case "ALL_DATA":
          // 기존 고양이가 있는 경우 - 모든 데이터 받음
          this.catInfo = data.cat;
          this.allRankings = data.top5GamePlayHistory;
          this.myRankings = data.byCatTop5GamePlayHistory;
          this.start();
          break;
          
        case "UPDATE_ALL_RANK":
          // 실시간 전체 랭킹 업데이트 (모든 사용자에게 브로드캐스트)
          this.allRankings = data.top5GamePlayHistory;
          this.ranking.updateAllRankings(this.ctx, this.allRankings);
          break;
          
        case "UPDATE_MY_RANK":
          // 개인 랭킹 업데이트 (개인 세션에만 전송)
          this.myRankings = data.byCatTop5GamePlayHistory;
          this.ranking.updateMyRankings(this.ctx, this.myRankings);
          break;
      }
    });
  }

  // 게임 오버 시 점수 전송
  private async sendGameScore(): Promise<void> {
    this.wsClient.sendMessage({
      catNo: this.catInfo.no,
      score: this.score
    });
  }
}
```

**개인 메시지 vs 전체 메시지**

WebSocket 통신에서 가장 중요했던 부분은 **메시지를 누구에게 보낼지 결정하는 것**이었어요!

**전체 브로드캐스트 (`/topic/cat`)**  
- 전체 랭킹이 변경되었을 때 → **모든 접속자에게 동시에 전송** 📢
- 새로운 최고 점수가 나왔을 때 모든 플레이어가 실시간으로 확인 가능

<br>

**개인 전용 메시지 (`/cat/queue/private`)**  
- 개인 랭킹이 업데이트되었을 때 → **해당 세션의 사용자에게만 전송** 🔒
- 각자의 개인 기록은 본인만 실시간으로 업데이트 받음
- 세션 ID를 통해 정확한 사용자 식별

<br>

이렇게 구분해서 구현함으로써 **불필요한 네트워크 트래픽을 줄이고** 각 사용자에게 **정말 필요한 정보만** 전달할 수 있었습니다! ⚡

**핵심 포인트**: 서버에서는 Spring의 `SimpMessagingTemplate`을 사용해 특정 세션에만 메시지를 전송하고, 
프론트엔드에서는 두 개의 서로 다른 채널을 구독하여 적절한 데이터를 실시간으로 처리합니다! 💪

## 💾 백엔드 기술적 포인트

### WebSocket을 이용한 실시간 통신

클라이언트와 서버 간의 양방향 실시간 통신을 위해 Spring의 STOMP WebSocket을 구현했습니다.

```java
@MessageMapping("/cat")
@SendTo("/topic/cat")
public Map<String, Object> WebSocketCommunication(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
  String ip = Utils.getWebSocketClientIP(headerAccessor);
  String sessionId = headerAccessor.getUser().getName();

  // 게임 점수 추가
  if (payload.get("catNo") != null && payload.get("score") != null) {
    return addGameScore(payload, sessionId);
  }

  // 고양이 생성
  if (payload.get("catName") != null) {
    String catName = (String) payload.get("catName");
    return createCat(catName, ip, sessionId);
  }
  
  // 초기 데이터
  return prepareInitialData(ip, sessionId);
}
```

### Redis를 활용한 캐싱 시스템

게임 랭킹 데이터는 자주 조회되지만 상대적으로 업데이트가 적은 특성을 가지고 있어 Redis를 사용하여 캐싱했습니다.

```java
// Redis 트랜잭션 실행
redisTemplate.execute(new SessionCallback<List<Object>>() {
  @Override
  public List<Object> execute(RedisOperations operations) {
    try {
      operations.watch("top5GamePlayHistory");
      operations.watch("byCatTop5GamePlayHistory-" + catNo);
      
      // 현재 Redis 값 조회
      String redisTop5GamePlayHistory = redisTemplate.opsForValue().get("top5GamePlayHistory");
      String redisByCatTop5GamePlayHistory = redisTemplate.opsForValue().get("byCatTop5GamePlayHistory-" + catNo);
      
      // 트랜잭션 시작
      operations.multi();
      
      // 데이터 업데이트 로직...
      
      // 트랜잭션 실행
      return operations.exec();
    } catch (Exception e) {
      operations.discard();
      throw e;
    }
  }
});
```

### Repository 패턴 확장

Spring Data JPA의 기본 기능을 확장하여 QueryDSL을 효과적으로 통합했습니다.

```java
// 기본 JpaRepository와 커스텀 인터페이스 결합
public interface GamePlayHistoryRepository extends 
    JpaRepository<GamePlayHistory, Long>, 
    GamePlayHistoryRepositoryCustom {
  // 추가 메서드...
}

// 커스텀 인터페이스 정의
public interface GamePlayHistoryRepositoryCustom {
  List<GamePlayHistoryDto.Top5> findTop5();
  List<GamePlayHistoryDto.Top5> findTop5(Long catNo);
}

// QueryDSL 구현체
@RequiredArgsConstructor
public class GamePlayHistoryRepositoryImpl implements GamePlayHistoryRepositoryCustom {
  private final JPAQueryFactory queryFactory;
  
  // 구현 메서드...
}
```

### QueryDSL을 활용한 타입 안전 쿼리

QueryDSL은 Java 코드로 타입 안전하게 SQL 쿼리를 작성할 수 있게 해주는 프레임워크에요. 본 프로젝트에서는 Spring Data JPA와 함께 QueryDSL을 사용하여 데이터 조회 로직을 구현했습니다.

```java
// 공통 기본 쿼리 생성
private JPAQuery<GamePlayHistoryDto.Top5> getBaseQuery() {
  return queryFactory
    .select(Projections.constructor(
      GamePlayHistoryDto.Top5.class,
      cat.name,
      gamePlayHistory.score,
      gamePlayHistory.createAt
    ))
    .from(gamePlayHistory)
    .innerJoin(cat)
    .on(gamePlayHistory.catNo.eq(cat.no));
}

@Override
public List<GamePlayHistoryDto.Top5> findTop5() {
  return getBaseQuery()
    .orderBy(gamePlayHistory.score.desc())
    .limit(5)
    .fetch();
}
```

## 🔧 개발 과정에서의 도전과 해결책

### 성능 최적화

게임 개발 과정에서 가장 까다로웠던 부분은 바로 성능 최적화였습니다! 🚀 
처음에는 Canvas에 많은 요소들을 동시에 그리다 보니 프레임이 뚝뚝 끊어지는 현상이 발생했어요. 

첫 번째로 적용한 해결책은 **화면 밖의 요소는 그리지 않는 방식의 렌더링 최적화**였습니다. 💡 
사용자가 보지 못하는 영역의 요소들까지 계속 렌더링하는 것은 완전한 자원 낭비였거든요! 
이를 위해 화면에 보이는 요소들만 선별적으로 그리도록 구현했습니다.

마지막으로 **객체 풀링을 통한 메모리 최적화**를 도입했습니다. 🔄 
게임이 진행되면서 장애물들이 계속 생성되고 소멸되는 과정에서 가비지 컬렉션이 자주 발생하여 프레임 드롭이 일어났어요. 
이를 해결하기 위해 미리 생성된 객체들을 재활용하는 풀링 시스템을 구축하여 메모리 할당과 해제로 인한 성능 저하를 크게 줄일 수 있었습니다! 
결과적으로 이러한 최적화 기법들 덕분에 매끄럽고 안정적인 60fps 게임 경험을 제공할 수 있게 되었습니다.

### 데이터 일관성 유지

랭킹 데이터를 Redis에 캐싱하면서 MySQL의 원본 데이터와의 일관성 유지가 중요한 과제였습니다. Redis 트랜잭션을 활용하여 데이터 불일치 문제를 해결했습니다.

## 🎬 마무리

처음으로 진행한 게임 개발 프로젝트였지만, 많은 기술적 도전과 문제 해결 과정을 통해 값진 경험을 얻을 수 있었습니다. 
Canvas API와 WebSocket을 활용한 실시간 게임 개발은 제가 생각했던 것보다 훨씬 재미있고 보람찬 경험이었습니다.

이 프로젝트를 통해 저는 "시작이 반이다"라는 말의 의미를 다시 한번 깨달았습니다. 망설이고 걱정하는 대신 일단 시작해보니, 
생각보다 잘 풀리고 많은 것을 배울 수 있었죠. 특히 컴포넌트 기반 설계와 최적화 기법을 적용하는 과정이 매우 유익했습니다.

하단에 Cat Run 게임을 플레이할 수 있는 URL을 남겨 놓겠습니다! 재미있게 플레이 해보시고 피드백은 언제든지 환영합니다! 🙏

[Cat Run 게임 플레이하기](https://cat-run.seunghoney.com)
```toc
``` 
