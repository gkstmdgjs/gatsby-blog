---
emoji: 🔄
title: 'Cat Run 백엔드, Spring Boot에서 NestJS로 갈아타다'
date: '2026-01-11'
categories: featured-Make Backend NestJS Spring
---

[Cat Run 게임 개발기](/5-cat-run) 글에서는 게임 자체와 프론트엔드/백엔드 구현을 두루 다뤘는데요,
사실 이 백엔드는 처음부터 NestJS 로 만든 게 아니에요. **원래는 Spring Boot 3.4.4 (Java 21) 로 작성되어 있었고, 어느 날 큰 결심을 하고 NestJS 11 + Prisma + Socket.IO 로 전면 전환** 했습니다. 🔄

이번 글에서는 "왜 Spring Boot 로 시작했는지", "왜 결국 NestJS 로 바꾸기로 결정했는지", 그리고 "옮기고 나니 뭐가 좋아졌는지" 를 솔직하게 회고해보려고 해요.
누군가는 비슷한 갈림길에 서 있을 수도 있으니까요. 🚦

## 🌱 왜 Spring Boot 로 시작했나 — 학습이 목적이었어요

가장 솔직한 이유부터 말씀드리면, **Spring Boot 를 더 깊이 공부해보고 싶다** 는 마음이 가장 컸어요. ☕
사이드 프로젝트는 결과물도 중요하지만, **무언가를 제대로 익히는 가장 빠른 방법은 직접 운영해보는 것** 이라고 생각하거든요.

그래서 처음 잡은 그림은 이랬어요.

- **Spring Boot 3.4.4 + Java 21** — 안정적이고 자료가 풍부한 조합
- **JPA + QueryDSL** — ORM 과 동적 쿼리를 모두 만져보고 싶었어요
- **STOMP over WebSocket + SockJS** — Spring 공식 가이드에서 안내하는 실시간 통신 방식
- **MySQL 8.0 + Redis** — 영속 저장소 + 랭킹 캐시
- **Gradle / Lombok / Bean Validation** — Spring 표준 도구들

`@Controller`, `@Service`, `@Repository`, `@Transactional`, `@MessageMapping`... 평소에 책이나 강의로만 보던 어노테이션들을 **직접 게임 서버에 박아 넣어보면서 익히는 재미** 가 있었습니다. 🧪
실제로 1주 만에 고양이 생성·점수 저장·랭킹 조회 API 가 다 돌아갔고, JPA 영속성 컨텍스트나 STOMP 의 메시지 브로커 흐름도 코드를 만지면서 자연스럽게 손에 익었어요.

그래서 **Spring Boot 자체에 대한 불만은 없었어요.** 학습 목적으로는 충분히 제 역할을 해줬거든요.
다만, 학습을 어느 정도 마치고 운영 단계로 넘어오면서 **"이 프로젝트의 성격과 Spring 의 강점이 잘 맞는가?"** 라는 다른 질문이 자라기 시작했습니다. 🌱

## ⚠️ 첫 번째 균열 — 프론트엔드와의 프로토콜 불화

Cat Run 의 프론트엔드는 **`socket.io-client` 4.x** 를 쓰고 있었어요.
캔버스 게임에서 실시간 랭킹을 받으려면 가벼운 메시지 채널 하나면 충분해서, 처음부터 고민 없이 socket.io 를 골랐거든요.

그런데 **Spring 의 STOMP/SockJS 는 socket.io 와 와이어 프로토콜이 완전히 다릅니다.** 🚧

```text
프론트:  socket.io-client  ── socket.io 프로토콜 ──▶ ???
백엔드:  STOMP + SockJS    ◀── STOMP 프레임 ───── ???
```

실제로 Spring 시절의 `WebSocketConfig` 는 이렇게 생겼었어요.

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
  @Override
  public void configureMessageBroker(MessageBrokerRegistry config) {
    config.setApplicationDestinationPrefixes("/app");
    config.setUserDestinationPrefix("/cat");
    config.enableSimpleBroker("/topic", "/queue");
  }

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/ws")
            .setAllowedOrigins(/* ... */)
            .withSockJS();   // ← SockJS 핸드셰이크
  }
}
```

처음엔 "그래도 SockJS 도 WebSocket 위에서 도는데, 어떻게든 맞물리겠지" 싶었어요.
하지만 양쪽이 핸드셰이크부터 메시지 프레이밍까지 다 다르기 때문에, 결국 **둘 중 하나를 포기하거나 중간에 변환 레이어를 두는 수밖에 없었습니다.**

선택지는 셋 정도였어요.

| 선택지 | 현실적인 비용 |
|---|---|
| 프론트를 STOMP 로 바꾼다 (`@stomp/stompjs` 등) | 캔버스 게임 코드와 어울리는 가벼운 클라이언트가 아님 + 학습 비용 |
| 백엔드 앞에 socket.io 어댑터를 따로 둔다 | 인프라가 한 단계 더 늘고 디버깅 표면적도 늘어남 |
| 백엔드를 socket.io 와 자연 호환되는 스택으로 바꾼다 | 백엔드 다시 짜야 함 — 가장 큰 결심 |

게임의 본질은 **"모니터 주사율과 무관하게 일정한 속도로 돌아가는 캔버스 위에서, 끊김 없이 실시간 랭킹을 주고받는 것"** 이었기 때문에, 프론트의 socket.io 는 양보하고 싶지 않았어요.
(프론트는 이전엔 `requestAnimationFrame` 호출 주기에 게임 속도가 그대로 묶여 있었지만, 지금은 **고정 timestep + accumulator 패턴** 으로 옮겨서 144Hz 모니터든 60Hz 모니터든 같은 속도로 돌게 만들어 둔 상태였어요.)
어댑터 레이어도 결국 운영해야 할 컴포넌트가 늘어나는 일이라, 사이드 프로젝트엔 사치였고요. 그래서 자연스럽게 세 번째 선택지가 후보에 올라왔습니다.

## 🐛 두 번째 균열 — Race Condition 처리의 미묘한 빈틈

Spring 시절 `CatService.updateHighestScore` 는 이렇게 생겼었어요.

```java
@Transactional
public CatDto.Main updateHighestScore(CatDto.UpdateHighestScoreRequest req) {
  Cat cat = catRepository.findById(req.getNo())
      .orElseThrow(NotFoundCatException::new);

  Integer previousScore = cat.getHighestScore();
  cat.updateHighestScore(req.getHighestScore());   // 내부에서 score > highestScore 비교 후 setter
  return CatDto.Main.of(cat);
}

// Cat.java
public void updateHighestScore(Integer score) {
  if (score > this.highestScore) {
    this.highestScore = score;
    this.highestScoreAt = LocalDateTime.now();
  }
}
```

언뜻 보면 `if (score > this.highestScore)` 가 있어서 안전해 보입니다.
하지만 잘 들여다보면 **read → compare → write** 패턴이라 **두 세션이 동시에 점수를 갱신할 때 lost update** 가 발생할 수 있어요. 😨

```text
시각  세션 A (score=1000)            세션 B (score=1200)
 t1   findById → highestScore=900
 t2                                   findById → highestScore=900
 t3   1000 > 900 ✅ → 1000 으로 set
 t4                                   1200 > 900 ✅ → 1200 으로 set
 t5   commit                          commit
```

이 경우는 운 좋게 1200 이 나중에 커밋돼서 결과적으로 맞지만, 순서가 뒤집히면 **1200 이 먼저 set 되고 그 위에 1000 이 덮어써져서 최고점이 1000 으로 떨어집니다.**
서비스 규모가 작을 땐 거의 안 보이지만, 한 사람이 여러 탭을 띄우거나 봇이 점수를 빠르게 던지면 바로 재현돼요.

해결책은 여럿이었어요.

- `@Lock(PESSIMISTIC_WRITE)` 로 행 잠금
- `@Version` 으로 optimistic locking
- 네이티브 쿼리로 `UPDATE ... WHERE highest_score < :score`

다 가능한 방법이지만, **JPA 위에서 깔끔하게 표현하기가 의외로 번거롭습니다.**
optimistic locking 은 충돌 시 `OptimisticLockException` 이 터지고, 이걸 retry 하는 코드를 어디에 둘지부터 고민이 시작돼요. 비관적 락은 트래픽이 늘면 병목이 되고요.

이 즈음 "점수 한 번 갱신하자고 매번 락 전략을 고르는 게 이 게임의 본질인가?" 라는 회의가 들기 시작했습니다. 🤔

## 🪟 세 번째 균열 — 풀스택 컨텍스트 스위칭 비용

Cat Run 은 혼자 만드는 사이드 프로젝트였어요. 한 사람이 프론트와 백엔드를 동시에 들여다봐야 했죠.

- 프론트: **TypeScript + Vite + Canvas + socket.io-client**
- 백엔드: **Java 21 + Spring Boot + JPA + STOMP**

화면 한 번 만지고 백엔드 한 번 만지는 흐름이 반복되다 보니, **언어를 매번 갈아타는 비용** 이 생각보다 컸습니다.
특히 메시지 페이로드 타입이 자주 바뀌었는데, 한쪽은 `interface CatData { ... }`, 다른 한쪽은 `public class CatDto { ... }` 라서 **같은 모양의 데이터를 두 언어로 두 번 정의** 해야 했어요. 🪞

타입을 공유하는 OpenAPI 클라이언트 자동 생성도 검토해봤지만, WebSocket 메시지엔 잘 맞지 않았고, 결국 손으로 두 번씩 적게 되더라고요.

## 🧭 NestJS 로 갈아타기로 결정한 이유

Spring Boot 학습을 어느 정도 마치고 자연스럽게 다음 학습 주제로 **NestJS** 를 만지기 시작한 게 결정적이었어요. 📚
공식 문서를 읽다 보니 어디서 많이 본 그림이 펼쳐졌습니다.

- `@Module` ↔ `@Configuration` + 컴포넌트 스캔
- `@Injectable` ↔ `@Service`
- `@Controller @MessageMapping` ↔ `@WebSocketGateway @SubscribeMessage`
- `class-validator` ↔ Bean Validation
- `@RestControllerAdvice` ↔ `GlobalExceptionFilter`
- 생성자 주입 + DI 컨테이너 — 그대로

**"Spring 으로 짜던 머릿속 그림을 거의 그대로 옮길 수 있겠는데?"** 라는 감이 왔어요.
처음 만지는 프레임워크인데도 1:1 로 매핑되는 개념이 많아서, 새로 배운다기보단 **방언만 바꿔 적는 느낌** 이었거든요. 🔁

여기에 위에서 정리한 세 가지 균열을 다시 가져와서 NestJS 스택과 맞춰보니, 모든 항목이 깔끔하게 답이 떨어졌습니다.

| 균열 | NestJS 스택의 응답 |
|---|---|
| 프론트와 프로토콜 불화 | `@nestjs/platform-socket.io` 가 프론트 `socket.io-client` 와 **같은 4.x 위에서 자연 호환** |
| Race condition 처리의 번거로움 | Prisma 의 **조건부 atomic update** (`where: { highestScore: { lt: score } }`) 로 한 줄에 처리 |
| 풀스택 컨텍스트 스위칭 | TypeScript 한 언어로 통일 + DTO 인터페이스를 양쪽에서 **타입 동기화 가능** |

정리하자면 결심의 흐름은 이랬어요.

> **"Spring 학습 → NestJS 학습 → 둘이 너무 닮아 있음을 체감 → 그렇다면 이 게임 프로젝트의 성격엔 NestJS 가 더 잘 맞겠다"**

특히 Cat Run 처럼 **실시간 WebSocket 통신이 핵심인 게임 서버** 에서는, 프론트와 같은 socket.io 위에서 메시지를 주고받을 수 있다는 것만으로도 구조적인 이점이 너무 컸어요. 🎮
"익숙해서 안 바꾼다" 보다 "프로젝트 성격에 더 맞는 도구로 옮긴다" 가 더 좋은 결정이라고 판단한 순간이었습니다!

## 🛠️ 옮긴 뒤 가장 좋아진 것들

### 1) 프론트 구독 코드가 절반이 됐다

STOMP 시절 프론트엔드는 **두 채널** 을 따로 구독해야 했어요.

```typescript
// (구) STOMP 시절 - 의사코드
client.subscribe('/topic/cat', handleBroadcast);    // 전체 랭킹
client.subscribe('/queue/cat', handlePersonal);     // 개인 랭킹
```

전체 브로드캐스트는 `/topic`, 개인 메시지는 `/queue` 로 분리되어 있었기 때문이에요.
서버 쪽도 `@SendTo("/topic/cat")` 으로 브로드캐스트하고, 개인 메시지는 `SimpMessagingTemplate.convertAndSendToUser(...)` 로 따로 보내야 해서 **송수신 양쪽 모두 두 갈래** 의 코드를 유지해야 했죠.

NestJS Gateway 로 옮기고 나서는 **단일 `'cat'` 이벤트만 구독** 하면 됐습니다.
누구에게 보낼지는 서버가 `server.emit` 인지 `client.emit` 인지로 결정해주거든요.

```typescript
// (현) socket.io
this.socket.on('cat', (data) => {
  switch (data.code) {
    case 'UPDATE_ALL_RANK': /* 전체 브로드캐스트 결과 */ break;
    case 'UPDATE_MY_RANK':  /* 개인 메시지 결과 */ break;
    /* ... */
  }
});
```

**송신 대상 결정 책임이 온전히 서버로 모아진다는 게** 가장 마음에 들었어요. 프론트는 그냥 한 채널을 듣고, 코드 필드로 분기만 하면 끝이니까요. ✨

### 2) Race condition 한 줄로 끝났다

Prisma 는 `where` 절에 비교 조건을 그대로 넣을 수 있어서, **read → compare → write 자체를 한 SQL 로** 합칠 수 있어요.

```typescript
async updateHighestScore(catNo: number, score: number) {
  try {
    const cat = await this.prisma.cat.update({
      // ✅ DB 단에서 atomic 하게 비교 + 갱신
      where: { no: catNo, highestScore: { lt: score } },
      data: { highestScore: score, highestScoreAt: new Date() },
    });
    return { updated: true, cat };
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') {
      // 매치 행 없음 = 이미 더 높은 값이 존재 → 갱신 스킵
      const existing = await this.prisma.cat.findUnique({ where: { no: catNo } });
      if (!existing) throw new NotFoundCatException(`Cat not found: ${catNo}`);
      return { updated: false, cat: existing };
    }
    throw error;
  }
}
```

`P2025` 는 "조건에 맞는 row 가 없어 update 대상 0건" 일 때 Prisma 가 던지는 에러인데, 이걸 **"이미 더 높은 점수가 들어가 있다" 시그널** 로 활용했어요.
**분산 락도, optimistic locking 도 필요 없이 DB 자체를 single source of truth 로 두는 흐름** 이 자연스럽게 만들어졌습니다.

JPA 로도 비슷한 걸 못 하는 건 아니지만, 네이티브 쿼리를 따로 빼야 하거나 `@Modifying` 어노테이션 등을 붙여야 해서 한 호흡이 더 들어요. Prisma 는 `where` 한 줄로 같은 일을 해줍니다.

### 3) 스키마 / 인덱스를 코드로 형상관리

JPA `ddl-auto: update` 시절엔 **운영 스키마와 엔티티의 변경이 어긋나는 작은 사고** 가 꽤 있었어요.
인덱스가 빠진 채로 배포되거나, 이름이 살짝 다른 컬럼이 생기거나요. 마이그레이션 도구를 따로 붙일까 고민하다가 미뤄진 항목이기도 했습니다.

Prisma 로 옮기고 나선 **`schema.prisma` 한 파일에 모델·관계·인덱스가 다 들어갑니다.**

```prisma
model GamePlayHistory {
  no       Int      @id @default(autoincrement())
  catNo    Int      @map("cat_no")
  score    Int
  createAt DateTime @default(now()) @map("create_at")

  cat Cat @relation(fields: [catNo], references: [no])

  @@index([catNo, score(sort: Desc)], map: "idx_history_cat_score")
  @@map("game_play_history")
}
```

`prisma migrate` 가 SQL 을 자동으로 만들어주고, **인덱스까지 PR 로 리뷰 가능** 해졌어요.
"DB 와 코드 사이의 lag 가 없다" 는 게 운영하는 입장에서 정말 안심됩니다! 💚

### 4) 글로벌 예외 필터로 응답 포맷 통일

이건 Spring 시절에도 잘 되어 있던 부분인데, NestJS 에서도 거의 똑같이 옮길 수 있었어요.

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    if (exception instanceof BaseException) {
      response.status(exception.getStatus()).json({
        code: exception.getStatus(),
        message: exception.message,
        errorCode: exception.errorCode,
        data: null,
      });
      return;
    }
    /* 그 외 예외는 500 으로 일괄 변환 */
  }
}
```

`@RestControllerAdvice` ↔ `@Catch()` + `ExceptionFilter` 가 거의 1:1 대응이라, 도메인 예외 클래스(`NotFoundCatException`, `AlreadyExistException` 등) 는 **이름과 동작을 그대로 유지** 한 채 옮길 수 있었습니다.
"새 프레임워크 = 새 추상화 다 배워야 함" 이 아니라는 게 큰 위안이었어요. ✨

## 🗺️ Spring → NestJS 매핑 한눈에 보기

옮기면서 만든 매핑 표를 정리해두면 두고두고 도움이 됩니다.

| Spring Boot | NestJS |
|---|---|
| `@SpringBootApplication` | `NestFactory.create(AppModule)` |
| `@Controller @MessageMapping` (STOMP) | `@WebSocketGateway @SubscribeMessage` (socket.io) |
| `@Service @Transactional` `@RequiredArgsConstructor` | `@Injectable()` + 생성자 주입 |
| `@Slf4j log.info(...)` | `private readonly logger = new Logger(Class.name); logger.log(...)` |
| `@Entity @Getter` | Prisma 모델 + 자동 생성 타입 |
| `JpaRepository.findById/findByXxx` | `prisma.cat.findUnique / findFirst` |
| `JPAQueryFactory + Projections` | `prisma.gamePlayHistory.findMany + select / include` |
| `BaseException + RestControllerAdvice` | `BaseException`(`HttpException` 상속) + `GlobalExceptionFilter` |
| `Bean Validation @NotBlank @Size` | `class-validator @IsNotEmpty @MaxLength` |
| `StringRedisTemplate` | `RedisService` (ioredis 래핑) |
| `Lombok` | NestJS 데코레이터 + 명시적 클래스 |
| Gradle | yarn |

이 표를 보면서 **"같은 개념을 다른 단어로 부르는 것뿐"** 이라는 감각이 분명해졌어요. 그래서 이전 부담이 생각보다 크지 않았습니다. 🧭

## 💡 그래서 Spring Boot 학습은 헛수고였을까?

전혀요. 오히려 **Spring Boot 로 한 번 짜본 경험이 NestJS 전환을 빠르게 만들어준 가장 큰 자산** 이었어요. 🎓

- 모듈 / 서비스 / 리포지토리 / DTO / 예외 필터 / 전역 검증 같은 **계층 분리의 감각** 은 Spring 에서 먼저 익혔고,
- 그 위에 NestJS 라는 새 옷을 입히는 작업이었기 때문에, **모듈 구조와 책임 경계** 가 첫 줄부터 흔들리지 않았습니다.
- 만약 NestJS 로 바로 시작했다면 "이걸 왜 모듈로 쪼개야 하지?" 부터 헷갈렸을 것 같아요.

그래서 마이그레이션은 단순히 "스택을 갈아탔다" 가 아니라, **두 프레임워크의 공통 골격을 체득하는 과정** 이었다고 정리하고 싶어요.
같은 개념이 어느 정도로 보편적인지 보이기 시작하면, 다음에 또 다른 백엔드 프레임워크를 만나도 덜 두려울 거고요. 🧱

## 🎯 마무리 — 마이그레이션이 남긴 교훈

이번 경험에서 얻은 것 세 가지를 정리하면 이래요.

1. **스택은 "프로젝트 성격" 에 맞춰 고르자.** Spring Boot 가 나빠서 옮긴 게 아니라, **실시간 WebSocket + 풀스택 1인 + TypeScript 프론트** 라는 Cat Run 의 성격엔 NestJS 가 더 잘 맞았어요. 학습용 스택과 운영용 스택은 분리해서 생각해도 괜찮습니다.
2. **동시성 가드는 프레임워크가 표현하기 쉬운 도구를 고르자.** 같은 race condition 도 Prisma 의 조건부 update 처럼 **DB 가 잘하는 일에 위임** 할 수 있는 환경에선 한 줄에 끝납니다.
3. **마이그레이션은 무서운 단어가 아니다.** Spring ↔ NestJS 처럼 멘탈 모델이 비슷한 스택 사이라면, 매핑 표를 만들고 도메인 단위로 옮기다 보면 의외로 빠르게 끝나요. **두려움보다 정리가 더 중요한 작업** 입니다!

혹시 비슷한 갈림길에 서 있다면, 한 번 정리해보세요. **"이 균열이 일주일에 몇 번 나를 멈추게 하는가?"** 만 세어봐도 답이 보일 거예요. 🚦

플레이는 여기서 가능해요 🎮 [Cat Run 플레이](https://cat-run.seunghoney.com) 🐱

```toc
```
